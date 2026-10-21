import { searchGuides } from "@/lib/guide-service";
import { contextFromURL } from "@/lib/research";
import { json, apiError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const url=new URL(request.url);return json({guides:await searchGuides((url.searchParams.get("q")??"").slice(0,200),contextFromURL(url))});}catch(error){return apiError(error);}}
