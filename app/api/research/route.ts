import { runResearch } from "@/lib/research";
import { json, apiError, bodyJSON, researchOwner } from "@/lib/http";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=300;
export async function POST(request:Request){try{const owner=researchOwner(request);const result=await runResearch(await bodyJSON(request),owner);return json(result,result.job.status==="failed"?422:201);}catch(error){return apiError(error);}}
