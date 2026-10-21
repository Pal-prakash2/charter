# Charter — submission brief

[Final PDF](https://charter-oauth-guide.vercel.app/Charter-Submission.pdf) · [Live app](https://charter-oauth-guide.vercel.app) · [Project brief](https://charter-oauth-guide.vercel.app/submission) · [Source repository](https://github.com/Pal-prakash2/charter)

## Problem and opportunity

A working OAuth callback does not establish that an integration can launch. A developer still needs to understand permissions, provider review, distribution rules, customer-administrator controls, and who acts next. A coding agent faces the same uncertainty and needs structured context rather than another long article.

The opportunity is a decision and evidence layer around integration implementation. Existing products cover useful pieces: [Composio-managed OAuth](https://docs.composio.dev/toolkits/managed-auth) can remove owned registration for supported methods; [Nango](https://nango.dev/docs/api-integrations/google-shared/google-security-review) explains review requirements; [Airbyte](https://docs.airbyte.com/platform/connector-development/connector-builder-ui/ai-assist) assists connector configuration. Charter combines a scenario-specific launch path with equivalent human and agent access. This is a product hypothesis, not proven market demand.

## Delivered experience

Search → choose a guide or research a new app → inspect gates and next action → follow the plan → copy or share.

| Example | Why it is included |
|---|---|
| GitHub | Registration and organization-access decisions are distinct. |
| Gmail | The selected permissions can materially change the review path. |
| Slack | Development, pilot distribution, and public commercial distribution differ. |

The Human / Agent switch preserves guide context. Markdown, JSON and four MCP tools read the same record. Research fetches public documentation, asks Gemini for structured synthesis, validates the schema, source references and dependencies, then persists a shareable snapshot in Vercel Blob. It does not operate provider consoles.

## Key decisions

- Lead with a useful next action; put supporting detail behind disclosures.
- Keep audience, capability and launch stage explicit. Read/write is a starting point, not an exact-scope model.
- Separate developer work from provider waiting; label the evidence basis. Missing review information is not an exemption.
- Preserve origin, sources and unresolved questions in every representation.
- Defer submission tracking and live provider-status synchronization to focus on the required guidance flow.

## Validation and actual findings

Curated instructions were checked against official documentation. Changes included separating organization approval from user consent, distinguishing Gmail scope categories, and retaining Slack's separate distribution gates. See [content review](content-notes.md) for details.

A real Linear request fetched three documentation pages and completed Gemini synthesis in about 44 seconds. [Saved guide](https://charter-oauth-guide.vercel.app/?guide=r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45); job `job_958b2e4a-2b73-468e-a103-83e3cfcd6969`. The result is partial because some approval requirements remain unknown. Fifteen public HTTP contract checks passed, including saved-guide and job parity across REST/Markdown/MCP. Earlier billing and quota failures were recorded explicitly rather than disguised as successful research.

The generated “None documented” waiting label revealed a misleading inference. A conservative policy now marks overall waiting unknown whenever a launch gate is unknown; historical views carry an explicit policy revision while stored evidence is retained. Eight focused checks and the post-correction 15/15 public suite pass. Reference membership and schema validation still do not prove semantic correctness. See [the validation record](VALIDATION.md). A later model recheck returned 503 for high demand; saved results remain available.

No provider account was registered, OAuth token exchange executed, approval submitted, or developer interview conducted. Current hosted visual review is limited by unavailable browser control. The prototype has three reviewed examples, not 100 providers. Demo API records are public; credentials and private documents must not be submitted.

## Next validation

Compare time to a correct next action with developers' normal research process. Track consequential factual errors, unfamiliar-provider completion, and whether agents preserve assumptions. Prioritize exact scopes, source freshness, interrupted-job recovery and stronger access controls before broad rollout.

## Submission checklist

- Four-page submission PDF: linked above, with scenario-specific prototype and evidence links.
- Working app and live unfamiliar-provider synthesis: delivered; provider availability can interrupt fresh research.
- Source and short setup/decisions/limitations README: included in the repository and source archive.
- Research, validation findings, and boundaries: this brief and linked evidence notes.
- Repository is private: grant evaluator access before submission. No recorded walkthrough is claimed; [DEMO.md](DEMO.md) is a short demonstration script.
