import { createHash } from "node:crypto";
import { BlobPreconditionFailedError, get, list, put } from "@vercel/blob";
import type { Guide, ResearchJob } from "./domain";

type RuntimeEnv = {
  OPENAI_API_KEY?: string;
  AI_GATEWAY_API_KEY?: string;
  VERCEL_OIDC_TOKEN?: string;
  RESEARCH_MODEL?: string;
  RESEARCH_PROVIDER?: string;
  BLOB_READ_WRITE_TOKEN?: string;
  BLOB_STORE_ID?: string;
  RESEARCH_ACCESS_TOKEN?: string;
};

export const runtimeEnv = (): RuntimeEnv => process.env as RuntimeEnv;

const ROOT = "charter/v1/";
const GUIDE_PREFIX = `${ROOT}guides/`;
const IO_TIMEOUT_MS = 10_000;
const SITE_HOURLY_LIMIT = 40;
const OWNER_HOURLY_LIMIT = 8;
const QUOTA_ATTEMPTS = 6;
const validId = (id: string) => /^[A-Za-z0-9_-]{1,160}$/.test(id);

function storageAuth(): { token?: string; storeId?: string } {
  const { BLOB_READ_WRITE_TOKEN: token, BLOB_STORE_ID: storeId } = runtimeEnv();
  // Connected Vercel stores use project-scoped OIDC, which the SDK resolves
  // from the request context/runtime. Local development may use a server token.
  if (storeId) return { storeId };
  if (token) return { token };
  throw new Error("Persistent research storage is unavailable. Connect a private Vercel Blob store.");
}

function jsonOptions() {
  return {
    access: "private" as const,
    ...storageAuth(),
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    abortSignal: AbortSignal.timeout(IO_TIMEOUT_MS),
  };
}

// Mutable jobs and quota counters must bypass the Blob CDN after overwrites.
// https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage
async function readRecord<T>(pathname: string, timeoutMs = IO_TIMEOUT_MS): Promise<{ value: T; etag: string } | null> {
  const result = await get(pathname, {
    access: "private",
    ...storageAuth(),
    useCache: false,
    abortSignal: AbortSignal.timeout(timeoutMs),
  });
  if (!result) return null;
  if (result.statusCode !== 200 || !result.stream || !result.blob.etag) {
    throw new Error("Research storage returned an unreadable record.");
  }
  return { value: await new Response(result.stream).json() as T, etag: result.blob.etag };
}

export async function storageAvailable(): Promise<boolean> {
  try {
    await list({ prefix: ROOT, limit: 1, ...storageAuth(), abortSignal: AbortSignal.timeout(5000) });
    return true;
  } catch { return false; }
}

type StoredJob = { schemaVersion: 1; ownerKey: string; inputHash: string; job: ResearchJob };

export async function saveJob(job: ResearchJob, ownerKey: string, inputHash: string): Promise<void> {
  if (!validId(job.id)) throw new Error("Invalid research job identifier.");
  const record: StoredJob = { schemaVersion: 1, ownerKey, inputHash, job };
  await put(`${ROOT}jobs/${job.id}.json`, JSON.stringify(record), { ...jsonOptions(), allowOverwrite: true });
}

export async function readJob(id: string): Promise<ResearchJob | null> {
  if (!validId(id)) return null;
  const record = await readRecord<StoredJob>(`${ROOT}jobs/${id}.json`);
  if (!record) return null;
  if (record.value.schemaVersion !== 1 || record.value.job?.id !== id) throw new Error("Research job storage is invalid.");
  return record.value.job;
}

export async function saveGuide(guide: Guide): Promise<void> {
  if (!validId(guide.id)) throw new Error("Invalid research guide identifier.");
  // A saved guide is an immutable evidence snapshot, including its scenario.
  await put(`${GUIDE_PREFIX}${guide.id}.json`, JSON.stringify(guide), { ...jsonOptions(), allowOverwrite: false });
}

export async function readGeneratedGuide(id: string): Promise<Guide | null> {
  if (!validId(id)) return null;
  const record = await readRecord<Guide>(`${GUIDE_PREFIX}${id}.json`);
  if (!record) return null;
  if (record.value.schemaVersion !== "1.0" || record.value.id !== id || record.value.origin !== "generated") {
    throw new Error("Research guide storage is invalid.");
  }
  return record.value;
}

