import { AlertTriangle, Award, CircleDollarSign, UserPlus, Users, Wallet } from "lucide-react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import {
  Abs,
  AppWindow,
  BELTS,
  Button,
  C,
  Card,
  IconBadge,
  PageFade,
  PageHeader,
  Pill,
  StatCard,
  type BeltName,
} from "@/components/marketing/promo/ui";
import {
  brl,
  countUp,
  press,
  progress,
} from "@/components/marketing/promo/timeline";

// Dados da cena
// ---------------------------------------------------------------------------

const FAIXAS: ReadonlyArray<{ belt: BeltName; count: number }> = [
  { belt: "Branca", count: 1 },
  { belt: "Azul", count: 2 },
  { belt: "Roxa", count: 2 },
  { belt: "Marrom", count: 1 },
];

function Chip({
  x,
  w,
  label,
  count,
  active,
  pr,
}: {
  x: number;
  w: number;
  label: string;
  count: number;
  active: boolean;
  pr: number;
}) {
  return (
    <Abs
      x={x}
      y={88}
      w={w}
      h={52}
      style={{
        boxSizing: "border-box",
        borderRadius: 26,
        background: active ? "#0b0b0d" : "#f1f2f4",
        color: active ? "#fff" : "#3b4048",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 20,
        fontWeight: 700,
        transform: `scale(${1 - pr * 0.06})`,
      }}
    >
      {label}
      <span
        style={{
          minWidth: 30,
          height: 30,
          borderRadius: 15,
          background: active ? "#fff" : "#fff",
          color: "#0b0b0d",
          display: "grid",
          placeItems: "center",
          fontSize: 17,
        }}
      >
        {count}
      </span>
    </Abs>
  );
}

