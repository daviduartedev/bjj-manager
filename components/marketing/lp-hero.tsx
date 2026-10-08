import {
  LpDisplay,
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
      <p className="font-sans text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{kicker}</p>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LpHero
// ---------------------------------------------------------------------------

export function LpHero() {
  return (
    <LpSection className="pt-24 sm:pt-28">
      {/* Centered copy block */}
      <LpReveal onLoad>
        <div className="mx-auto w-full max-w-7xl text-center">
          <LpDisplay className="whitespace-nowrap text-[clamp(1.15rem,4.4vw,4rem)]">
            Se preocupe apenas em dar aula.
          </LpDisplay>
        </div>
      </LpReveal>

      {/* Subcopy + CTAs */}
      <LpReveal onLoad delay={0.12}>
        <div className="text-center mx-auto max-w-3xl">
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/65 sm:text-lg">
            No Casca, você visualiza e organiza toda a gestão da sua academia em um só lugar.
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

      {/* Capability strip */}
      <LpReveal
        onLoad
        delay={0.22}
        className="mt-24 grid grid-cols-2 gap-10 text-left lg:grid-cols-4 lg:gap-14"
      >
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
      </LpReveal>
    </LpSection>
  );
}
