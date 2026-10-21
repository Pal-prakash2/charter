import type { Estimate, Gate, Guide } from "./domain";

/** A documented stage duration cannot establish the full launch wait. */
export function conservativeWaiting(waiting: Estimate, gates: Gate[]): Estimate {
  const unknown = gates.filter(gate => gate.status === "unknown");
  if (!unknown.length || (waiting.basis === "unknown" && waiting.label === "End-to-end wait not established")) return waiting;
  return {
    label: "End-to-end wait not established",
    basis: "unknown",
    detail: `Unresolved launch gates: ${unknown.map(gate => gate.title).join("; ")}. The evidence does not establish the full external wait. Original ${waiting.basis} estimate: ${waiting.label}. ${waiting.detail}`,
    sourceIds: [...waiting.sourceIds],
  };
}

/** Version the corrected representation without rewriting stored evidence. */
export function withWaitingPolicy(guide: Guide): Guide {
  if (guide.origin !== "generated") return guide;
  const waiting = conservativeWaiting(guide.waiting, guide.gates);
  if (waiting === guide.waiting) return guide;
  return { ...guide, waiting, researchStatus: "partial", version: `${guide.version}.wait-policy1` };
}
