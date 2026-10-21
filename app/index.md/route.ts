import { searchGuides } from "@/lib/guide-service";
import { contextFromURL } from "@/lib/research";
import { catalogMarkdown } from "@/lib/catalog-markdown";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const url=new URL(request.url);const context=contextFromURL(url);
 const guides=await searchGuides(url.searchParams.get("q")??undefined,context);
 return new Response(catalogMarkdown(guides,url.origin,context),{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
