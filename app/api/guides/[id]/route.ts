import { resolveGuide } from "@/lib/guide-service";
import { contextFromURL } from "@/lib/research";
import { json, apiError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const guide=await resolveGuide(id,contextFromURL(new URL(request.url)));return guide?json(guide):json({error:"Guide not found."},404);}catch(error){return apiError(error);}}
