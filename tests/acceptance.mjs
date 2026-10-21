#!/usr/bin/env node
/**
 * Dependency-free HTTP contract checks for Charter.
 * node tests/acceptance.mjs http://localhost:3000
 * node tests/acceptance.mjs http://localhost:3000 --live=https://developer.todoist.com
 * node tests/acceptance.mjs http://localhost:3000 --saved=<guide ID> --job=<job ID>
 * Optional live research performs a real request and can incur configured model usage.
 */
import assert from "node:assert/strict";

const argumentsList = process.argv.slice(2);
const base = (argumentsList.find((arg) => /^https?:\/\//.test(arg)) || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const liveArgument = argumentsList.find((arg) => arg.startsWith("--live="));
const liveInput = liveArgument?.slice("--live=".length);
const savedId = argumentsList.find((arg) => arg.startsWith("--saved="))?.slice("--saved=".length);
const savedJobId = argumentsList.find((arg) => arg.startsWith("--job="))?.slice("--job=".length);
const results = [];
const context = { audience: "external", capability: "read", stage: "launching" };
const contextQuery = new URLSearchParams(context).toString();
let rpcId = 0;
let catalog;
let canonical;
let status;

async function request(path, init = {}, timeout = 30000) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    signal: AbortSignal.timeout(timeout),
    redirect: "manual",
    headers: { ...init.headers },
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { response, body, text };
}

async function json(path, init) {
  const result = await request(path, init);
  assert.equal(result.response.ok, true, `${path}: ${result.response.status} ${result.text.slice(0, 240)}`);
  assert.match(result.response.headers.get("content-type") || "", /json/i, `${path}: expected JSON`);
  assert.equal(typeof result.body, "object", `${path}: expected structured body`);
  return result.body;
}

async function rpc(method, params = {}) {
  const result = await json("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
  assert.equal(result.jsonrpc, "2.0");
  assert.equal(result.id, rpcId);
  assert.equal(result.error, undefined, JSON.stringify(result.error));
  assert.ok(result.result, `No result from ${method}`);
  return result.result;
}

function structured(result) {
  if (result.structuredContent !== undefined) return result.structuredContent;
  const block = result.content?.find((item) => item.type === "text");
  assert.ok(block?.text, "Tool should provide structured output or JSON text");
  return JSON.parse(block.text);
}

function validateGuide(guide) {
  assert.equal(guide.schemaVersion, "1.0");
  for (const field of ["id", "providerId", "name", "version", "checkedAt", "summary", "nextAction"]) {
    assert.equal(typeof guide[field], "string", `${field} must be a string`);
    assert.ok(guide[field].trim(), `${field} must be meaningful`);
  }
  assert.ok(["reviewed", "generated"].includes(guide.origin));
  assert.ok(["complete", "partial"].includes(guide.researchStatus));
  assert.ok(["internal", "pilot", "external"].includes(guide.context.audience));
  assert.ok(["read", "write"].includes(guide.context.capability));
  assert.ok(["exploring", "testing", "launching"].includes(guide.context.stage));
  for (const field of ["prerequisites", "gates", "steps", "blockers", "sources", "unknowns"]) assert.ok(Array.isArray(guide[field]), `${field} must be an array`);
  assert.ok(guide.sources.length > 0, "A guide must preserve its evidence");
  const sourceIds = new Set(guide.sources.map((source) => source.id));
  assert.equal(sourceIds.size, guide.sources.length, "Source IDs must be unique");
  for (const source of guide.sources) {
    assert.ok(/^https:\/\//.test(source.url), `Expected HTTPS evidence URL: ${source.url}`);
    assert.ok(Number.isFinite(Date.parse(source.checkedAt)), `Invalid source date: ${source.checkedAt}`);
    assert.ok(["official", "practical"].includes(source.kind));
  }
  for (const estimate of [guide.effort, guide.waiting]) {
    assert.ok(["provider", "editorial", "unknown"].includes(estimate.basis), "Estimate basis must be explicit");
    assert.ok(estimate.detail, "Estimate needs explanatory context");
    if (estimate.basis === "provider") assert.ok(estimate.sourceIds.length, "Provider estimates need a source");
  }
  const stepIds = new Set(guide.steps.map((step) => step.id));
  assert.equal(stepIds.size, guide.steps.length, "Step IDs must be unique");
  for (const item of [...guide.gates, ...guide.steps, ...guide.blockers, guide.effort, guide.waiting]) {
    for (const id of item.sourceIds || []) assert.ok(sourceIds.has(id), `Dangling source reference: ${id}`);
  }
  for (const step of guide.steps) {
    assert.ok(["developer", "agent", "admin", "provider"].includes(step.actor));
    assert.ok(step.completion, `Step ${step.id} needs completion evidence`);
    for (const dependency of step.dependsOn) {
      assert.ok(stepIds.has(dependency), `Missing dependency ${dependency}`);
      assert.notEqual(dependency, step.id, "A step cannot depend on itself");
    }
  }
  const visiting = new Set();
  const done = new Set();
  function visit(id) {
    assert.ok(!visiting.has(id), `Dependency cycle at ${id}`);
    if (done.has(id)) return;
    visiting.add(id);
    for (const dependency of guide.steps.find((step) => step.id === id).dependsOn) visit(dependency);
    visiting.delete(id);
    done.add(id);
  }
  guide.steps.forEach((step) => visit(step.id));
  if (guide.researchStatus === "partial") assert.ok(guide.unknowns.length, "Partial guidance must expose unknowns");
}

async function check(name, run) {
  const started = Date.now();
  try {
    await run();
    results.push({ name, passed: true, ms: Date.now() - started });
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    results.push({ name, passed: false, ms: Date.now() - started, error: error.message });
    process.stderr.write(`FAIL ${name}: ${error.message}\n`);
  }
}

console.log(`Charter acceptance target: ${base}`);

await check("Human application is served as HTML", async () => {
  const result = await request("/");
  assert.equal(result.response.ok, true);
  assert.match(result.response.headers.get("content-type") || "", /html/i);
  assert.match(result.text, /Charter/i);
});

await check("Curated catalog contains three genuinely distinct provider records", async () => {
  catalog = await json(`/api/guides?${contextQuery}`);
  assert.ok(Array.isArray(catalog.guides));
  for (const provider of ["github", "gmail", "slack"]) {
    const guide = catalog.guides.find((item) => item.providerId === provider || item.id === provider);
    assert.ok(guide, `Missing ${provider}`);
    validateGuide(guide);
    assert.equal(guide.origin, "reviewed");
    assert.deepEqual(guide.context, context);
  }
  const summaries = new Set(catalog.guides.filter((item) => ["github", "gmail", "slack"].includes(item.providerId)).map((item) => item.summary));
  assert.equal(summaries.size, 3, "Curated examples should not reuse generic summaries");
});

await check("Search resolves a known app and has an honest empty result", async () => {
  const found = await json("/api/guides?q=slack");
  assert.ok(found.guides.some((guide) => guide.providerId === "slack"));
  const missing = await json("/api/guides?q=fieldguide-no-such-provider-6af470");
  assert.deepEqual(missing.guides, []);
});

await check("Context changes the Slack distribution path and survives retrieval", async () => {
  const internal = await json("/api/guides/slack?audience=internal&capability=read&stage=testing");
  const external = await json(`/api/guides/slack?${contextQuery}`);
  validateGuide(internal);
  validateGuide(external);
  assert.equal(internal.context.audience, "internal");
  assert.equal(internal.context.stage, "testing");
  assert.deepEqual(external.context, context);
  assert.notDeepEqual(internal.gates, external.gates, "Audience must change applicable gate guidance");
  canonical = external;
});

await check("Capability changes the Gmail plan without losing explicit context", async () => {
  const read = await json("/api/guides/gmail?audience=external&capability=read&stage=launching");
  const write = await json("/api/guides/gmail?audience=external&capability=write&stage=launching");
  assert.equal(read.context.capability, "read");
  assert.equal(write.context.capability, "write");
  assert.notEqual(JSON.stringify({ summary: read.summary, steps: read.steps, gates: read.gates }), JSON.stringify({ summary: write.summary, steps: write.steps, gates: write.gates }), "Capability should alter actionable guidance");
});

await check("Markdown preserves the canonical guide, context, evidence, and unknowns", async () => {
  canonical ||= await json(`/api/guides/slack?${contextQuery}`);
  const result = await request(`/api/guides/slack/markdown?${contextQuery}`);
  assert.equal(result.response.ok, true);
  assert.match(result.response.headers.get("content-type") || "", /markdown|text\/plain/i);
  for (const value of [canonical.name, canonical.version, canonical.context.audience, canonical.context.capability, canonical.context.stage, canonical.nextAction]) assert.ok(result.text.includes(value), `Markdown lost: ${value}`);
  for (const source of canonical.sources) assert.ok(result.text.includes(source.url), `Markdown lost evidence: ${source.url}`);
  for (const unknown of canonical.unknowns) assert.ok(result.text.includes(unknown), "Markdown lost an unresolved requirement");
  const navigationLinks = result.text.match(/https?:\/\/[^\s)]+\/(?:guide|api\/guides)\/[^\s)]+/g) || [];
  for (const link of navigationLinks) {
    const url = new URL(link);
    for (const [key, value] of Object.entries(context)) assert.equal(url.searchParams.get(key), value, `Markdown navigation lost ${key}: ${link}`);
  }
  const visualLink = result.text.split("\n").find((line) => line.startsWith("Visual guide: "))?.slice("Visual guide: ".length);
  assert.ok(visualLink, "Export needs a navigable visual-guide link");
  const visualURL = new URL(visualLink);
  assert.equal(visualURL.pathname, "/");
  assert.equal(visualURL.searchParams.get("guide"), canonical.id);
  for (const [key, value] of Object.entries(context)) assert.equal(visualURL.searchParams.get(key), value, `Visual handoff lost ${key}`);
  const visualPage = await request(`${visualURL.pathname}${visualURL.search}`);
  assert.equal(visualPage.response.ok, true, "Exported visual URL must actually resolve");
});

await check("MCP initializes and exposes the four promised tools with input schemas", async () => {
  const initialized = await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "fieldguide-acceptance", version: "1.0" } });
  assert.ok(initialized.serverInfo?.name);
  assert.ok(initialized.capabilities?.tools);
  const list = await rpc("tools/list");
  assert.ok(Array.isArray(list.tools));
  for (const name of ["search_guides", "get_guide", "research_app", "get_research_status"]) {
    const tool = list.tools.find((item) => item.name === name);
    assert.ok(tool, `Missing MCP tool ${name}`);
    assert.equal(tool.inputSchema?.type, "object");
  }
});

