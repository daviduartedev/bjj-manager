import { Geologica } from "next/font/google";
import Link from "next/link";

import { LpOutlineLink } from "@/components/marketing/lp-chrome";
import { LpReveal, LpScrollDrift } from "@/components/marketing/lp-primitives";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

const heroDisplay = Geologica({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const CAPABILITIES = ["Cadastro completo", "Faixas e graus", "Mensalidade do mês", "Painel do dia"] as const;

export function LpHero() {
  return (
    <section className="bg-white pb-10 pt-28 sm:pb-14 sm:pt-36">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-16">
        <div className="max-w-5xl">
          <LpReveal onLoad direction="drop" duration={1.05}>
            <h1
              className={`${heroDisplay.className} max-w-[18ch] text-[clamp(2.5rem,5.2vw,4.75rem)] leading-[1.02] tracking-[-0.05em] text-foreground`}
            >
              A plataforma <span className="text-brand-blue">brasileira</span> para gestão de academias de{" "}
              <span className="text-brand-green">artes marciais</span>.
            </h1>
          </LpReveal>
          <LpReveal onLoad direction="left" delay={0.12}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Do primeiro cadastro à troca de faixa: acompanhe alunos, aulas e mensalidades com uma rotina
              feita para quem ensina e administra no Brasil.
            </p>
          </LpReveal>
          <LpReveal onLoad direction="scale" delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-blue px-6 text-sm font-semibold text-white outline-none transition-[background-color,transform] duration-200 hover:-translate-y-1 hover:bg-brand-blue/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0"
              >
                Começar com o Casca
              </Link>
              <LpOutlineLink href="#como-funciona">Ver como funciona</LpOutlineLink>
            </div>
          </LpReveal>
        </div>

        <LpScrollDrift distance={54} rotate={0} scaleFrom={1} className="mt-12 sm:mt-16">
          <div className="rounded-[1.5rem] border border-black/[0.06] bg-[#f2f5f8] p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-28px_rgba(16,24,40,0.28)] sm:rounded-[2rem] sm:p-3">
            <div className="overflow-hidden rounded-[1.1rem] border border-white bg-[#111416] sm:rounded-[1.5rem]">
              <LpSystemVideo compact />
            </div>
          </div>
        </LpScrollDrift>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-border py-9 text-foreground sm:grid-cols-4">
          {CAPABILITIES.map((capability, index) => (
            <LpReveal key={capability} direction={index % 2 === 0 ? "left" : "right"}>
              <span className={`${heroDisplay.className} text-base leading-tight tracking-[-0.03em] sm:text-xl`}>
                {capability}
              </span>
            </LpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
