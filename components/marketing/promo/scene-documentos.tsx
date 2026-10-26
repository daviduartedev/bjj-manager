import {
  Award,
  CheckCheck,
  ClipboardList,
  FileText,
  MessageCircle,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import {
  Abs,
  AppWindow,
  BeltBar,
  Button,
  C,
  Card,
  Field,
  IconBadge,
  PageFade,
  PageHeader,
} from "@/components/marketing/promo/ui";
import {
  press,
  progress,
  typed,
} from "@/components/marketing/promo/timeline";

// Dados da cena
// ---------------------------------------------------------------------------

const DOCS: ReadonlyArray<{ title: string; sub: string; Icon: LucideIcon }> = [
  { title: "Certificado de graduação", sub: "Faixa e grau com data", Icon: Award },
  { title: "Termo de responsabilidade", sub: "Assinado pelo responsável", Icon: ShieldCheck },
  { title: "Comprovante de matrícula", sub: "Plano e vigência", Icon: ClipboardList },
  { title: "Recibo de mensalidade", sub: "Mês de referência", Icon: Receipt },
];

// ---------------------------------------------------------------------------
// Certificado
// ---------------------------------------------------------------------------

function Certificate({ name, p }: { name: string; p: number }) {
  return (
    <Abs
      x={60}
      y={180}
      w={740}
      h={420}
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
        background: "#fffdf8",
        borderRadius: 18,
        boxShadow: "0 30px 60px -24px rgba(16,24,40,0.4)",
        border: "2px solid #e8dcc0",
        boxSizing: "border-box",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          border: "2px solid #c9b27a",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.3em", color: "#0b0b0d" }}>CASCA</div>
        <div style={{ fontSize: 17, letterSpacing: "0.32em", color: "#8b7a4a", fontWeight: 700 }}>
          CERTIFICADO DE GRADUAÇÃO
        </div>
        <div style={{ fontSize: 22, color: C.muted }}>Certificamos que</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            minHeight: 62,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: "italic",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 22, color: "#3b4048" }}>foi promovida à faixa</div>
        <BeltBar belt="Roxa" w={220} />
        <div style={{ fontSize: 19, color: C.muted, marginTop: 6 }}>Gracie Norte · 08/10/2026</div>
      </div>
    </Abs>
  );
}

// ---------------------------------------------------------------------------
// Chat do WhatsApp
// ---------------------------------------------------------------------------

function WhatsApp({ frame }: { frame: number }) {
  const p = progress(frame, 132, 16);
  if (p <= 0.001) return null;
  const bubble = progress(frame, 150, 12);
  const file = progress(frame, 164, 12);
  const read = progress(frame, 196, 10);
  return (
    <Abs
      x={1190}
      y={250}
      w={590}
      h={540}
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`,
        borderRadius: 30,
        overflow: "hidden",
        background: "#efe7dd",
        boxShadow: "0 50px 100px -30px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          height: 90,
          background: "#075e54",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 26px",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 52,
            background: "#25d366",
            display: "grid",
            placeItems: "center",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          M
        </div>
        <div>
          <div style={{ fontSize: 25, fontWeight: 700 }}>Marina Alves</div>
          <div style={{ fontSize: 17, opacity: 0.75 }}>online</div>
        </div>
        <MessageCircle size={30} style={{ marginLeft: "auto" }} />
      </div>

      <Abs
        x={150}
        y={118}
        w={410}
        style={{
          opacity: bubble,
          transform: `translateY(${(1 - bubble) * 18}px)`,
          background: "#d9fdd3",
          borderRadius: "20px 20px 4px 20px",
          padding: "16px 20px",
          fontSize: 23,
          lineHeight: 1.35,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        Parabéns pela faixa roxa, Marina! 🥋 Segue o seu certificado.
      </Abs>

      <Abs
        x={150}
        y={286}
        w={410}
        style={{
          opacity: file,
          transform: `translateY(${(1 - file) * 18}px)`,
          background: "#d9fdd3",
          borderRadius: "20px 20px 4px 20px",
          padding: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <IconBadge Icon={FileText} bg={C.redSoft} color={C.red} size={52} />
          <div>
            <div style={{ fontSize: 21, fontWeight: 700 }}>Certificado-Marina-Alves.pdf</div>
            <div style={{ fontSize: 17, color: C.muted }}>PDF · 184 KB</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 8, fontSize: 16, color: "#667781" }}>
          19:42
          <CheckCheck size={22} color={read > 0.5 ? "#34b7f1" : "#8696a0"} />
        </div>
      </Abs>
    </Abs>
  );
}

// ---------------------------------------------------------------------------
// Cena
// ---------------------------------------------------------------------------

/** `frameOverride` congela a página (usado no fechamento do vídeo). */
export function DocumentosScene({ frameOverride }: { frameOverride?: number }) {
  const local = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const frame = frameOverride ?? local;

  const selected = frame >= 28;
  const name = typed("Marina Alves", frame, 56, 2.2);
  const paperP = progress(frame, 84, 18);
  const sent = frame >= 128;
  const dim = sent ? progress(frame, 128, 14) * 0.35 : 0;

  const page = (
    <>
      <PageHeader title="Documentos" subtitle="Gere e envie em segundos" />

      <Card x={348} y={136} w={560} h={744}>
        <Abs x={32} y={28} style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Modelos
        </Abs>
        {DOCS.map(({ title, sub, Icon }, i) => {
          const on = selected && i === 0;
          return (
            <Abs
              key={title}
              x={28}
              y={90 + i * 122}
              w={504}
              h={110}
              style={{
                boxSizing: "border-box",
                borderRadius: 22,
                border: `2px solid ${on ? C.red : C.line}`,
                background: on ? "#fff5f6" : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "0 24px",
                transform: i === 0 ? `scale(${1 - press(frame, 28) * 0.03})` : undefined,
              }}
            >
              <IconBadge Icon={Icon} bg={on ? C.red : C.redSoft} color={on ? "#fff" : C.red} size={62} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
                <div style={{ fontSize: 19, color: C.muted, marginTop: 4 }}>{sub}</div>
              </div>
            </Abs>
          );
        })}
      </Card>

      <Card x={932} y={136} w={860} h={744}>
        <Field
          x={60}
          y={80}
          w={500}
          label="Aluno"
          value={name}
          placeholder="Buscar aluno…"
          focused={frame >= 52 && frame < 90}
          frame={frame}
        />
        {selected ? null : (
          <Abs x={60} y={300} w={740} style={{ textAlign: "center", fontSize: 24, color: C.muted }}>
            Escolha um modelo para começar
          </Abs>
        )}
        <Certificate name={name} p={selected ? paperP : 0} />
        <div style={{ position: "absolute", inset: 0, background: `rgba(243,244,246,${dim})`, borderRadius: 28 }} />
        <Button
          x={460}
          y={650}
          w={340}
          h={64}
          label="Enviar por WhatsApp"
          Icon={MessageCircle}
          variant="whatsapp"
          pressed={press(frame, 128)}
          disabled={paperP < 0.9}
        />
      </Card>

      <WhatsApp frame={frame} />
    </>
  );

  return (
    <AppWindow active="documentos">
      {frameOverride === undefined ? (
        <PageFade frame={frame} duration={durationInFrames} fadeOut={false}>
          {page}
        </PageFade>
      ) : (
        page
      )}
    </AppWindow>
  );
}