await check("MCP search and get_guide match REST guide semantics", async () => {
  const searchResult = structured(await rpc("tools/call", { name: "search_guides", arguments: { q: "slack", context } }));
  const guides = Array.isArray(searchResult) ? searchResult : searchResult.guides;
  assert.ok(guides?.some((item) => item.providerId === "slack"));
  const toolResult = await rpc("tools/call", { name: "get_guide", arguments: { id: "slack", context } });
  assert.notEqual(toolResult.isError, true);
  const value = structured(toolResult);
  const guide = value.guide || value;
  canonical ||= await json(`/api/guides/slack?${contextQuery}`);
  validateGuide(guide);
  for (const field of ["id", "providerId", "version", "origin", "researchStatus", "context", "summary", "gates", "steps", "sources", "unknowns", "nextAction"]) assert.deepEqual(guide[field], canonical[field], `MCP/REST disagreement: ${field}`);
});

await check("Agent discovery lists machine-readable access", async () => {
  const result = await request("/llms.txt");
  assert.equal(result.response.ok, true);
  assert.match(result.text, /Charter/i);
  assert.match(result.text, /mcp/i);
  assert.match(result.text, /markdown|\.md/i);
  assert.match(result.text, /api\/guides/);
});

await check("Missing resources and unavailable persistence return explicit errors", async () => {
  const guide = await request("/api/guides/no-such-guide-6af470");
  assert.equal(guide.response.status, 404, "A missing guide must not become a generic guide");
  const readiness = await json("/api/status");
  const job = await request("/api/research/no-such-job-6af470");
  const expected = readiness.storage === "unavailable" ? 503 : 404;
  assert.equal(job.response.status, expected, "Unavailable persistence must not claim a job is absent");
  assert.equal(typeof job.body.error, "string", "The job error must be actionable JSON");
});

