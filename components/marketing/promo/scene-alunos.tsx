import { Cake, ChevronDown, MoreHorizontal, UserCheck, UserPlus, Users } from "lucide-react";
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
  StatCard,
  Toast,
  type BeltName,
} from "@/components/marketing/promo/ui";
import {
  countUp,
  press,
  progress,
  typed,
} from "@/components/marketing/promo/timeline";

// Dados da cena
// ---------------------------------------------------------------------------

const STUDENTS: ReadonlyArray<{ name: string; belt: BeltName; deg: number; plan: string }> = [
  { name: "Rafael Costa", belt: "Branca", deg: 2, plan: "Mensal" },
  { name: "Marina Alves", belt: "Azul", deg: 4, plan: "Trimestral" },
  { name: "Bruno Lima", belt: "Azul", deg: 1, plan: "Mensal" },
  { name: "Camila Rocha", belt: "Roxa", deg: 0, plan: "Anual" },
  { name: "Diego Nunes", belt: "Marrom", deg: 2, plan: "Mensal" },
];
const NEW_STUDENT = { name: "Lucas Ferreira", belt: "Azul" as BeltName, deg: 0, plan: "Mensal" };

// ---------------------------------------------------------------------------
// Tabela
// ---------------------------------------------------------------------------

const TABLE = { x: 348, y: 318, w: 1444, h: 562, head: 60, row: 80 } as const;
const COL = { name: 40, belt: 480, plan: 860, status: 1110, actions: 1340 } as const;

function StudentRow({
  index,
  s,
  flash = 0,
  slide = 1,
}: {
  index: number;
  s: { name: string; belt: BeltName; deg: number; plan: string };
  flash?: number;
  slide?: number;
}) {
  const top = TABLE.head + index * TABLE.row;
  return (
    <Abs
      x={0}
      y={top}
      w={TABLE.w}
      h={TABLE.row}
      style={{
        borderTop: `1px solid ${C.line}`,
        background: `rgba(253,232,234,${flash * 0.85})`,
        opacity: slide,
        transform: `translateX(${(1 - slide) * -60}px)`,
        boxSizing: "border-box",
      }}
    >
      <Abs x={COL.name} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 25, fontWeight: 700 }}>
        {s.name}
      </Abs>
      <Abs x={COL.belt} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BeltBar belt={s.belt} degrees={s.deg} w={170} />
        <span style={{ fontSize: 22, color: C.muted }}>{s.belt}</span>
      </Abs>
      <Abs x={COL.plan} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", fontSize: 23, color: "#3b4048" }}>
        {s.plan}
      </Abs>
      <Abs x={COL.status} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center" }}>
        <Pill bg={C.greenSoft} color="#15803d">
          Ativo
        </Pill>
      </Abs>
      <Abs x={COL.actions} y={0} h={TABLE.row} style={{ display: "flex", alignItems: "center", color: C.muted }}>
        <MoreHorizontal size={30} />
      </Abs>
    </Abs>
  );
}

