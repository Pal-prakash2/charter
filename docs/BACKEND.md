# Research and agent interfaces

This document describes the Vercel implementation in this directory. All views, Markdown, REST, and MCP use `lib/domain.ts` and the same guide service. Editorial records live in `lib/guides.ts`; generated guides are immutable private Vercel Blob snapshots. Browser local storage holds checklist preferences only, never persistent research records. Submission tracking and provider-status synchronization are deferred.

## Runtime and model connection

Next.js server routes run in the Node.js runtime. Research is synchronous: the job is saved before source discovery, and phase events are persisted as work finishes. The research and MCP routes allow up to 300 seconds on Vercel; each model call has a 90-second timeout. A failed research request returns its saved failed job when persistence remains available. A saved job does not imply background execution or automatic recovery after a server interruption. A production queue and interrupted-job reconciliation remain future work.

Model configuration is resolved server-side at request time in `lib/model-config.ts`:

- `RESEARCH_PROVIDER=gemini` selects direct Gemini with `GEMINI_API_KEY` or the existing sealed `gemini_key`; its default model is `gemini-3.8-flash`. A missing key uses evidence-only mode rather than another billing account. Gemini receives the shared guide schema through native `generateContent` REST, with header-based key authentication.
- `OPENAI_API_KEY`, when present and not overridden by `RESEARCH_PROVIDER=gateway`, selects direct OpenAI Responses calls. Its default model is `gpt-5-mini`.
- `RESEARCH_PROVIDER=openai` prevents Gateway fallback. If the OpenAI key is missing, research uses the clearly labelled evidence-only mode.
- Otherwise, `AI_GATEWAY_API_KEY` or the deployed Vercel project's OIDC identity selects AI Gateway. Its default model is `openai/gpt-5-mini`. No copied model key is necessary for the OIDC path.
- `RESEARCH_MODEL` overrides the selected default. The model must support Responses web search and structured outputs.
- Without either connection, the service uses evidence-only retrieval.

Credentials must remain server-only. Do not place them in source, public environment variables, URLs, guide content, or logs. Model configuration does not prove credit availability, model access, or successful synthesis. A live unfamiliar-app run is still required before claiming those are verified.

## Persistence and quotas

Connect a **private** Vercel Blob store to the intended deployment environments. The SDK supports the connected `BLOB_STORE_ID` and Vercel-managed OIDC identity. A server-only `BLOB_READ_WRITE_TOKEN` is an alternative, including for local development. No D1 binding or SQL migration is used by this implementation.

`lib/store.ts` stores JSON below `charter/v1/`:

- `guides/{id}.json`: immutable generated guide, including its original scenario and sources.
- `jobs/{id}.json`: mutable job, events, caller hash, and input hash. Public job responses omit the internal caller and input hashes.
- `quotas/{hour}.json`: one conditional-write document containing both hourly counters, capped at 8 requests per caller and 40 across the deployment.

Mutable reads bypass the Blob cache. Conditional writes use the stored ETag so concurrent instances reserve caller and global slots together. Contention or storage failures fail closed before model use. There is no process-memory persistence fallback. Quota records include an expiry field, but automatic deletion and a production retention policy are not implemented.

`GET /api/status` reports actual storage readiness separately from model configuration. Reviewed guides remain usable when research storage is unavailable. Generated records and new research require that store.

## Two explicit research modes

1. **AI research**: OpenAI/Gateway uses Responses web search followed by structured synthesis. Gemini uses bounded public RSS discovery for names, then actual HTTPS document retrieval; direct documentation URLs can start retrieval without search. Only successfully fetched pages enter Gemini synthesis, with at most five pages and 16,000 readable characters per page. The model produces the same guide schema. Zod validates the result; discovered source IDs, step URLs, dependencies, and cycles are checked. Missing evidence leaves approval gates unknown. Output is labelled generated, includes its sources, and preserves unresolved questions. Structural validation is not independent factual review of every claim.
2. **Evidence only**: without a model connection, Bing RSS discovers candidates for app names when accessible, and the server retrieves live public documentation. Direct developer-documentation URLs are the most reliable input. The output is always partial. Keyword matches identify research leads only; they do not establish OAuth support, exemptions, scopes, or timelines. Retrieved pages are not automatically labelled official.

Neither mode registers a provider app, tests an OAuth connection, submits a review, or monitors a submission. Do not present evidence retrieval as LLM synthesis, or generated findings as editorially reviewed.

## Network and access boundaries

Submitted documentation URLs must be public HTTPS without credentials, query parameters, fragments, or custom ports. IP literals, private hostnames, and private address ranges are rejected. Evidence-only retrieval checks A/AAAA answers through a fixed public DNS resolver before each page fetch and redirect. Redirects are manually revalidated; readable documents have size, type, and time limits. The subsequent fetch is not pinned to the checked DNS answer, so this check does not eliminate DNS-rebinding risk. Stronger egress controls remain a production requirement. AI web retrieval is performed by the model provider's search tool; its output is treated as untrusted evidence.

This app exposes public guide, catalog, and research-job interfaces unless Vercel deployment protection restricts access before requests reach it. A private Blob store protects direct object access; it does not make those application responses private. Do not submit private documentation or credentials. Records are shared research artifacts, not per-user private workspaces.

Cross-origin browser research writes are rejected. An optional server-only `RESEARCH_ACCESS_TOKEN` requires bearer authorization for REST research creation and MCP `research_app`; it does not gate reading guides or jobs. The browser form does not collect that token. Caller forwarding metadata is used only as a hashed quota signal, not authenticated identity. The durable global cap still bounds hourly requests. Public production use needs broader identity, access, abuse, retention, and spend controls.

## Agent use

`POST /mcp` is a stateless JSON-RPC endpoint supporting `server/discover` (2026-07-28), compatibility `initialize` (2025-03-26), `tools/list`, `tools/call`, `ping`, and notifications. Four tools reuse the REST services: `search_guides`, `get_guide`, `research_app`, and `get_research_status`. Successful results include matching text and `structuredContent`; tool failures are explicit. No Charter-specific plugin or Sites authorization is required. Vercel deployment protection and the optional research bearer still apply where configured.

The REST contract is at `/openapi.json`, discovery at `/llms.txt`, the Markdown library at `/index.md`, and direct guides at `/guides/{id}.md`. Context query parameters are `audience`, `capability`, and `stage`; defaults are `external`, `read`, and `exploring`. Reviewed guides adapt to that context. Generated guides preserve their saved context even when later callers send different parameters. Markdown and JSON are rendered from the same record as the human view.

The capability profile is deliberately coarse. Exact permissions, permitted data handling, and approval applicability still need validation. Agent output is evidence and a task handoff, not authorization to connect accounts, submit applications, or deploy changes.