await check("Invalid and private-network research input is rejected before fetching", async () => {
  for (const input of ["", "http://127.0.0.1/private", "http://169.254.169.254/latest/meta-data/"]) {
    const result = await request("/api/research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ input, context }) });
    assert.ok([400, 422].includes(result.response.status), `${JSON.stringify(input)} returned ${result.response.status}; expected input rejection`);
    assert.ok(result.text.length > 0, "Validation error must be actionable");
  }
});

await check("Configuration accurately declares research mode and storage", async () => {
  status = await json("/api/status");
  assert.ok(["ai-research", "evidence-only"].includes(status.research?.mode));
  assert.equal(typeof status.research.configured, "boolean");
  if (status.research.mode === "ai-research") assert.equal(status.research.configured, true, "AI mode cannot be advertised without configuration");
  assert.ok(status.storage, "Persistence status must be visible");
  if (status.storage === "unavailable") {
    const unavailable = await request("/api/research", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "Notion", context }),
    });
    assert.ok([401, 503].includes(unavailable.response.status), "Unavailable storage must fail closed before research, without claiming a quota was exhausted");
    assert.equal(typeof unavailable.body.error, "string");
  }
  const serialized = JSON.stringify(status);
  assert.doesNotMatch(serialized, /sk-(?:proj-)?[A-Za-z0-9_-]{16,}/, "Status must never reveal a model API key");
  console.log(`INFO Research mode: ${status.research.mode}; configured: ${status.research.configured}; storage: ${status.storage}`);
});

