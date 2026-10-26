import { Award, ChevronLeft } from "lucide-react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import {
  Abs,
  AppWindow,
  BeltBar,
  Button,
  C,
  Card,
  Field,
  ModalShell,
  PageFade,
  PageHeader,
  Pill,
  Toast,
  type BeltName,
} from "@/components/marketing/promo/ui";
import { press, progress, typed } from "@/components/marketing/promo/timeline";

// Dados da cena
// ---------------------------------------------------------------------------

const HISTORY: ReadonlyArray<{ title: string; date: string; by: string; belt: BeltName; deg: number }> = [
  { title: "Grau 4 · Faixa azul", date: "12/03/2026", by: "Prof. Marcos", belt: "Azul", deg: 4 },
  { title: "Grau 3 · Faixa azul", date: "21/11/2025", by: "Prof. Marcos", belt: "Azul", deg: 3 },
  { title: "Grau 2 · Faixa azul", date: "09/06/2025", by: "Prof. Marcos", belt: "Azul", deg: 2 },
];

const ROW_H = 92;

// ---------------------------------------------------------------------------
// Modal "Nova graduação" (coordenadas locais ao modal)
// ---------------------------------------------------------------------------

const MODAL = { x: 520, y: 70, w: 800, h: 740 } as const;

function Chip({
  x,
  y,
  label,
  on,
  pr,
  w = 200,
  belt,
}: {
  x: number;
  y: number;
  label: string;
  on: boolean;
  pr: number;
  w?: number;
  belt?: BeltName;
}) {
  return (
    <Abs
      x={x}
      y={y}
      w={w}
      h={56}
      style={{
        boxSizing: "border-box",
        borderRadius: 16,
        border: `2px solid ${on ? C.red : C.line}`,
        background: on ? C.redSoft : "#fff",
        color: on ? C.red : "#3b4048",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: 22,
        fontWeight: 700,
        transform: `scale(${1 - pr * 0.05})`,
      }}
    >
      {belt ? <BeltBar belt={belt} w={52} /> : null}
      {label}
    </Abs>
  );
}

