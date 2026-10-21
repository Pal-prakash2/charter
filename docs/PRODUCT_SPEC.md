# Charter: product rationale and acceptance contract

## Product decision

Submission tracking and provider-status integrations are deferred. The core deliverable remains source-backed OAuth launch guidance and real research for unfamiliar apps. Waiting guidance separates developer effort from external review, cites its basis, and preserves uncertainty; it does not imply live submission monitoring.

Charter helps a developer and their coding agent move from “we need this integration” to an evidence-backed testing and launch plan. The user needs to know which registration, review, distribution, and consent gates apply; what can be done now; and which dependency could delay launch.

The product promise is: **Know the path. Build the connection.**

The primary user is a developer building a customer-facing product with an AI coding agent. A technical PM or engineering lead is a secondary user. Human readers need clear decisions and ownership. Agents need explicit context, dependencies, structured facts, unresolved questions, and cited evidence. Both consume one guide record.

## Opportunity in the current market

The opportunity is not another article library. Composio already publishes [OAuth guides](https://composio.dev/auth), [Nango](https://nango.dev/docs/api-integrations/google-shared/google-security-review) explains approval work in depth, and [Apideck](https://developers.apideck.com/apis/ecommerce/walmart/overview) surfaces prerequisites and complexity. [Membrane](https://getmembrane.com/articles/future-of-integrations/1000-integrations-in-one-week/) and [Airbyte](https://docs.airbyte.com/platform/connector-development/connector-builder-ui/ai-assist) show the value of research and generation for integration work.

Charter combines the useful patterns: an at-a-glance decision, a contextual launch path, a research flow for missing apps, and equivalent human and agent interfaces. The hypotheses to validate are that this reduces research repetition, reveals launch blockers earlier, and makes agent handoffs more reliable. These business outcomes are not proven by the take-home.

## The consequential distinction

A provider's registration process, provider review, marketplace approval, customer administrator approval, and end-user authorization are separate gates. “OAuth supported” does not establish that a public product can launch with its intended access.

Guidance therefore depends on provider, capability, audience, and stage. The current context controls are deliberately small: read/write capability; internal/pilot/external audience; exploring/testing/launching stage. They are a useful first decision layer, not a complete permissions model. A production version should collect exact scopes, distribution details, and data-handling choices when they materially alter the path.

## Required deliverables and acceptance

The assignment is the [Composio APM Integrations take-home](https://composio.notion.site/APM-Integrations-Take-home-Assignment-3f9f261a6dfe81489ee5e3643151f9d6). The three curated examples demonstrate variety rather than pretending that a 100-app library already exists.

| Deliverable | Acceptance condition | Evidence to inspect |
|---|---|---|
| Working guide library | Search or browse GitHub, Gmail, and Slack; open an actionable guide. | Landing page and provider guides. |
| Varied OAuth paths | Examples expose materially different review, distribution, and organization-access decisions. | Context changes and guide gates. |
| Effort and approval expectations | Separate hands-on effort from external waiting; identify the basis for each estimate and acknowledge unknowns. | Guide summary, estimates, sources. |
| Requirements and blockers | Prerequisites, ordered steps, actor, completion evidence, and corrective next actions are present. | Launch plan and blocker content. |
| Live generation for unfamiliar apps | Submit an app name or website outside the seeded library; perform actual retrieval and produce a saved guide or honest partial/failure result. | Research job, retrieved sources, generated guide. |
| Shareable output | Opening a saved guide URL preserves its contextual assumptions; the recipient can inspect evidence. | URL opened in a fresh session. |
| Path to 100 apps | A reusable schema, catalog, generation flow, and persistence support adding providers without custom page implementations. | Domain schema and backend storage. |
| Agent access, added by the user | The same guide is available as Markdown, JSON, and MCP tools with stable identity, context, sources, and version. | Agent handoff, API and MCP tests. |
| Visible recruiter story | Agent access is apparent in the landing and guide experiences, and demonstrable through real requests. | Agent section, copy/export controls, demo. |

## Canonical guide contract

Every representation includes identity and version, contextual assumptions, origin, research status, summary, effort and waiting estimates, prerequisites, gates, ordered steps, blockers, sources, unknowns, and a next action. Steps identify the responsible actor, dependencies, and completion evidence.

Reviewed editorial content and generated content must be distinguishable. A guide with partial research remains useful only if its unresolved requirements remain visible in every representation. A successful retrieval is not proof that an integration or OAuth flow was tested.

## Minimum complete human journey

1. Find an app or request research from the same search entry point.
2. Select the capability, audience, and stage that materially affect the plan.
3. Understand the applicable gates and current next action before reading detailed instructions.
4. Work through ordered steps with sources and clear ownership.
5. Copy an agent brief or open Markdown/JSON when implementation moves to a coding agent.
6. Share a URL that preserves the plan's context.

## Minimum complete agent journey

1. Discover tools or supported representations.
2. Search for an existing guide.
3. Retrieve the guide with explicit context.
4. Start research if the provider is missing and retrieve its job status.
5. Distinguish executable implementation tasks from human decisions and provider actions.
6. Preserve unresolved questions and source citations in the handoff.

MCP tools are `search_guides`, `get_guide`, `research_app`, and `get_research_status`. The server is a small stateless JSON-RPC tool endpoint. Markdown, JSON, MCP, and the visual experience render the same domain model rather than separate generated documents.

## Quality bar and exclusions

The release bar is a correct and useful next action, not guide count. Missing evidence must not become “approval is not required.” Unknown waiting periods remain unknown. Estimates must state whether they are provider guidance, editorial estimates, or unavailable.

This implementation does not register provider apps, store provider credentials, approve consent requests, or submit reviews. An agent should never imply it has completed one of those external actions merely because it generated instructions.

Production extensions include exact-scope branching, change detection, refresh/review workflows, abuse controls, broader identity and authorization, and stronger cross-provider research evaluations. They should follow evidence from real developer journeys rather than expanding the take-home indiscriminately.

## Evaluation plan

The primary outcome is time to a **correct, actionable next step** compared with the developer's normal research process. Supporting signals are consequential factual-error rate, ability to explain the launch path, unfamiliar-app research completion, and successful agent handoff. Guide count and generation speed are operational metrics, not the success definition.

For this submission, inspect the acceptance matrix, run `tests/acceptance.mjs`, execute the demo in `docs/DEMO.md`, and review the explicit limitations in `docs/QA_REVIEW.md`. Passing automated checks does not establish that every provider claim is correct or that external OAuth flows were tested.

## Evidence-preserving correction

Stored generated snapshots retain their source and scenario. A historical waiting label that conflicts with unknown launch gates receives an explicitly versioned corrected representation (`.wait-policy1`) across UI, REST, Markdown, MCP and job reads. The original estimate remains in the waiting detail. New synthesis uses the same conservative rule before saving.
