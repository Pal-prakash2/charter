import { json } from "@/lib/http";
import { storageAvailable } from "@/lib/store";
import { researchConfiguration } from "@/lib/model-config";
export const dynamic="force-dynamic";
export async function GET(){return json({name:"Charter",schemaVersion:"1.0",research:await researchConfiguration(),storage:await storageAvailable()?"vercel-blob":"unavailable",mcp:{path:"/mcp",protocolVersions:["2026-07-28","2025-03-26"],tools:4}});}
