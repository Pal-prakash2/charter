import "server-only";
import { getVercelOidcToken } from "@vercel/functions/oidc";

// Resolve at request time. Never place these credentials in client props or logs.
export async function modelConfig() {
  if (process.env.RESEARCH_PROVIDER === "gemini") {
    const token=process.env.GEMINI_API_KEY || process.env.gemini_key;
    return token ? {provider:"gemini" as const,token,baseURL:"https://generativelanguage.googleapis.com/v1beta",model:process.env.RESEARCH_MODEL || "gemini-3.8-flash"} : null;
  }
  // Keep the existing sealed deployment secret usable without copying its value.
  const openaiKey=process.env.OPENAI_API_KEY || process.env.Openai_key;
  if (openaiKey && process.env.RESEARCH_PROVIDER !== "gateway") {
    return { provider:"openai" as const, token:openaiKey, baseURL:"https://api.openai.com/v1", model:process.env.RESEARCH_MODEL || "gpt-5-mini" };
  }
  // An explicit OpenAI selection must not silently use another billing account.
  if (process.env.RESEARCH_PROVIDER === "openai") return null;
  let token=process.env.AI_GATEWAY_API_KEY;
  if (!token && (process.env.VERCEL || process.env.VERCEL_OIDC_TOKEN)) {
    try { token=await getVercelOidcToken(); } catch { /* No deployment identity available. */ }
  }
  if (!token) return null;
  const selected=process.env.RESEARCH_MODEL || "openai/gpt-5-mini";
  return { provider:"gateway" as const, token, baseURL:"https://ai-gateway.vercel.sh/v1", model:selected.includes("/")?selected:`openai/${selected}` };
}

export async function researchConfiguration() {
  const config=await modelConfig();
  return {configured:Boolean(config),mode:config?"ai-research":"evidence-only",provider:config?.provider??null,model:config?.model??null,
    detail:config?"Live web research and validated guide synthesis. Requests depend on model access and available provider credit.":"Live documentation retrieval is available. Without a configured model connection, results are partial evidence snapshots; requirements and timelines remain unresolved."};
}