if (savedId) {
  await check("Saved generated guide persists across REST, Markdown, MCP, and catalog search", async () => {
    const guide = await json(`/api/guides/${encodeURIComponent(savedId)}`);
    validateGuide(guide);
    assert.equal(guide.id, savedId);
    assert.equal(guide.origin, "generated");
    const oppositeContext = { audience: guide.context.audience === "internal" ? "external" : "internal", capability: guide.context.capability === "read" ? "write" : "read", stage: guide.context.stage === "testing" ? "launching" : "testing" };
    const immutable = await json(`/api/guides/${encodeURIComponent(savedId)}?${new URLSearchParams(oppositeContext)}`);
    assert.deepEqual(immutable, guide, "A generated snapshot must not pretend to re-research when the URL context changes");
    const toolResult = structured(await rpc("tools/call", { name: "get_guide", arguments: { id: savedId, context: oppositeContext } }));
    assert.deepEqual(toolResult.guide || toolResult, guide, "Generated MCP and REST guides disagree");
    const markdownResult = await request(`/api/guides/${encodeURIComponent(savedId)}/markdown`);
    assert.equal(markdownResult.response.ok, true);
    for (const value of [guide.version, guide.context.audience, guide.context.capability, guide.context.stage, guide.nextAction, ...guide.unknowns, ...guide.sources.map((source) => source.url)]) assert.ok(markdownResult.text.includes(value), `Generated Markdown lost ${value}`);
    const searchResult = await json(`/api/guides?q=${encodeURIComponent(guide.name)}`);
    assert.ok(searchResult.guides.some((item) => item.id === savedId), "Saved research must be discoverable after reload");
    if (savedJobId) {
      const jobResult = await json(`/api/research/${encodeURIComponent(savedJobId)}`);
      assert.equal(jobResult.job.guideId, savedId);
      assert.deepEqual(jobResult.guide, guide);
      const toolJob = structured(await rpc("tools/call", { name: "get_research_status", arguments: { id: savedJobId } }));
      assert.deepEqual(toolJob, jobResult, "MCP and REST job retrieval disagree");
      assert.ok(jobResult.job.events.length > 1, "Job must retain actual research events");
    }
    console.log(`INFO Saved generated guide ${guide.id}: ${guide.researchStatus}; ${guide.sources.length} sources; original context preserved`);
  });
}

