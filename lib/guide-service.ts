import { listGuides, getGuide } from "./guides";
import type { Context, Guide } from "./domain";
import { readGeneratedGuide, listGeneratedGuides } from "./store";

export async function searchGuides(q="", context?:Partial<Context>):Promise<Guide[]> {
  let generated:Guide[]=[];
  try { generated=await listGeneratedGuides(); } catch { /* Editorial catalog remains usable when research storage is unavailable. */ }
  const guides=[...listGuides(context),...generated];
  const terms=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return guides.filter(g=>terms.every(term=>`${g.name} ${g.providerId} ${g.category} ${g.subtitle}`.toLowerCase().includes(term)));
}

export async function resolveGuide(id:string,context?:Partial<Context>):Promise<Guide|null> {
  if(id.startsWith("r_")) return readGeneratedGuide(id);
  return getGuide(id,context)??null;
}
