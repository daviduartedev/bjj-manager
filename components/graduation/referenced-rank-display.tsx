import type { ReferencedRank, RankColor } from "@/lib/modalities/referenced-ranks";
const colors: Record<RankColor, string> = { white:"#ffffff",gray:"#9ca3af",blue:"#2563eb",yellow:"#facc15",orange:"#f97316",green:"#15803d",purple:"#9333ea",brown:"#854d0e",black:"#171717",red:"#dc2626" };

/** CBJ2023 p7 §3: bicolores básicas têm cor seguinte nas duas pontas.
 * Dan6–8: segmentos vermelhos/brancos. Sem listras de grau de Jiu-Jitsu. */
export function JudoBeltIllustration({ rank, compact = false, decorative = false }: { rank: ReferencedRank; compact?: boolean; decorative?: boolean }) {
  const base=colors[rank.colors[0]];
  const second=colors[rank.colors[1] ?? rank.colors[0]];
  return <svg viewBox="0 0 160 48" width={compact ? 72 : 160} height={compact ? 24 : 48} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `Faixa de Judô: ${rank.label}`} className="shrink-0 rounded bg-white">
    <title>{`Faixa de Judô: ${rank.label}`}</title>
    <rect x="4" y="14" width="152" height="20" rx="2" fill={base} stroke="#475569" strokeWidth="1.5" />
    {rank.pattern === "tips" ? <><rect x="4" y="15" width="27" height="18" fill={second} /><rect x="129" y="15" width="27" height="18" fill={second} /></> : null}
    {rank.pattern === "alternating" ? [1,3,5].map(i => <rect key={i} x={4+i*25.3} y="15" width="25.3" height="18" fill={second} />) : null}
    <path d="M72 12 L89 16 L87 36 L70 32 Z" fill={base} stroke="#475569" strokeWidth="1.5" />
    <path d="M74 16 L85 31 M85 17 L74 30" stroke="#64748b" strokeWidth="1" />
  </svg>;
}

/** Reutilizado no seletor, na ficha, na lista e na apresentação do histórico. */
export function ReferencedRankDisplay({ rank, compact = false }: { rank: ReferencedRank; compact?: boolean }) {
  return <span className="inline-flex flex-wrap items-center gap-2">
    {rank.modality === "judo" ? <JudoBeltIllustration rank={rank} compact={compact} decorative /> : null}
    <span>{rank.label}</span>
  </span>;
}
