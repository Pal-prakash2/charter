import { z } from "zod";
import { ServiceError } from "./research";
import { runtimeEnv } from "./store";
import { createHash, timingSafeEqual } from "node:crypto";

export const jsonHeaders={"cache-control":"no-store","x-content-type-options":"nosniff"};
export function json(value:unknown,status=200):Response {return Response.json(value,{status,headers:jsonHeaders});}
export function apiError(error:unknown):Response {
  if(error instanceof z.ZodError)return json({error:"Invalid request.",details:error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`)},400);
  if(error instanceof ServiceError)return json({error:error.message},error.status);
  return json({error:"The service is temporarily unavailable. Existing editorial guides may still be available."},503);
}
export async function bodyJSON(request:Request):Promise<unknown> {
  if(Number(request.headers.get("content-length")??0)>12000)throw new ServiceError("Request is too large.",413);
  const reader=request.body?.getReader();
  if(!reader)throw new ServiceError("Send a valid JSON request body.");
  let size=0,text="";const decoder=new TextDecoder();
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>12000){await reader.cancel();throw new ServiceError("Request is too large.",413);}text+=decoder.decode(part.value,{stream:true});}}finally{reader.releaseLock();}
  try{return JSON.parse(text);}catch{throw new ServiceError("Send a valid JSON request body.");}
}

export function researchOwner(request:Request):string {
  const origin=request.headers.get("origin");
  if(origin && origin!==new URL(request.url).origin)throw new ServiceError("Cross-origin research requests are not allowed.",403);
  const secret=runtimeEnv().RESEARCH_ACCESS_TOKEN;
  if(secret){
    const supplied=request.headers.get("authorization")?.replace(/^Bearer /i,"")??"";
    const a=Buffer.from(supplied), b=Buffer.from(secret);
    if(a.length!==b.length||!timingSafeEqual(a,b))throw new ServiceError("This deployment requires a research access token.",401);
  }
  // Vercel supplies forwarding metadata. It is a quota signal, never identity.
  // The durable global quota still caps spend if client metadata is unavailable.
  const address=request.headers.get("x-vercel-forwarded-for")||request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()||"local-or-service";
  return `caller:${createHash("sha256").update(address).digest("hex").slice(0,32)}`;
}
