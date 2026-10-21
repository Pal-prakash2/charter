# Charter build plan

Problem: developers and coding agents need an evidence-backed path from a desired integration to testing and production access. Provider registration, platform review, marketplace distribution, organization consent and user authorization are separate gates.

Acceptance: three genuinely varied reviewed guides; context-sensitive paths; live research beyond seed apps; saved share links; honest partial/failure states; source-backed claims; Markdown and JSON parity; working MCP tools; polished responsive human interface.

Ownership: root owns application UI, design, integration, deployment and acceptance. Content agent owns lib/guides.ts and content notes. Backend agent owns research, persistence, APIs and MCP. Review agent owns product/QA critique and submission documentation. All implementations consume lib/domain.ts. No other agent mutates another owner's files without coordination.

Architecture: one canonical Guide model. Human pages, Markdown, REST and MCP render the same record. Sources and contextual assumptions travel with every representation. Generated findings are never labeled as reviewed. Research must admit missing evidence. Progress preferences are local; generated guides and jobs persist server-side.

Visual direction: Fanout-inspired warm white, strong black typography, blue accent, crisp borders, document cards. Product title Charter. Search stays prominent. Agent access is visible beside human reading.

Delivery: Vercel deployment, source code, README with setup and limitations, live browser/HTTP/MCP checks, screenshots and demo narrative. The Vercel implementation uses private Blob persistence and server-side model authentication through AI Gateway OIDC or an optional model key. Verify evaluator access and live research after deployment; source readiness alone does not establish either. Submission tracking and provider-status integrations are deferred.
