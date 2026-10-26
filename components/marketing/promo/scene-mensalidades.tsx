import { Check, CircleDollarSign, Clock, HeartHandshake } from "lucide-react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import {
  Abs,
  AppWindow,
  Button,
  C,
  Card,
  PageFade,
  PageHeader,
  Pill,
  StatCard,
  Toast,
} from "@/components/marketing/promo/ui";
import { brl, press, progress } from "@/components/marketing/promo/timeline";

// Dados da cena
// ---------------------------------------------------------------------------

const ROWS = [
  { name: "Rafael Costa", plan: "Mensal", amount: 150, paidAt: 92 },
  { name: "Marina Alves", plan: "Trimestral", amount: 180, paidAt: 100 },
  { name: "Bruno Lima", plan: "Mensal", amount: 150, paidAt: 108 },
  { name: "Camila Rocha", plan: "Anual", amount: 120, paidAt: 140 },
  { name: "Lucas Ferreira", plan: "Mensal", amount: 150, paidAt: Infinity },
] as const;

const SELECT_AT = [32, 48, 64] as const;
const CLEAR_SELECTION_AT = 92;

const TABLE = { x: 348, y: 318, w: 1444, h: 562, head: 80, th: 50, row: 80 } as const;
const COL = { check: 40, name: 110, plan: 560, amount: 790, due: 960, status: 1100, action: 1290 } as const;

function Checkbox({ on, pr }: { on: boolean; pr: number }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        boxSizing: "border-box",
        border: `2.5px solid ${C.red}`,
        background: on ? C.red : "#fff",
        display: "grid",
        placeItems: "center",
        transform: `scale(${1 - pr * 0.15})`,
      }}
    >
      {on ? <Check size={24} color="#fff" strokeWidth={3.4} /> : null}
    </div>
  );
}

export function MensalidadesScene() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const paidP = ROWS.map((r) => (Number.isFinite(r.paidAt) ? progress(frame, r.paidAt, 12) : 0));
  const received = ROWS.reduce((sum, r, i) => sum + r.amount * paidP[i], 0);
  const pending = ROWS.filter((_, i) => paidP[i] < 0.5).length;
  const selected = SELECT_AT.map((at) => frame >= at && frame < CLEAR_SELECTION_AT);
  const selCount = selected.filter(Boolean).length;
  const toastIn = progress(frame, 96, 12) * (1 - progress(frame, 132, 8));
  const toast2 = progress(frame, 142, 12) * (1 - progress(frame, 200, 10));

  return (
    <AppWindow active="mensalidades">
      <PageFade frame={frame} duration={durationInFrames}>
        <PageHeader title="Mensalidades" subtitle="Outubro de 2026" />

        <StatCard
          x={348}
          y={136}
          w={466}
          Icon={CircleDollarSign}
          iconBg={C.greenSoft}
          iconColor={C.green}
          label="Recebido"
          value={brl(received)}
          bar="#10b981"
        />
        <StatCard
          x={837}
          y={136}
          w={466}
          Icon={Clock}
          iconBg={C.amberSoft}
          iconColor="#d97706"
          label="Pendentes"
          value={pending}
          bar={C.amber}
        />
        <StatCard
          x={1326}
          y={136}
          w={466}
          Icon={HeartHandshake}
          iconBg={C.blueSoft}
          iconColor={C.blue}
          label="Bolsistas"
          value={1}
          bar={C.blue}
        />

        <Card x={TABLE.x} y={TABLE.y} w={TABLE.w} h={TABLE.h} style={{ overflow: "hidden" }}>
          <Abs x={40} y={0} h={TABLE.head} style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Lista do mês
            <span style={{ marginLeft: 20, fontSize: 21, fontWeight: 600, color: C.muted }}>
              {selCount > 0 ? `${selCount} selecionados` : "0 selecionados"}
            </span>
          </Abs>
          <Button
            x={1104}
            y={12}
            w={300}
            h={56}
            label="Marcar como pagos"
            disabled={selCount === 0}
            pressed={press(frame, 90)}
          />

          <Abs x={0} y={TABLE.head} w={TABLE.w} h={TABLE.th} style={{ background: "#faf9f7" }}>
            {(
              [
                ["Aluno", COL.name],
                ["Plano", COL.plan],
                ["Valor", COL.amount],
                ["Venc.", COL.due],
                ["Estado", COL.status],
                ["Ação", COL.action],
              ] as const
            ).map(([label, x]) => (
              <Abs
                key={label}
                x={x}
                y={0}
                h={TABLE.th}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8a8f98",
                }}
              >
                {label}
              </Abs>
            ))}
          </Abs>

          {ROWS.map((r, i) => {
            const top = TABLE.head + TABLE.th + i * TABLE.row;
            const p = paidP[i];
            const flash = p > 0 && p < 1 ? 1 - p : 0;
            const actionPress = i === 3 ? press(frame, 138) : 0;
            return (
              <Abs
                key={r.name}
                x={0}
                y={top}
                w={TABLE.w}
                h={TABLE.row}
                style={{
                  borderTop: `1px solid ${C.line}`,
                  boxSizing: "border-box",
                  background:
                    p > 0.01 && p < 1
                      ? `rgba(227,246,234,${flash})`
                      : selected[i]
                        ? "rgba(253,232,234,0.55)"
                        : "transparent",
                }}
              >
                <Abs x={COL.check} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    on={selected[i]}
                    pr={i < 3 ? press(frame, SELECT_AT[i]) : 0}
                  />
                </Abs>
                <Abs x={COL.name} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 25, fontWeight: 700 }}>
                  {r.name}
                </Abs>
                <Abs x={COL.plan} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 23, color: "#3b4048" }}>
                  {r.plan}
                </Abs>
                <Abs x={COL.amount} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {brl(r.amount)}
                </Abs>
                <Abs x={COL.due} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 23, color: "#3b4048" }}>
                  10/10
                </Abs>
                <Abs x={COL.status} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ opacity: 1 - p }}>
                      <Pill bg={C.amberSoft} color="#b45309">
                        Pendente
                      </Pill>
                    </div>
                    <div style={{ position: "absolute", inset: 0, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
                      <Pill bg={C.greenSoft} color="#15803d">
                        Pago ✓
                      </Pill>
                    </div>
                  </div>
                </Abs>
                <Abs x={COL.action} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 110,
                      height: 48,
                      borderRadius: 14,
                      background: "#6b6f76",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 21,
                      fontWeight: 700,
                      opacity: 1 - p * 0.75,
                      transform: `scale(${1 - actionPress * 0.1})`,
                    }}
                  >
                    Pagar
                  </div>
                </Abs>
              </Abs>
            );
          })}
        </Card>

        <Toast x={720} y={18} text="3 mensalidades confirmadas" progress={toastIn} />
        <Toast x={720} y={18} text="Pagamento de Camila registrado" progress={toast2} />
      </PageFade>
    </AppWindow>
  );
}
