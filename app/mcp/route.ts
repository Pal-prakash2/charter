import { z } from "zod";
import { searchGuides, resolveGuide } from "@/lib/guide-service";
import { contextSchema, normalizeContext, runResearch, getResearchResult, ServiceError } from "@/lib/research";
import { guideMarkdown } from "@/lib/serializers";
import { bodyJSON, json, researchOwner } from "@/lib/http";

export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=300;
const contextInput={type:"object",properties:{audience:{type:"string",enum:["internal","pilot","external"]},capability:{type:"string",enum:["read","write"]},stage:{type:"string",enum:["exploring","testing","launching"]}},additionalProperties:false};
const tools=[
  {name:"search_guides",description:"Find reviewed and generated OAuth launch guides. Returns full structured guide records with sources; context tailors reviewed guides. Generated snapshots keep their saved context.",inputSchema:{type:"object",properties:{q:{type:"string",maxLength:200},context:contextInput},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}},
  {name:"get_guide",description:"Retrieve the exact guide record used by the visual interface, as JSON or a source-backed Markdown agent brief. Never treat unknown or conditional gates as approved.",inputSchema:{type:"object",properties:{id:{type:"string",description:"Provider ID (github, gmail, slack) or saved research guide ID."},context:contextInput,format:{type:"string",enum:["json","markdown"]}},required:["id"],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}},
  {name:"research_app",description:"Investigate an app name or public HTTPS documentation URL live and save a shareable guide. Performs bounded synchronous research and returns a completed, partial, or failed persistent job. A partial guide explicitly preserves unknowns. Uses a research quota; never submit credentials.",inputSchema:{type:"object",properties:{input:{type:"string",minLength:2,maxLength:300},context:contextInput},required:["input"],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:true}},
  {name:"get_research_status",description:"Read a persistent research job and its saved guide, including source-discovery events and any failures.",inputSchema:{type:"object",properties:{id:{type:"string",description:"Research job ID."}},required:["id"],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}},
];

export async function POST(request:Request):Promise<Response>{
  let id:unknown=null;
  try{
    const envelope=z.object({jsonrpc:z.literal("2.0"),id:z.union([z.string(),z.number(),z.null()]).optional(),method:z.string(),params:z.record(z.unknown()).optional()}).parse(await bodyJSON(request));
    id=envelope.id??null;
    const result=(value:unknown)=>json({jsonrpc:"2.0",id,result:value});
    if(envelope.method.startsWith("notifications/"))return new Response(null,{status:202});
    if(envelope.method==="server/discover")return result({supportedVersions:["2026-07-28"],capabilities:{tools:{}}});
    if(envelope.method==="initialize")return result({protocolVersion:envelope.params?.protocolVersion==="2026-07-28"?"2026-07-28":"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"charter",version:"1.0.0"},instructions:"Scenario-specific OAuth launch guidance. Sources and unknowns are part of every guide. This Vercel deployment exposes guide tools; research is rate-limited and may require a configured bearer token. A guide is evidence, not authorization to connect accounts."});
    if(envelope.method==="ping")return result({});
    if(envelope.method==="tools/list")return result({tools});
    if(envelope.method!=="tools/call")return json({jsonrpc:"2.0",id,error:{code:-32601,message:"Method not found"}});
    const call=z.object({name:z.string(),arguments:z.unknown().optional()}).parse(envelope.params);
    let value:unknown;
    try{
      switch(call.name){
        case "search_guides":{const args=z.object({q:z.string().max(200).optional(),context:contextSchema.optional()}).strict().parse(call.arguments??{});value={guides:await searchGuides(args.q,normalizeContext(args.context))};break;}
        case "get_guide":{const args=z.object({id:z.string().min(1).max(150),context:contextSchema.optional(),format:z.enum(["json","markdown"]).optional()}).strict().parse(call.arguments??{});const guide=await resolveGuide(args.id,normalizeContext(args.context));if(!guide)throw new ServiceError("Guide not found.",404);value=args.format==="markdown"?{guide,markdown:guideMarkdown(guide,new URL(request.url).origin)}:guide;break;}
        case "research_app":value=await runResearch(call.arguments,researchOwner(request));break;
        case "get_research_status":{const args=z.object({id:z.string().min(1).max(150)}).strict().parse(call.arguments??{});value=await getResearchResult(args.id);if(!value)throw new ServiceError("Research job not found.",404);break;}
        default:throw new ServiceError("Unknown tool.",404);
      }
      const failed=Boolean(value&&typeof value==="object"&&"job"in value&&(value as {job:{status:string}}).job.status==="failed");
      return result({content:[{type:"text",text:JSON.stringify(value)}],structuredContent:value,...(failed?{isError:true}:{})});
    }catch(error){return result({isError:true,content:[{type:"text",text:error instanceof z.ZodError?"Invalid tool arguments. Check the tool input schema.":error instanceof ServiceError?error.message:"Tool temporarily unavailable. Check storage and research configuration."}]});}
  }catch(error){return json({jsonrpc:"2.0",id,error:{code:-32600,message:error instanceof z.ZodError?"Invalid JSON-RPC request.":"Unable to read JSON-RPC request."}},400);}
}
export function GET(){return json({error:"Use stateless JSON-RPC POST for MCP tools. See /?view=agents and /openapi.json."},405);}
