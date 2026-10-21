# Submission evidence and limits

Checked 21 October 2026. Documentation checks are not credentialed provider setup attempts or user research.

## Sampled claims

| Claim | Evidence inspected | Product consequence |
|---|---|---|
| A developer always needs a new OAuth registration. | [Composio managed OAuth](https://docs.composio.dev/toolkits/managed-auth) describes managed registrations for supported methods and reasons to supply your own. | Check whether registration is needed first. Charter currently implements the developer-owned guidance path; automatic routing remains unimplemented. |
| Gmail sending and mailbox reading have equivalent requirements. | [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) classifies `gmail.send` as sensitive and `gmail.readonly` as restricted; assessment applicability depends on restricted-data handling and exceptions. | Separate send-only from reading and retain conditional assessment gates. |
| User consent establishes access to GitHub organization resources. | [GitHub restrictions](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions) describes owner controls over OAuth access. | Show organization approval separately from user authorization. |
| Slack pilot distribution is equivalent to commercial distribution. | [Slack distribution](https://docs.slack.dev/app-management/distribution/) distinguishes pilot/unlisted use and the commercial Marketplace path, alongside workspace controls. | Make the distribution assumption and separate owners explicit. |
| A Linear OAuth integration can request read access and exchange a code. | [Linear OAuth](https://linear.app/developers/oauth-2-0-authentication) documents the `read` scope, authorization URL, code exchange, state matching and token lifecycle. [App manifests](https://linear.app/developers/oauth-app-manifests) describes structured registration configuration. | Preserve source-backed implementation guidance, without claiming the flow was executed. |
| No documented waiting period means zero waiting. | The real saved Linear guide had unknown approval gates alongside an editorial “None documented” label. | Correct overall waiting to unknown. Preserve original evidence; explicitly version historical corrected views. |

The public Linear app-registration URL was fetched without credentials. It returned a client-rendered application shell. The authenticated form was not inspected or submitted. This does not establish that any registration field or setup step was completed.

## Executed checks

- Real Gemini synthesis: saved Linear guide `r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45`; job `job_958b2e4a-2b73-468e-a103-83e3cfcd6969`. Three fetched sources; about 44 seconds; partial result.
- Post-correction public HTTP suite: **15/15 passed**, including saved-guide and job parity across REST, Markdown and MCP. The saved guide now exposes version `2026-10-21.1.wait-policy1`; overall waiting is unknown and the original estimate is retained in its detail. The stored snapshot and scenario were not overwritten.
- Waiting-policy suite: **8 checks passed**, covering missing evidence, stage estimates, unchanged supported estimates, idempotence, input immutability, no invented gates, versioned historical correction and unchanged editorial records.
- TypeScript and Vercel production builds passed.
- A later real research attempt fetched three sources, then Gemini returned **503 UNAVAILABLE** for high demand. Failed job `job_d3289729-45e4-4a0f-b074-865b021399e6` persisted; no generated guide was invented. Earlier billing/quota failures are historical and separate from this service failure.
- PDF: four rendered pages inspected; embedded text and link annotations checked. Guide excerpts are reconstructed from actual public API data and labelled accordingly; they are not browser screenshots.

Reproduce without a model call:

```sh
node tests/waiting-policy.cjs
node tests/acceptance.mjs https://charter-oauth-guide.vercel.app --saved=r_1c9eedc0-9b6f-4529-bf51-48f839f1ab45 --job=job_958b2e4a-2b73-468e-a103-83e3cfcd6969
```

## Not established

No user interviews, measured developer time savings, provider registration, token exchange or approval submission. Reference checks do not establish semantic accuracy of every generated claim. Browser control is unavailable, so current hosted rendered interaction checks are not claimed. Arbitrary-provider coverage and live model availability remain unproven beyond the recorded runs. The source repository is private and evaluators need access.