function PromotionModal({ frame }: { frame: number }) {
  const p = progress(frame, 36, 14) * (1 - progress(frame, 204, 10));
  const kindFaixa = frame >= 62;
  const beltRoxa = frame >= 84;
  const date = typed("08/10/2026", frame, 106, 2.2);
  const note = typed("Avaliação técnica aprovada.", frame, 146, 1.4);

  return (
    <ModalShell p={p} {...MODAL} title="Nova graduação">
      <Abs x={40} y={104} style={{ fontSize: 20, fontWeight: 700, color: "#3b4048" }}>
        Tipo
      </Abs>
      <Chip x={40} y={138} label="Grau" on={!kindFaixa} pr={0} />
      <Chip x={260} y={138} label="Faixa" on={kindFaixa} pr={press(frame, 62)} />

      <Abs x={40} y={216} style={{ fontSize: 20, fontWeight: 700, color: "#3b4048" }}>
        Nova faixa
      </Abs>
      <Chip x={40} y={250} label="Azul" belt="Azul" on={false} pr={0} />
      <Chip x={260} y={250} label="Roxa" belt="Roxa" on={beltRoxa} pr={press(frame, 84)} />
      <Chip x={480} y={250} label="Marrom" belt="Marrom" on={false} pr={0} />

      <Field
        x={40}
        y={366}
        w={330}
        label="Data"
        value={date}
        placeholder="dd/mm/aaaa"
        focused={frame >= 102 && frame < 140}
        frame={frame}
      />
      <Field
        x={40}
        y={482}
        w={720}
        label="Justificativa"
        value={note}
        placeholder="Por que esta promoção?"
        focused={frame >= 142 && frame < 202}
        frame={frame}
      />

      <Button x={260} y={640} w={180} label="Cancelar" variant="soft" />
      <Button x={500} y={640} w={260} label="Promover" Icon={Award} pressed={press(frame, 202)} />
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Cena
// ---------------------------------------------------------------------------

export function GraduacaoScene() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const wipe = progress(frame, 218, 30);
  const eventP = progress(frame, 224, 18);
  const flash = frame < 224 ? 0 : Math.max(0, 1 - (frame - 224 - 10) / 40);
  const glow = frame < 218 ? 0 : Math.max(0, Math.sin(((frame - 218) / 40) * Math.PI));
  const toastIn = progress(frame, 228, 12) * (1 - progress(frame, 262, 8));
  const promoted = wipe > 0.6;

  return (
    <AppWindow active="alunos">
      <PageFade frame={frame} duration={durationInFrames}>
        <PageHeader title="Graduação" subtitle="Marina Alves" />

        <Abs x={348} y={124} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
          <ChevronLeft size={26} /> Marina Alves
        </Abs>

        <Abs x={348} y={176} style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Estado atual
        </Abs>
        <Card
          x={348}
          y={232}
          w={1444}
          h={180}
          style={{ boxShadow: `0 0 0 ${glow * 3}px rgba(126,34,206,${glow * 0.35}), 0 18px 40px -16px rgba(16,24,40,0.18)` }}
        >
          {/* Faixa atual → nova faixa com wipe */}
          <Abs x={40} y={52} w={300} h={45}>
            {wipe < 1 ? <BeltBar belt="Azul" degrees={4} w={300} /> : null}
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: wipe < 1 ? `inset(0 ${(1 - wipe) * 100}% 0 0)` : undefined,
              }}
            >
              <BeltBar belt="Roxa" degrees={0} w={300} />
            </div>
          </Abs>
          <Abs x={40} y={112} style={{ fontSize: 19, color: C.muted }}>
            {promoted ? "Sem grau" : "4 graus"}
          </Abs>
          <Abs x={400} y={40}>
            <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {promoted ? "Faixa roxa" : "Faixa azul"}
            </div>
            <div style={{ fontSize: 22, color: C.muted, marginTop: 8 }}>
              {promoted ? "Promovida hoje · 08/10/2026" : "Tempo na faixa: 2 anos e 3 meses"}
            </div>
            <div style={{ marginTop: 14 }}>
              {promoted ? (
                <Pill bg={C.greenSoft} color="#15803d">
                  Promoção registrada
                </Pill>
              ) : (
                <Pill bg={C.amberSoft} color="#b45309">
                  Pronta para a faixa roxa
                </Pill>
              )}
            </div>
          </Abs>
          <Button x={1104} y={60} w={300} label="Adicionar" Icon={Award} pressed={press(frame, 34)} />
        </Card>

        <Abs x={348} y={452} style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Eventos
        </Abs>
        <Card x={348} y={508} w={1444} h={380} style={{ overflow: "hidden" }}>
          {HISTORY.map((e, i) => (
            <Abs
              key={e.title}
              x={0}
              y={i * ROW_H + eventP * ROW_H}
              w={1444}
              h={ROW_H}
              style={{ borderTop: i === 0 && eventP === 0 ? "none" : `1px solid ${C.line}` }}
            >
              <EventRow {...e} />
            </Abs>
          ))}
          {eventP > 0 ? (
            <Abs
              x={0}
              y={0}
              w={1444}
              h={ROW_H}
              style={{
                opacity: eventP,
                transform: `translateY(${(1 - eventP) * -40}px)`,
                background: `rgba(243,232,255,${flash * 0.9})`,
              }}
            >
              <EventRow
                title="Faixa roxa"
                date="08/10/2026"
                by="Avaliação técnica aprovada."
                belt="Roxa"
                deg={0}
              />
            </Abs>
          ) : null}
        </Card>

        <PromotionModal frame={frame} />
        <Toast x={760} y={18} text="Graduação registrada: faixa roxa" progress={toastIn} />
      </PageFade>
    </AppWindow>
  );
}

function EventRow({
  title,
  date,
  by,
  belt,
  deg,
}: {
  title: string;
  date: string;
  by: string;
  belt: BeltName;
  deg: number;
}) {
  return (
    <>
      <Abs x={40} y={0} h={ROW_H} style={{ display: "flex", alignItems: "center" }}>
        <BeltBar belt={belt} degrees={deg} w={120} />
      </Abs>
      <Abs x={200} y={0} h={ROW_H} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 25, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 20, color: C.muted, marginTop: 4 }}>{by}</div>
      </Abs>
      <Abs x={1180} y={0} h={ROW_H} style={{ display: "flex", alignItems: "center", fontSize: 23, color: "#3b4048" }}>
        {date}
      </Abs>
    </>
  );
}