if (liveInput) {
  await check("Optional unfamiliar-app research retrieves evidence and persists its result", async () => {
    assert.ok(!/^(github|gmail|slack)$/i.test(liveInput), "Choose a provider outside the seeded examples");
    const result = await request("/api/research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ input: liveInput, context }) }, 210000);
    assert.ok([200, 201, 202].includes(result.response.status), result.text.slice(0, 500));
    let payload = result.body;
    assert.ok(payload.job?.id);
    const jobId = payload.job.id;
    if (["queued", "researching"].includes(payload.job.status)) {
      const deadline = Date.now() + 120000;
      while (Date.now() < deadline && ["queued", "researching"].includes(payload.job.status)) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        payload = await json(`/api/research/${encodeURIComponent(jobId)}`);
      }
    }
    assert.ok(["complete", "partial"].includes(payload.job.status), `Research did not produce evidence: ${JSON.stringify(payload.job)}`);
    assert.ok(payload.guide, "A completed/partial job needs its saved guide");
    validateGuide(payload.guide);
    assert.equal(payload.guide.origin, "generated");
    assert.deepEqual(payload.guide.context, context);
    if ((status || await json("/api/status")).research.mode === "evidence-only") {
      assert.equal(payload.guide.researchStatus, "partial", "Evidence retrieval must not pretend to be model synthesis");
      assert.ok(payload.guide.unknowns.length);
    }
    const saved = await json(`/api/research/${encodeURIComponent(jobId)}`);
    assert.equal(saved.guide.id, payload.guide.id);
    const guide = await json(`/api/guides/${encodeURIComponent(payload.guide.id)}`);
    assert.equal(guide.origin, "generated");
    assert.equal(guide.id, payload.guide.id);
    console.log(`INFO Live job ${jobId}; guide ${guide.id}; status ${payload.job.status}; ${guide.sources.length} sources`);
  });
} else {
  console.log("SKIP Live unfamiliar-app research (run with --live=<app name or URL> to exercise actual retrieval)");
}

await check("Markdown library is an actual machine-readable route",async()=>{
 const result=await request(`/index.md?${contextQuery}`);
 assert.equal(result.response.ok,true);assert.ok(result.response.headers.get("content-type").includes("text/markdown"));
 assert.ok(result.text.startsWith("# Charter"));assert.ok(result.text.includes("/guides/gmail.md"));assert.ok(result.text.includes(context.audience));
});
await check("Direct .md guide is the canonical contextual Markdown",async()=>{
 const raw=await request(`/guides/gmail.md?${contextQuery}`);const api=await request(`/api/guides/gmail/markdown?${contextQuery}`);
 assert.equal(raw.response.ok,true);assert.ok(raw.response.headers.get("content-type").includes("text/markdown"));assert.equal(raw.text,api.text);
 const missing=await request("/guides/not-a-guide.md");assert.equal(missing.response.status,404);
});
const passed = results.filter((result) => result.passed).length;
console.log(`\n${passed}/${results.length} checks passed. ${liveInput ? "Live retrieval requested." : "No live retrieval or model generation claimed."}`);
process.exitCode = passed === results.length ? 0 : 1;
