# Curated content: evidence and limits

Checked against official provider documentation on 21 October 2026. `origin: reviewed` means editorial source review. It does not mean we registered these apps, completed OAuth using credentials, passed review or independently measured turnaround times.

The structured record is the source for the visual guide, Markdown and agent interfaces. It preserves context, source IDs, step dependencies, responsible actors, completion evidence, gate applicability and unknowns. Each curated guide has ten steps; phases separate preparation, implementation, review and launch.

## Intentional profile boundaries

- GitHub: a classic user-authorized OAuth app after an explicit GitHub App decision. Public-only reads differ from private repositories. An OAuth read profile never claims classic `repo` is read-only. Organization-owner access is a separate decision from provider registration and user consent. Marketplace listing is excluded.
- Gmail: read means mailbox reading starting at `gmail.readonly`; write means send-only starting at `gmail.send`, not all writes and not read-and-write. The guide states this shortcut and requires exact endpoint confirmation. Internal and pilot choices make verification conditional because a selection is not evidence of exception eligibility. A genuine internal exception requires the documented ownership and audience conditions. Domain-wide delegation is not treated as a blanket review exemption.
- Slack: read starts with bot `channels:history` for joined public channels; write starts with bot `chat:write`. External assumes commercial distribution. Internal, early-customer pilot and commercial distribution have different plans; a pilot is never represented as unrestricted commercial distribution.
- Stage changes next action; it does not declare prior steps complete or reduce the underlying launch requirements.

## Source decisions

All guide sources are official and linked within the product. Sources checked include registration, authorization, scope references, organization controls and review requirements. We deliberately retained consequential nuances from current documentation:

- GitHub's current registration page supports up to ten callbacks and describes expiring tokens as the default. Current authorization docs recommend PKCE S256. Older one-callback/no-expiry assumptions were avoided.
- Google's current credential instructions expose an AI-agent client option. The credential and web-server pages describe evolving credential behavior differently, so the guide flags that discrepancy and directs implementation to verify the selected client type against the current SDK and console.
- Google classifies send-only and mailbox-read scopes differently. Security-assessment applicability depends on restricted-data access and architecture; a read/write toggle cannot determine it conclusively.
- Google sensitive-scope and restricted-scope timing is attributed to the provider. We do not merge scope review with assessment, preparation, revisions or customer-administrator decisions.
- Slack's current requirements include meaningful in-Slack functionality and exclude a bare MCP server. They also list active-workspace/user criteria. These are product-feasibility constraints, not simply credential-setup details.
- Slack's review timing is attributed to its review-process documentation and must be checked again in app settings for launch planning.

## Remaining validation

No reviewer account, provider client or customer credentials were available. These guides need a real implementation walkthrough with representative accounts before any tested badge is justified. Customer-specific policies, permitted data use, exact scopes, assessment applicability and actual provider decisions remain application-specific. Generated guides should carry a different provenance label and unresolved evidence instead of inheriting editorial review status.