function StudentsTable({ frame }: { frame: number }) {
  const rowP = progress(frame, 206, 16);
  const flash = frame < 206 ? 0 : Math.max(0, 1 - (frame - 206 - 20) / 50);
  return (
    <Card x={TABLE.x} y={TABLE.y} w={TABLE.w} h={TABLE.h} style={{ overflow: "hidden" }}>
      <Abs x={0} y={0} w={TABLE.w} h={TABLE.head} style={{ background: "#faf9f7" }}>
        {(
          [
            ["Nome", COL.name],
            ["Faixa / grau", COL.belt],
            ["Plano", COL.plan],
            ["Situação", COL.status],
            ["Ações", COL.actions],
          ] as const
        ).map(([label, x]) => (
          <Abs
            key={label}
            x={x}
            y={0}
            h={TABLE.head}
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
      {STUDENTS.map((s, i) => (
        <StudentRow key={s.name} index={i} s={s} />
      ))}
      {rowP > 0 ? <StudentRow index={STUDENTS.length} s={NEW_STUDENT} flash={flash} slide={rowP} /> : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Modal "Novo aluno" (coordenadas locais ao modal)
// ---------------------------------------------------------------------------

const MODAL = { x: 540, y: 130, w: 760, h: 640 } as const;

function NewStudentModal({ frame }: { frame: number }) {
  const p = progress(frame, 40, 14) * (1 - progress(frame, 200, 10));
  const name = typed("Lucas Ferreira", frame, 72, 2.2);
  const nameFocused = frame >= 66 && frame < 126;
  const selectOpen = frame >= 126 && frame < 152;
  const beltChosen = frame >= 152;
  const planChosen = frame >= 170;

  return (
    <ModalShell p={p} {...MODAL} title="Novo aluno">
      <Field
        x={40}
        y={140}
        w={680}
        label="Nome completo"
        value={name}
        placeholder="Digite o nome"
        focused={nameFocused}
        frame={frame}
      />
      <Field
        x={40}
        y={254}
        w={680}
        label="Faixa"
        value={beltChosen ? "Azul" : ""}
        placeholder="Selecione a faixa"
        focused={selectOpen}
        showCaret={false}
        frame={frame}
        trailing={<ChevronDown size={28} color={C.muted} />}
      />
      <Abs x={40} y={334} style={{ fontSize: 20, fontWeight: 700, color: "#3b4048" }}>
        Plano
      </Abs>
      {(["Mensal", "Trimestral", "Anual"] as const).map((plan, i) => {
        const on = planChosen && plan === "Mensal";
        const pr = plan === "Mensal" ? press(frame, 170) : 0;
        return (
          <Abs
            key={plan}
            x={40 + i * 220}
            y={368}
            w={200}
            h={56}
            style={{
              boxSizing: "border-box",
              borderRadius: 16,
              border: `2px solid ${on ? C.red : C.line}`,
              background: on ? C.redSoft : "#fff",
              color: on ? C.red : "#3b4048",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              fontWeight: 700,
              transform: `scale(${1 - pr * 0.05})`,
            }}
          >
            {plan}
          </Abs>
        );
      })}

      <Button x={260} y={540} w={180} label="Cancelar" variant="soft" />
      <Button x={460} y={540} w={260} label="Salvar aluno" Icon={UserPlus} pressed={press(frame, 196)} />

      {selectOpen ? (
        <Abs
          x={40}
          y={330}
          w={680}
          h={184}
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 24px 50px -16px rgba(16,24,40,0.35)",
            border: `1px solid ${C.line}`,
            padding: 8,
            boxSizing: "border-box",
          }}
        >
          {(["Branca", "Azul", "Roxa"] as const).map((belt) => (
            <div
              key={belt}
              style={{
                height: 56,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 18px",
                fontSize: 23,
                fontWeight: 600,
                background: belt === "Azul" && frame >= 140 ? C.redSoft : "transparent",
              }}
            >
              <BeltBar belt={belt} w={74} />
              {belt}
            </div>
          ))}
        </Abs>
      ) : null}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Cena
// ---------------------------------------------------------------------------

/** `frameOverride` congela a página (usado na abertura do vídeo). */
export function AlunosScene({ frameOverride }: { frameOverride?: number }) {
  const local = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const frame = frameOverride ?? local;
  const total = Math.round(countUp(5, 6, frame, 206, 14));
  const toastIn = progress(frame, 210, 12) * (1 - progress(frame, 268, 10));

  const page = (
    <>
      <PageHeader
        title="Alunos"
        right={
          <Button x={1552} y={20} w={240} label="Novo aluno" Icon={UserPlus} pressed={press(frame, 38)} />
        }
      />
      <StatCard
        x={348}
        y={136}
        w={466}
        Icon={Users}
        iconBg={C.redSoft}
        iconColor={C.red}
        label="Total na conta"
        value={total}
        bar="#fb3b5a"
      />
      <StatCard
        x={837}
        y={136}
        w={466}
        Icon={UserCheck}
        iconBg={C.greenSoft}
        iconColor={C.green}
        label="Ativos"
        value={total}
        bar={C.green}
      />
      <StatCard
        x={1326}
        y={136}
        w={466}
        Icon={Cake}
        iconBg={C.blueSoft}
        iconColor={C.blue}
        label="Aniversariantes do mês"
        value={2}
        bar={C.blue}
      />
      <StudentsTable frame={frame} />
      <NewStudentModal frame={frame} />
      <Toast x={720} y={18} text="Aluno cadastrado: Lucas Ferreira" progress={toastIn} />
    </>
  );

  return (
    <AppWindow active="alunos">
      {frameOverride === undefined ? (
        <PageFade frame={frame} duration={durationInFrames} fadeIn={false}>
          {page}
        </PageFade>
      ) : (
        page
      )}
    </AppWindow>
  );
}
