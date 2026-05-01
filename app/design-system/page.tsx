import { DesignSystemGallery } from "@/app/design-system/design-system-gallery";

/** Em produção o acesso é bloqueado em `middleware.ts` (404). */
export default function DesignSystemPage() {
  return <DesignSystemGallery />;
}
