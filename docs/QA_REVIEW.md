# Product and quality review

## Review status

This document separates release requirements from executed evidence. The current source is the Vercel implementation, using private Blob persistence and direct OpenAI in production. Public guide/Markdown/MCP checks and failed-job persistence are verified below. A successful unfamiliar-app AI synthesis run and its saved-guide round trip remain release gates. Model configuration alone does not demonstrate available quota or synthesis quality.

The execution records below describe the earlier Sites/D1 implementation on 21 October 2026 and are retained as historical evidence, not as proof of Vercel behavior. That local HTTP/REST/Markdown/MCP suite passed **15 of 15 checks** at `http://127.0.0.1:5173`; genuine unfamiliar-app retrieval saved a partial evidence guide. Full AI synthesis was not exercised in that environment. Submission tracking and provider-status integrations are deferred in the current source.

## Current Vercel source verification — 21 October 2026

- A clean Next.js production build and its TypeScript check passed after removing the tracker.
- The production HTTP suite passed **14/14** on a temporary local server at `http://127.0.0.1:3001`. It verified human HTML, three distinct reviewed guides, context branches, Markdown/JSON/MCP parity, actual `.md` routes, discovery, missing resources, rejected unsafe input, and truthful configuration. This environment reported evidence-only mode and unavailable storage; no live retrieval or model synthesis was claimed.
- `node tests/quota.cjs` passed eight isolated checks using a simulated Blob service. Seventy concurrent reservations preserved committed counts and the 8-per-caller/40-global limits. Storage corruption, offline reads/writes, and exhausted contention fail closed as unavailable service, distinct from actual quota exhaustion. These tests do not verify Vercel Blob authentication or a deployed round trip.
- Source review found no tracker UI, API, OpenAPI contract, or agent tool in the deployable app. Current browser verification remains unavailable because local browser control is disabled; this is separate from the HTTP verification below.

Reproduce that local suite against a running production build with `node tests/acceptance.mjs http://127.0.0.1:3000`. The following section records the subsequent hosted checks separately.

## Recruiter-focused interface revision — 21 October 2026
+
+The rendered initial home page was reduced from 368 to 156 visible words (approximately 58%), measured from HTML text excluding scripts, styles and SVG. Search is in the opening screen; duplicated announcement, principles, research promotion and agent banner were removed. Requirements, prerequisites, unresolved questions and launch-step details remain accessible through native disclosures. Agent Markdown/JSON/MCP records are unchanged.
+
+A separate `/submission` page and `/submission.md` provide the product rationale and short README. Local production build and TypeScript passed. The existing local HTTP suite passed 14/14; local storage was explicitly unavailable and failed closed. After deployment, the public saved-guide suite passed **15/15**. The revised home, `/submission` and `/submission.md` returned HTTP 200 without authentication; the README was served as `text/markdown`. Deployment `dpl_EUj4hroypSFMZujFXYKE1FHWGpxJ` is promoted to production. Browser control remains disabled, so no rendered visual or interaction review of this revision is claimed.
+
+## Current Gemini hosted verification — 21 October 2026

- After the user updated the Gemini project/key configuration, deployment `dpl_4Q4tw3TNsNfvKjm1DqXwMXtUy4pj` built successfully and was promoted to `https://charter-oauth-guide.vercel.app`.
- Selected provider/model: direct Gemini, `gemini-3.8-flash`. A real request for `https://linear.app/developers/oauth-2-0-authentication` fetched three Linear documentation pages and completed model synthesis in approximately 44 seconds. Research returned HTTP 201.
- Saved guide `r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45`; saved job `job_958b2e4a-2b73-468e-a103-83e3cfcd6969`. Status is partial because provider review, customer-admin approval and marketplace requirements remain unresolved. This was actual model output, not evidence-only fallback.
- Schema, source-ID membership and dependency checks passed before saving. Follow-up public acceptance suite passed **15/15**, verifying REST, Markdown, MCP, catalog discoverability, immutable scenario context and saved job parity.
- Factual review remains necessary. In particular, the generated waiting label “None documented (editorial estimate)” must not be read as zero waiting: the same guide explicitly leaves approval requirements unknown. One successful synthesis does not establish arbitrary-provider quality or operational OAuth correctness.
- No Google billing settings or payment methods were changed. The app reads the sealed key server-side; no secret value was exported. Hosted browser/mobile visual checks remain outstanding.

Reproduce saved-result verification without a model call:
`node tests/acceptance.mjs https://charter-oauth-guide.vercel.app --saved=r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45 --job=job_958b2e4a-2b73-468e-a103-83e3cfcd6969`

## Historical Vercel billing-blocked verification — 21 October 2026

