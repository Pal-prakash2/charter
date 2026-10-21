import { resolveGuide } from "@/lib/guide-service";
import { contextFromURL } from "@/lib/research";
import { guideMarkdown } from "@/lib/serializers";
import { json, apiError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params,url=new URL(request.url);const guide=await resolveGuide(id,contextFromURL(url));return guide?new Response(guideMarkdown(guide,url.origin),{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}}):json({error:"Guide not found."},404);}catch(error){return apiError(error);}}
