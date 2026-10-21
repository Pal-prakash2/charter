import { getResearchResult } from "@/lib/research";
import { json, apiError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const result=await getResearchResult(id);return result?json(result):json({error:"Research job not found."},404);}catch(error){return apiError(error);}}
