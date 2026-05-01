import Image from "next/image";

import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  imgClassName?: string;
  /** Altura da imagem em px (largura proporcional). */
  height?: number;
  priority?: boolean;
};

/**
 * Logo Casca sobre fundo preto da identidade — usar em header escuro / hero.
 */
export function LogoMark({
  className,
  imgClassName,
  height = 28,
  priority,
}: LogoMarkProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-bjj-black px-2.5 py-1.5 ring-1 ring-white/12",
        className,
      )}
    >
      <Image
        src="/Logo.png"
        alt={APP_NAME}
        width={200}
        height={height}
        priority={priority}
        className={cn(
          "w-auto max-w-[min(100%,12rem)] object-contain object-left sm:max-w-[14rem]",
          imgClassName,
        )}
        style={{ height }}
      />
    </div>
  );
}
