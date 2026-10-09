import { LpEnterLink } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import { LpSystemVideo } from "@/components/marketing/lp-system-video";

// ---------------------------------------------------------------------------
// Capability strip item
// ---------------------------------------------------------------------------

function CapabilityItem({ kicker, label }: { kicker: string; label: string }) {
  return (
    <div>
      <p className="font-sans text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LpHero — título, CTAs e o vídeo do sistema na própria hero
// ---------------------------------------------------------------------------

export function LpHero() {
  return (
    <LpSection className="pb-20 pt-28 sm:pb-24 sm:pt-36">
      <LpReveal onLoad>
        <div className="mx-auto w-full max-w-7xl text-center">
          <LpDisplay className="whitespace-nowrap text-[clamp(1.15rem,4.4vw,4rem)]">
            Se preocupe apenas em dar aula.
          </LpDisplay>
        </div>
      </LpReveal>

      <LpReveal onLoad delay={0.12}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/65 sm:text-lg">
            No Casca, você visualiza e organiza toda a gestão da sua academia em um só lugar.
          </p>

          <div className="mt-9 flex items-center justify-center gap-4">
            <LpEnterLink className="h-12 px-8" />
            <a
              href="#sistema"
              className="inline-flex h-12 items-center rounded-full border border-white/15 px-8 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Ver o sistema
            </a>
          </div>
        </div>
      </LpReveal>

      <LpReveal onLoad delay={0.24} className="mt-14 sm:mt-16">
        <LpSystemVideo />
      </LpReveal>

      <LpReveal className="mt-20 grid grid-cols-2 gap-10 border-t border-white/10 pt-10 text-left lg:grid-cols-4 lg:gap-14">
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
