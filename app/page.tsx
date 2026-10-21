import Charter from "@/components/fieldguide";
import { listGuides } from "@/lib/guides";
export default function Home() { return <Charter initialGuides={listGuides()} />; }