export async function listGeneratedGuides(): Promise<Guide[]> {
  // Blob lists by pathname, not creation time. Scan metadata before selecting
  // the latest 50 so UUID ordering cannot hide recently saved research.
  const recent: { pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: GUIDE_PREFIX, limit: 1000, cursor,
      ...storageAuth(), abortSignal: AbortSignal.timeout(IO_TIMEOUT_MS),
    });
    recent.push(...page.blobs.filter(blob => blob.pathname.endsWith(".json")));
    recent.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    recent.length = Math.min(recent.length, 50);
    cursor = page.hasMore ? page.cursor : undefined;
    if (page.hasMore && !cursor) throw new Error("Research catalog pagination is unavailable.");
  } while (cursor);

  const guides: (Guide | null)[] = new Array(recent.length).fill(null);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, recent.length) }, async () => {
    while (next < recent.length) {
      const index = next++;
      const id = recent[index].pathname.slice(GUIDE_PREFIX.length, -5);
      guides[index] = await readGeneratedGuide(id);
    }
  }));
  return guides.filter((guide): guide is Guide => guide !== null);
}

type QuotaRecord = {
  schemaVersion: 1;
  hour: string;
  siteCount: number;
  owners: Record<string, number>;
  expiresAt: string;
};

function validQuota(value: QuotaRecord, hour: string): boolean {
  return value?.schemaVersion === 1 && value.hour === hour &&
    Number.isSafeInteger(value.siteCount) && value.siteCount >= 0 && value.siteCount <= SITE_HOURLY_LIMIT &&
    Boolean(value.owners) && typeof value.owners === "object" && !Array.isArray(value.owners) &&
    Object.entries(value.owners).every(([key, count]) => /^[a-f0-9]{64}$/.test(key) &&
      Number.isSafeInteger(count) && count >= 0 && count <= OWNER_HOURLY_LIMIT) &&
    Object.values(value.owners).reduce((sum, count) => sum + count, 0) === value.siteCount;
}

// Both limits live in one document so a successful conditional write reserves
// a site and owner slot atomically across concurrent serverless instances.
// https://vercel.com/docs/vercel-blob#conditional-writes
export async function takeResearchQuota(owner: string): Promise<boolean> {
  if (!owner || owner.length > 1000) throw new Error("Research quota caller is invalid.");
  const ownerHash = createHash("sha256").update(owner).digest("hex");
  const hour = new Date().toISOString().slice(0, 13);
  const pathname = `${ROOT}quotas/${hour}.json`;

  for (let attempt = 0; attempt < QUOTA_ATTEMPTS; attempt++) {
    const existing = await readRecord<QuotaRecord>(pathname, 5000);
    if (existing && !validQuota(existing.value, hour)) throw new Error("Research quota storage is invalid.");
    const quota: QuotaRecord = existing?.value ?? {
      schemaVersion: 1, hour, siteCount: 0, owners: {},
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    const ownerCount = quota.owners[ownerHash] ?? 0;
    if (quota.siteCount >= SITE_HOURLY_LIMIT || ownerCount >= OWNER_HOURLY_LIMIT) return false;
    quota.siteCount++;
    quota.owners[ownerHash] = ownerCount + 1;
    try {
      await put(pathname, JSON.stringify(quota), {
        ...jsonOptions(), abortSignal: AbortSignal.timeout(5000),
        allowOverwrite: Boolean(existing),
        ...(existing ? { ifMatch: existing.etag } : {}),
      });
      return true;
    } catch (error) {
      // A missing-record create can race another create. Re-read it without
      // relying on an SDK-specific "already exists" message. Other write
      // failures and exhausted contention fail closed with service-unavailable
      // errors, rather than incorrectly reporting that a user exhausted quota.
      if (existing && !(error instanceof BlobPreconditionFailedError)) throw error;
      if (attempt + 1 < QUOTA_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1) + Math.random() * 40));
      }
    }
  }
  throw new Error("Research quota reservation is temporarily unavailable. Try again shortly.");
}
