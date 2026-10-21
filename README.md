# Charter

OAuth setup, approvals, and the next actionable step — for developers and their coding agents.

[Submission PDF](https://charter-oauth-guide.vercel.app/Charter-Submission.pdf) · [Live app](https://charter-oauth-guide.vercel.app) · [Project brief](https://charter-oauth-guide.vercel.app/submission) · [Saved AI example](https://charter-oauth-guide.vercel.app/?guide=r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45)

## Try it in two minutes

1. Open Gmail; compare external and internal audiences and reading versus sending.
2. Inspect a review gate, its source, and the launch plan.
3. Switch **Human → Agent** to get the same guide as Markdown. JSON and MCP are also available.
4. Research an unfamiliar app using its official documentation URL, or open the saved Linear example above.

## Run

Node.js 22.13+ and npm:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Library guides work without credentials. For AI research, set server-only `RESEARCH_PROVIDER=gemini` and `GEMINI_API_KEY` in an ignored `.env.local`, and connect private Vercel Blob storage. The existing deployment also accepts the sealed `gemini_key` name. Never use a `NEXT_PUBLIC_` key. Full deployment and alternate-provider instructions: [SETUP.md](docs/SETUP.md).

## Decisions

- **Three distinct cases:** GitHub organization access, Gmail scope-dependent review, Slack distribution requirements.
- **Context before instructions:** audience, capability and stage affect the plan; exact scopes still require confirmation.
- **Work ≠ waiting:** developer effort and provider review are separate, with sources and uncertainty.
- **One guide, multiple interfaces:** React UI, Markdown, JSON and four MCP tools use the same schema and stored record.
- **Evidence before synthesis:** bounded public-document retrieval → Gemini structured output → schema/reference/dependency checks → immutable saved guide.
- **Keep the focus:** submission tracking is deferred. Details expand on demand; the entry screen leads straight to the guides.

Next.js + React on Vercel; Vercel Blob stores research jobs, guide snapshots and atomic quotas. Human checklists are browser-local. Source and model credentials stay server-side.

## Validation and limits

Live Gemini synthesis successfully generated a Linear guide from three fetched documentation pages in about 44 seconds. Fifteen public HTTP checks passed on its persisted result. The result is partial because approval requirements remain unresolved. Reproduce without another model request:

```sh
node tests/acceptance.mjs https://charter-oauth-guide.vercel.app --saved=r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45 --job=job_958b2e4a-2b73-468e-a103-83e3cfcd6969
```

Three reviewed examples are not 100-provider coverage. Schema and citation membership do not prove factual accuracy. No provider registration, token exchange or approval was executed; no user interviews were conducted. Review generated claims before use. Public demo APIs are not private workspaces. The original generated waiting label is retained for traceability; a versioned policy correction now marks overall waiting unknown when launch gates are unresolved. Browser visual review of this revision is outstanding.

[Submission rationale and findings](docs/SUBMISSION.md) · [Provider evidence](docs/content-notes.md) · [Validation record](docs/VALIDATION.md) · [QA record](docs/QA_REVIEW.md) · [Demo script](docs/DEMO.md) · [Backend](docs/BACKEND.md)

Source: [Pal-prakash2/charter](https://github.com/Pal-prakash2/charter). The repository is private: grant evaluator access before submitting.
