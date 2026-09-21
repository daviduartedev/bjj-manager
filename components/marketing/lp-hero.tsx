import {
  LpBrowserFrame,
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";
import { LpEnterLink } from "@/components/marketing/lp-chrome";

// ---------------------------------------------------------------------------
// Capability strip item
// ---------------------------------------------------------------------------

function CapabilityItem({ kicker, label }: { kicker: string; label: string }) {
  return (
    <div>
      <p className="font-lp text-xl sm:text-2xl font-extrabold uppercase">{kicker}</p>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LpHero
// ---------------------------------------------------------------------------

export function LpHero() {
  return (
    <LpSection
      className="relative isolate overflow-hidden pt-28 sm:pt-36"
    >
      {/* Glow blob behind the browser frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-bjj-red/15 blur-[120px]"
      />

      {/* Centered copy block */}
      <LpReveal>
        <div className="text-center mx-auto max-w-3xl">
          <LpEyebrow>Gestão para academias de jiu-jitsu</LpEyebrow>

          <LpDisplay className="text-[clamp(2.75rem,7vw,5.5rem)] mt-6">
            Alunos, faixas e mensalidades na mesma ficha.
          </LpDisplay>
        </div>
      </LpReveal>

      {/* Subcopy + CTAs */}
      <LpReveal delay={0.08}>
        <div className="text-center mx-auto max-w-3xl">
          <p className="mt-6 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl mx-auto">
            Casca é o sistema da academia de jiu-jitsu: cadastro adulto e kids, graduação com
            histórico, financeiro do mês e o painel do dia. Sem planilha.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <LpEnterLink className="h-12 px-8" />
            <a
              href="#funcionalidades"
              className="inline-flex h-12 items-center rounded-full border border-white/15 px-8 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition-colors"
            >
              Ver o sistema
            </a>
          </div>
        </div>
      </LpReveal>

      {/* Browser frame */}
      <LpReveal className="mt-14 sm:mt-16 mx-auto max-w-5xl" delay={0.15}>
        <LpBrowserFrame
          src="/marketing/lp-real-painel.png"
          alt="Painel do Casca com o resumo operacional do dia"
          url="casca.app/painel"
          priority
        />
      </LpReveal>

      {/* Capability strip */}
      <div className="mt-16 border-t border-white/10 pt-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        <CapabilityItem
          kicker="Adulto e kids"
          label="O mesmo cadastro cobre as duas linhas da escola."
        />
        <CapabilityItem
          kicker="Faixa e grau"
          label="Histórico com data. Pulo de ordem pede justificativa."
        />
        <CapabilityItem
          kicker="O mês"
          label="Pago, pendente, atrasado, bolsista ou outro. Você confirma."
        />
        <CapabilityItem
          kicker="Sua academia"
          label="Isolamento por conta. Cada escola vê só os seus dados."
        />
      </div>
    </LpSection>
  );
}
