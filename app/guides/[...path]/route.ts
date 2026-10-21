import { resolveGuide } from "@/lib/guide-service";
import { contextFromURL } from "@/lib/research";
import { guideMarkdown } from "@/lib/serializers";
import { apiError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
 try{const {path}=await params;if(path.length!==1||!path[0].endsWith(".md"))return new Response("Markdown guide not found.",{status:404});const url=new URL(request.url);const guide=await resolveGuide(path[0].slice(0,-3),contextFromURL(url));if(!guide)return new Response("Guide not found.",{status:404});return new Response(guideMarkdown(guide,url.origin),{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});}catch(error){return apiError(error)}
}
