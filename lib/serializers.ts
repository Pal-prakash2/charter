import type { Guide } from "./domain";

const line = (value: string) => value.replace(/[\r\n]+/g, " ");

/** One serializer is used by both REST and MCP; source IDs stay traceable. */
export function guideMarkdown(guide: Guide, origin = ""): string {
  const contextQuery = new URLSearchParams(guide.context).toString();
  const cites = (ids: string[]) => ids.length ? ` Sources: ${ids.map(id => `[${id}]`).join(", ")}.` : " Evidence not established.";
  return [
    `# ${line(guide.name)} — OAuth launch guide`, "",
    `> ${line(guide.summary)}`, "",
    `Guide ID: ${guide.id} · Version: ${guide.version} · Checked: ${guide.checkedAt}`,
    `Origin: ${guide.origin} · Research: ${guide.researchStatus}`,
    `Context: ${guide.context.audience} audience; ${guide.context.capability} capability; ${guide.context.stage} stage.`, "",
    "## Next action", guide.nextAction, "",
    "## Work and waiting",
    `- Difficulty: ${guide.difficulty}`,
    `- Hands-on effort: ${guide.effort.label} (${guide.effort.basis}). ${guide.effort.detail}${cites(guide.effort.sourceIds)}`,
    `- External waiting: ${guide.waiting.label} (${guide.waiting.basis}). ${guide.waiting.detail}${cites(guide.waiting.sourceIds)}`, "",
    "## Prerequisites", ...guide.prerequisites.map(item => `- ${item}`), "",
    "## Launch gates", ...guide.gates.map(gate => `- **${gate.title}** [${gate.status}]: ${gate.reason}${cites(gate.sourceIds)}`), "",
    "## Launch plan", ...guide.steps.flatMap((step, index) => [
      `### ${index + 1}. ${line(step.title)}`, `ID: ${step.id} · Actor: ${step.actor} · Phase: ${step.phase}`,
      step.detail, `Completion evidence: ${step.completion}`,
      `Depends on: ${step.dependsOn.length ? step.dependsOn.join(", ") : "none"}.${cites(step.sourceIds)}`,
      ...(step.url ? [`Open: ${step.url}`] : []), "",
    ]),
    "## Blockers", ...guide.blockers.map(item => `- **${item.title}**: ${item.symptom} ${item.resolution} Actor: ${item.actor}.${cites(item.sourceIds)}`), "",
    "## Unresolved questions", ...(guide.unknowns.length ? guide.unknowns.map(item => `- ${item}`) : ["- No additional unresolved questions recorded; verify provider rules before launch."]), "",
    "## Agent handoff",
    guide.agentBrief || `Implement only the steps assigned to the agent. Ask the developer to resolve prerequisites and unknowns. Never treat conditional or unknown gates as approved. Do not request account passwords or secrets in chat.`, "",
    "## Sources", ...guide.sources.map(source => `- [${source.id}] [${line(source.title)}](${source.url}) — ${source.kind}; checked ${source.checkedAt}`), "",
    ...(origin ? [`Visual guide: ${origin}/?guide=${encodeURIComponent(guide.id)}&${contextQuery}`, `JSON: ${origin}/api/guides/${encodeURIComponent(guide.id)}?${contextQuery}`, ""] : []),
  ].join("\n");
}

export const toMarkdown = guideMarkdown;
