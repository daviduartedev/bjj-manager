import { Hand } from "lucide-react";
import { PageFrame } from "@/components/prototype/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return <PageFrame title="Início" emoji="🏠" icon={Hand} tone="amber">
    <div aria-busy="true" aria-label="Carregando sua ficha"><Skeleton className="h-80 rounded-lg" /></div>
  </PageFrame>;
}