export function PainelScene() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const received = countUp(0, 600, frame, 8, 34);
  const active = Math.round(countUp(0, 6, frame, 8, 22));
  const alerts = Math.round(countUp(0, 2, frame, 14, 14));
  const barP = progress(frame, 20, 44);
  const faixaP = progress(frame, 92, 30);
  const listP = progress(frame, 88, 14);
  const faixaChipActive = frame >= 86;

  return (
    <AppWindow active="painel">
      <PageFade frame={frame} duration={durationInFrames}>
        <PageHeader
          title="Painel"
          subtitle="Gracie Norte · quinta-feira, 8 de outubro"
          right={
            <>
              <Button x={1158} y={20} w={290} label="Cadastrar aluno" Icon={UserPlus} variant="outline" />
              <Button x={1472} y={20} w={320} label="Registrar pagamento" Icon={Wallet} />
            </>
          }
        />

        <StatCard
          x={348}
          y={136}
          w={343}
          Icon={AlertTriangle}
          iconBg={C.redSoft}
          iconColor={C.red}
          label="Atrasados"
          value={frame > 40 ? 1 : 0}
          bar="#fb3b5a"
        />
        <StatCard
          x={715}
          y={136}
          w={343}
          Icon={Users}
          iconBg={C.blueSoft}
          iconColor={C.blue}
          label="Alunos ativos"
          value={active}
          bar={C.blue}
        />
        <StatCard
          x={1082}
          y={136}
          w={343}
          Icon={CircleDollarSign}
          iconBg={C.greenSoft}
          iconColor={C.green}
          label="Recebido"
          value={<span style={{ fontSize: 40 }}>{brl(received)}</span>}
          bar="#10b981"
        />
        <StatCard
          x={1449}
          y={136}
          w={343}
          Icon={Award}
          iconBg={C.amberSoft}
          iconColor="#d97706"
          label="Alertas de graduação"
          labelSize={19}
          value={alerts}
          bar="#2563eb"
        />

        {/* Mensalidades do mês */}
        <Card x={348} y={310} w={860} h={270} style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <IconBadge Icon={Wallet} bg={C.redSoft} color={C.red} size={54} />
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Mensalidades do mês</div>
            </div>
            <Pill bg="#f1f2f4" color="#3b4048">
              Outubro de 2026
            </Pill>
          </div>
          <Abs x={32} y={104} w={796} h={26} style={{ borderRadius: 13, background: "#fde2e4", overflow: "hidden" }}>
            <div style={{ width: `${80 * barP}%`, height: "100%", background: "linear-gradient(90deg,#16a34a,#34d399)", borderRadius: 13 }} />
          </Abs>
          <Abs x={32} y={140} style={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>
            {Math.round(80 * barP)}% recebido
          </Abs>
          <Abs x={32} y={176} w={386} h={68} style={{ borderRadius: 18, background: C.greenSoft, padding: "10px 20px", boxSizing: "border-box" }}>
            <div style={{ fontSize: 17, color: "#15803d", fontWeight: 600 }}>Recebido</div>
            <div style={{ fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{brl(received)}</div>
          </Abs>
          <Abs x={442} y={176} w={386} h={68} style={{ borderRadius: 18, background: "#fee9ea", padding: "10px 20px", boxSizing: "border-box" }}>
            <div style={{ fontSize: 17, color: "#9d171f", fontWeight: 600 }}>A receber</div>
            <div style={{ fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{brl(750 - received)}</div>
          </Abs>
        </Card>

        {/* Atrasados */}
        <Card x={1232} y={310} w={560} h={270} style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Atrasados</div>
            <Pill bg={C.redSoft} color={C.red}>
              1
            </Pill>
          </div>
          <Abs x={32} y={104} w={496} h={92} style={{ borderRadius: 18, background: "#faf9f7", padding: "16px 22px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700 }}>
              Lucas Ferreira
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{brl(150)}</span>
            </div>
            <div style={{ fontSize: 19, color: C.muted, marginTop: 4 }}>Mensal · vence hoje</div>
          </Abs>
          <Abs x={32} y={212} style={{ fontSize: 19, color: C.muted }}>
            Lembrete por WhatsApp em 1 clique
          </Abs>
        </Card>

        {/* Atenção */}
        <Card x={348} y={604} w={860} h={276}>
          <Abs x={32} y={28} style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Atenção
          </Abs>
          <Chip x={32} w={170} label="Vence hoje" count={1} active={false} pr={0} />
          <Chip x={218} w={190} label="Atraso longo" count={0} active={false} pr={0} />
          <Chip x={424} w={180} label="Aniversário" count={2} active={false} pr={0} />
          <Chip x={620} w={200} label="Faixa ou grau" count={2} active={faixaChipActive} pr={press(frame, 86)} />
          <Abs x={32} y={166} w={796} style={{ opacity: listP, transform: `translateY(${(1 - listP) * 14}px)` }}>
            {[
              ["Bruno Lima", "apto ao 2º grau da faixa azul"],
              ["Rafael Costa", "apto ao 3º grau da faixa branca"],
            ].map(([name, note]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, height: 44, fontSize: 22 }}>
                <span style={{ width: 10, height: 10, borderRadius: 10, background: C.red }} />
                <b>{name}</b>
                <span style={{ color: C.muted }}>{note}</span>
              </div>
            ))}
          </Abs>
          {listP < 0.02 ? (
            <Abs x={32} y={176} style={{ fontSize: 20, color: C.muted }}>
              Alunos que atingiram o critério de prontidão da academia.
            </Abs>
          ) : null}
        </Card>

        {/* Faixas */}
        <Card x={1232} y={604} w={560} h={276} style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Faixas</div>
            <div style={{ display: "flex", background: "#f1f2f4", borderRadius: 20, padding: 4, fontSize: 17, fontWeight: 700 }}>
              <span style={{ background: "#0b0b0d", color: "#fff", borderRadius: 16, padding: "6px 16px" }}>Adulto</span>
              <span style={{ padding: "6px 16px", color: C.muted }}>Kids</span>
            </div>
          </div>
          <Abs x={32} y={90} w={496}>
            {FAIXAS.map((f, i) => (
              <div key={f.belt} style={{ display: "flex", alignItems: "center", gap: 18, height: 40 }}>
                <span style={{ width: 90, fontSize: 20, fontWeight: 600 }}>{f.belt}</span>
                <div style={{ flex: 1, height: 16, borderRadius: 8, background: "#eceef1", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(f.count / 2) * 100 * Math.min(1, Math.max(0, faixaP * 1.4 - i * 0.12))}%`,
                      height: "100%",
                      borderRadius: 8,
                      background: f.belt === "Branca" ? "#cfd2d8" : BELTS[f.belt],
                    }}
                  />
                </div>
                <span style={{ width: 24, fontSize: 20, fontWeight: 700, textAlign: "right" }}>{f.count}</span>
              </div>
            ))}
          </Abs>
        </Card>
      </PageFade>
    </AppWindow>
  );
}
