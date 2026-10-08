/** Luz única atrás do título. Não acompanha o scroll. */
export function LpAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="lp-orb absolute left-1/2 top-[8%] h-[22rem] w-[min(56rem,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(191,30,39,0.34),transparent_68%)] blur-3xl" />
    </div>
  );
}