- Production URL: `https://charter-oauth-guide.vercel.app`; deployment `dpl_7ixHFSyEBcSrKA2NeH4q9Py8uQNb`, Ready and promoted in the verified quillsdepaon account's Praveen workspace.
- Production build and TypeScript check passed. Public unauthenticated HTTP suite: **14/14 passed after promotion**, including guide context, REST/Markdown/MCP parity, direct `.md` routes, discovery, missing resources, input rejection and runtime status.
- Runtime reports `gemini`, model `gemini-3.8-flash`, configured true, storage `vercel-blob`. The sealed Production Secret `gemini_key` stays server-side; no key value was retrieved into source, logs or artifact. Preview has no Gemini key and uses evidence-only mode rather than another billing provider.
- Real input `https://linear.app/developers/oauth-2-0-authentication` fetched three documentation pages and reached Gemini synthesis. Google rejected the model call for incomplete billing/payment-profile setup. The research endpoint returned 422 and did not publish an invented guide. Charter changed no Google billing settings.
- Failed job `job_c52985d0-9e00-42c7-8e2d-1b286e46d6a3` was retrieved through fresh public REST and MCP requests after promotion. Both returned identical events, context and error; MCP marked the result as a tool error. This proves real job persistence, not successful generated-guide persistence.
- Gemini uses bounded public-document retrieval (with RSS discovery for app-name input) followed by native structured JSON synthesis. It does not use Google's native Google Search grounding tool. Schema and evidence checks remain required before saving a generated guide.
- Historical direct OpenAI attempt `job_61e67037-fb1a-4b1f-86fd-cdc890cb5567` failed for API quota/spending limits. Earlier Gateway access required verification. Neither is the currently selected provider.

Reproduce read-only contracts with `node tests/acceptance.mjs https://charter-oauth-guide.vercel.app`. A successful synthesis and saved-guide parity test remain required after Google permits model access. Hosted browser/mobile review and a third-party agent-client UI session remain unverified; HTTP tool access has been tested.

## Release-critical questions

| Risk | Why it matters | Required check |
|---|---|---|
| Plausible but unsupported research | A wrong review path can cost the developer days. | New claims carry relevant retrieved sources; absent evidence yields uncertainty. |
| Human/agent disagreement | An agent may implement against different assumptions. | Compare identity, context, version, gates, sources, and unknowns across JSON, Markdown, and MCP. |
| Context presented as certainty | “Internal” and read/write controls alone cannot fully determine policy. | Guide states applicability conditions and unresolved scope/data-handling questions. |
| Generated content presented as reviewed | Visual polish can imply verification that did not happen. | Origin, research status, and freshness remain explicit. |
| Synthetic live research | A take-home can appear complete through canned responses. | Research an evaluator-selected, non-seeded provider; inspect actual retrieved sources and saved job. |
| Share links lose assumptions | A teammate receives a different plan. | Open a fresh session and confirm audience, capability, and stage. |
| Unsupported waiting estimate | Developers make a false launch commitment. | Every estimate states its basis; unknown timelines remain unknown. |
| Missing app becomes generic certainty | Unknown providers are incorrectly declared launch-ready. | Return useful partial/failure results, never invent credentials, scopes, or approvals. |
| Hidden research configuration | UI claims an agent that cannot run. | Configuration endpoint/UI accurately disclose research mode and unavailable capabilities. |
| Broad URLs or prompt injection | Research input and retrieved pages are untrusted. | Block private-network and unsafe URLs; treat retrieved instructions as evidence, not execution authority. |
| Protocol-shaped but unusable MCP | Recruiter cannot demonstrate agent consumption. | Exercise initialize, tools/list, and real calls with structured output/errors. |

## Meaningful automated checks

`tests/acceptance.mjs` is a dependency-free HTTP integration suite. It targets user-visible contracts rather than component implementation. It covers library availability, context branches, Markdown/JSON/MCP parity, discoverability, missing resources, malformed research input, and configuration honesty. Optional live research incurs real network/model use and must be requested explicitly when running the suite.

The suite cannot establish the correctness of every source claim, rendered accessibility, visual hierarchy, or that a provider OAuth flow actually works. Those require separate review. It also cannot guarantee arbitrary-provider coverage from one successful research result.

## Findings during implementation review

- Markdown navigation initially dropped contextual assumptions and used a different visual route. The backend now preserves context and links to the query-based guide route; the acceptance suite checks both conditions.
- The research schema initially allowed an empty plan to be marked complete. Minimum actionable content, missing-evidence handling, and dependency validation were strengthened before runtime acceptance.
- Coarse capability labels can mislead. Gmail now explicitly labels its write scenario “Send email only,” and Slack's commercial-distribution assumption is surfaced beside its context controls.
- Timed research-stage labels and catalog refresh behavior were flagged for UI correction. The timer was removed and the library now fetches persisted catalog records on mount. The saved generated guide is also discoverable through the API catalog after retrieval.
- Contrast calculations found ordinary paragraph/metadata colors between 3.02:1 and 4.15:1 against their actual light backgrounds. Accessible replacement colors and minimum readable type sizes were supplied to the UI owner. Visual verification remains separate from HTTP acceptance.

## Manual visual and usability checks

