# Charter — detailed setup and architecture

OAuth, from setup to launch. Charter helps developers and their coding agents understand the permissions, review gates, dependencies, and external waiting that separate a working connection from a launchable integration.

This is the Vercel implementation for the [Composio APM Integrations take-home](https://composio.notion.site/APM-Integrations-Take-home-Assignment-3f9f261a6dfe81489ee5e3643151f9d6). The product organizes sourced launch plans around a developer's scenario and gives people and agents equivalent access to the evidence.

## What is implemented

- Three source-reviewed provider guides: GitHub, Gmail, and Slack.
- Audience, capability, and stage controls; prerequisites, separate approval gates, ordered steps, responsible actors, completion evidence, blockers, and cited sources.
- Separate implementation work and external waiting, with the basis for each estimate.
- A Human / Agent switch preserving the guide and context. Agent mode presents canonical Markdown with copy, raw `.md`, and JSON access.
- Direct Markdown routes, `/llms.txt`, OpenAPI, REST, and a stateless MCP endpoint with four tools.
- Bounded live research for unfamiliar app names or public documentation URLs; durable jobs and immutable generated guides in a private Vercel Blob store.
- Context-preserving share links and a browser-local launch checklist.

**Live Gemini synthesis is working with the updated key.** Charter is deployed at [charter-oauth-guide.vercel.app](https://charter-oauth-guide.vercel.app). A real Linear documentation request fetched three sources, generated a schema-validated guide, and persisted the guide and job. The guide is deliberately partial: provider review, customer-admin and marketplace requirements remain unresolved. Public acceptance checks cover the saved result across REST, Markdown, MCP and catalog search; see QA_REVIEW for the exact execution record. This establishes one successful synthesis path, not arbitrary-provider accuracy or an executed OAuth implementation. The sealed Production Secret `gemini_key` stays server-side. Explicit Gemini selection never falls through to another paid provider. No Google billing settings were changed by Charter.

The reviewed library contains three providers, not 100. Provider OAuth implementations and approval submissions have not been executed. Generated findings need factual review before they guide an implementation.

## Run locally

Requires Node.js 22.13+ and npm.

```sh
npm ci
npm run dev
```

Next.js serves the development app at `http://127.0.0.1:3000` by default. To test the production build:

```sh
npm run build
npm start
```

Curated guides remain readable without storage. Research persistence requires a private Vercel Blob store; there is no in-memory substitute that pretends to survive a deployment or restart. This version uses standard Next.js server routes and does not require Cloudflare, D1, or database migrations.

## Vercel configuration

Create or import a Vercel project using this directory as its root. The Next.js preset uses `npm run build`. Source can also be uploaded through [Vercel Drop](https://vercel.com/docs/drop). Never upload local `.env` files or credentials.

In the project's Storage area, create a **private** Vercel Blob store and connect it to the intended environments. A connected store can authenticate with `BLOB_STORE_ID` and the Vercel-managed OIDC identity; the SDK handles that identity without copying or logging its token. Provisioning may instead supply a server-only `BLOB_READ_WRITE_TOKEN`, which this app also supports. The current production connection uses that provisioned storage credential. Private storage protects stored objects; the app intentionally exposes guide content and research jobs through its public interfaces. Do not submit private documentation or secrets.

Model settings:

- `RESEARCH_PROVIDER=gemini` explicitly selects Google's Gemini API. It uses server-only `GEMINI_API_KEY` or the existing sealed `gemini_key` secret, with `gemini-3.8-flash` as the default model. It does not fall back to another provider when that key is missing or rejected. The current key is scoped to Production.
- Gemini synthesizes successfully fetched public documentation into the shared JSON schema. App names use bounded public RSS discovery; direct official documentation URLs are the most reliable input. Search snippets and guessed URLs are not synthesis evidence. The native REST request keeps the key in the `x-goog-api-key` header, never in URLs.
- On Vercel, AI Gateway can authenticate with the project's OIDC identity. No model key needs to be copied into the app. The default Gateway model is `openai/gpt-5-mini`.
- `OPENAI_API_KEY` enables the direct OpenAI connection; its default model is `gpt-5-mini`.
- The current production deployment also accepts its existing sealed secret named `Openai_key`. The standard `OPENAI_API_KEY` takes precedence. This compatibility avoids copying or recreating a secret whose name Vercel locks; new environments should use the standard name.
- `RESEARCH_PROVIDER=openai` explicitly selects direct OpenAI. Without its key, research remains evidence-only; it does not fall through to AI Gateway.
- `RESEARCH_PROVIDER=gateway` explicitly selects Gateway even when an OpenAI key is present. `RESEARCH_MODEL` overrides the selected provider's default model. Gateway accepts provider-prefixed model IDs.
- `AI_GATEWAY_API_KEY` is an optional server-side Gateway credential for environments without Vercel OIDC.
- `/api/status` reports configuration and actual storage readiness. Configuration alone does not prove that a model request will succeed; verify live research after deploying.

Research has durable hourly quotas of 8 requests per caller and 40 across the deployment. Caller metadata is a quota signal, not a verified user identity. Set the optional server-only `RESEARCH_ACCESS_TOKEN` to require `Authorization: Bearer <research token>` for REST research creation and the MCP `research_app` tool. The token does not gate read operations. The browser research form does not collect or store that secret; token-protected research should use a configured API or MCP client. Cross-origin browser research requests are rejected.

This is a public guide and demo surface. Vercel deployment protection may still restrict access to the deployment, including its agent URLs. Verify recruiter and external-client access before sharing. The Human / Agent switch changes representation, not permissions.

## Verify

```sh
npx tsc --noEmit
npm run build
node tests/acceptance.mjs http://127.0.0.1:3000
node tests/quota.cjs
```

The HTTP suite checks context branching, JSON/Markdown/MCP parity, real Markdown routes, discovery, configuration reporting, missing resources, and unsafe inputs. The isolated quota suite uses a simulated Blob service to check concurrent reservations and failures without network access or credentials; it does not prove the deployed Blob connection. Neither suite proves model quality or executes provider OAuth flows. To additionally exercise actual retrieval and saved-guide parity:

```sh
node tests/acceptance.mjs http://127.0.0.1:3000 --live=https://developers.notion.com/docs/authorization
```

Live tests need storage and network access, consume a research quota slot, and may incur model usage when configured. If research bearer authorization is enabled, supply it through an appropriately configured client rather than committing a secret to a test file or command history.

## Agent access

```text
GET  /index.md
GET  /guides/gmail.md?audience=external&capability=write&stage=exploring
GET  /api/guides?q=gmail
GET  /api/guides/gmail?audience=external&capability=write&stage=exploring
POST /api/research                  {input, context}
GET  /api/research/{job_id}
POST /mcp
```

MCP tools: `search_guides`, `get_guide`, `research_app`, `get_research_status`. The endpoint accepts stateless JSON-RPC calls and returns text plus structured tool output. A compatible HTTP MCP client can use the endpoint directly; other agents can fetch the Markdown or REST URLs. No Charter-specific plugin installation or platform Site authorization is required. Deployment protection, if enabled in Vercel, applies before requests reach the app. Only research creation uses the separate optional research bearer requirement and quotas.

## Design and architecture

The restrained serif wordmark, compass seal, paper palette, and green/blue accents emphasize clear decisions and evidence. Human mode prioritizes the next action and applicable gates; Agent mode prioritizes complete, explicit context.

Next.js and React run on Vercel with private Blob persistence. `lib/domain.ts` defines the shared guide contract. `lib/guides.ts` contains reviewed provider content; `lib/serializers.ts` and `lib/catalog-markdown.ts` render canonical Markdown. The UI, REST routes, and MCP tools consume the same records. `lib/research.ts` performs bounded retrieval and optional schema-validated synthesis. `lib/store.ts` persists jobs, guides, and quota counters; `lib/model-config.ts` resolves server-side model connections.

Research input is untrusted. Only public HTTPS sources are accepted; private-network URLs, embedded credentials, and unsafe redirects are rejected. Retrieved content is evidence, never execution authority. Generated snapshots preserve their original context and are not silently reinterpreted by later controls.

## Submission materials

- [Product rationale and deliverables](docs/PRODUCT_SPEC.md)
- [Demo walkthrough](docs/DEMO.md)
- [Quality evidence and limitations](docs/QA_REVIEW.md)
- [Provider content review](docs/content-notes.md)
- [Backend and research contract](docs/BACKEND.md)

The supporting documents describe the current product and Vercel runtime. The quality review labels evidence from the earlier Sites implementation separately. A deployed Gemini run successfully generated and persisted the Linear example. Further evaluator-selected runs and claim-level factual review remain necessary to evaluate research quality. A broader rollout also needs exact-scope modeling, research-quality evaluations, policy freshness monitoring, and access/abuse review.