- Search is keyboard operable and has a useful empty state.
- Guide summary is understandable before a long instruction list.
- Mobile navigation, long source URLs, code samples, and export controls remain usable.
- Loading, partial, failed, and copied states have clear feedback.
- Reading order and focus styles support keyboard use.
- Agent setup is visible without overwhelming a person who only wants the guide.
- Sharing preserves the selected scenario.
- Recruiter-facing text distinguishes delivered behavior from roadmap work.

## Deliberate limitations to retain in the final handoff

Three curated guides are a demonstration library. They do not constitute 100-provider coverage. Read/write is a coarse capability model, not exact scope validation. Editorial effort estimates are not provider promises. Retrieved pages can be stale, incomplete, or contradictory. Generated guides are research artifacts, not tested OAuth implementations. Vercel deployment protection may require evaluator authentication. Production use requires policy refresh, exact-scope evaluation, abuse controls, and stronger research evaluations.

The earlier Sites environment had no research-model connection. Its working fallback retrieved public documentation, retained sources, saved a partial record, and explicitly left requirements unresolved. That proved retrieval and persistence in that environment; it did **not** establish AI synthesis quality or the new Vercel storage connection. A successful configured-model run for an evaluator-selected unfamiliar provider is still needed before claiming the full live synthesis requirement has been demonstrated. Vercel OIDC can provide model authentication without a copied API key, subject to actual model access and credit.

## Historical Sites execution record

| Check | Status | Evidence |
|---|---|---|
| Source review of curated content | Editorial review completed | `docs/content-notes.md` records official-source review and profile limits. No credentialed OAuth flow was tested. |
| HTTP/REST/Markdown/MCP acceptance suite | Passed: 15/15 locally | Catalog, context branches, evidence/dependencies, source-preserving exports, MCP tool parity, discovery, missing resources, rejected unsafe research input, truthful configuration, generated persistence and immutable context. |
| Live unfamiliar-app retrieval | Passed in evidence-only mode | Input `https://developers.notion.com/docs/authorization`; redirected official page `https://developers.notion.com/guides/get-started/authorization`; one retrieved source, partial guide. Job `job_dc0af19f-b8c3-4ee5-becc-e7d59f161754`; guide `r_db2a37d0-6470-474c-a72d-0f3f443be26c`. |
| AI-researched guide synthesis | Not executed: model unconfigured | `/api/status`: `research.mode=evidence-only`, `research.configured=false`, `storage=d1`. |
| Desktop/mobile visual review | Focused browser checks passed | Charter branding, mode switch, raw links, guide context, agent-access navigation, and mobile control bounds checked. Full accessibility audit not performed. |
| Sharing | HTTP/context and fresh-tab guide checks passed | Markdown visual links resolve and preserve provider/audience/capability/stage. Generated context remains immutable across REST and MCP. |

Reproduction command for the executed full suite:

```sh
node tests/acceptance.mjs http://127.0.0.1:5173 --saved=r_db2a37d0-6470-474c-a72d-0f3f443be26c --job=job_dc0af19f-b8c3-4ee5-becc-e7d59f161754
```

The IDs refer to local D1 state and will differ on another deployment. Use `--live=<official documentation URL>` to create and validate a new guide in that environment. Local loopback access required an approved sandbox escalation; initial unprivileged connection failures were environmental and are not counted as application checks.

## Historical Sites hosted execution

Charter was published privately at `https://charter-oauth-guide.spicytrout4.chatgpt.site`. The hosted suite passed 13 of 15 checks with a real unfamiliar-app request. Both unsuccessful checks were MCP calls: the hosting platform returns 401 to the REST service-access credential because MCP requires its separate OAuth connection. This is an authentication boundary, not evidence that hosted MCP tool calls work. The MCP contract passed locally; an authenticated hosted tool call remains unverified in this chat. Sites reports the native MCP plugin provisioned and installed, but its tools are not available in the current tool session.

Hosted source retrieval for `https://developers.notion.com/docs/authorization` saved partial guide `r_b0aacade-6c8a-4093-9458-9bb941b851c4`, job `job_7073fc74-877f-4fb7-b5cf-1ebbeb19cb20`, with one official source. D1 reports available. Model configuration remains false. The browser also opened the hosted landing page successfully.

## Historical Charter mode review

Human / Agent switching preserves the selected guide and scenario. Agent mode displays canonical Markdown and links to actual `text/markdown` routes. The switch also works from the agent-access page. A research-dialog cancellation regression was fixed and checked in the browser: changing research inputs no longer changes the current guide context. Mobile header controls fit within the viewport; long Markdown uses a contained reading panel. Copy actions report browser success, but operating-system clipboard parity was not established in the in-app browser test.

## Final PDF and waiting correction — 21 October 2026

Four-page PDF with scenario links, 27 clickable annotations, live-data excerpts, product decisions, trade-offs and evidence boundaries. All pages were rendered and visually inspected. The historical Linear guide now exposes a stable `.wait-policy1` correction, preserving the original estimate in detail; raw storage is unchanged. Waiting-policy checks passed 8/8 and public saved-result contracts passed 15/15 after correction. A real recheck returned Gemini 503 high demand; no false result was published. See VALIDATION.md for IDs, sources and reproduction.
