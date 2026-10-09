import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";

import { OutroCard, IntroRise, IntroTitle, OutroWindowExit } from "@/components/marketing/promo/scene-bookends";
import { AlunosScene } from "@/components/marketing/promo/scene-alunos";
import { DocumentosScene } from "@/components/marketing/promo/scene-documentos";
import { GraduacaoScene } from "@/components/marketing/promo/scene-graduacao";
import { MensalidadesScene } from "@/components/marketing/promo/scene-mensalidades";
import { PainelScene } from "@/components/marketing/promo/scene-painel";
import { CAMERA_PATH, CLICK_FRAMES, CURSOR_PATH } from "@/components/marketing/promo/scripts";
import { Backdrop, Camera, Cursor, SceneNote } from "@/components/marketing/promo/overlay";
import {
  SCENE_FRAMES,
  cursorAt,
  sceneStart,
} from "@/components/marketing/promo/timeline";

// ---------------------------------------------------------------------------
// Legendas por cena (cursor, cliques e câmera vêm de `scripts.ts`)
// ---------------------------------------------------------------------------

const APP_SCENES = [
  { id: "alunos", title: "Alunos", note: "Cadastro completo, direto da lista." },
  { id: "graduacao", title: "Graduação", note: "Faixa, grau e justificativa no histórico." },
  { id: "mensalidades", title: "Mensalidades", note: "Baixa em lote, com status explícito." },
  { id: "painel", title: "Painel", note: "O que precisa de atenção hoje." },
  { id: "documentos", title: "Documentos", note: "Certificado pronto e enviado por WhatsApp." },
] as const;

const CURSOR_START = sceneStart("alunos");
const CURSOR_END = sceneStart("outro");

/** Quadro representativo para `prefers-reduced-motion` (modal de graduação aberto). */
export const PROMO_POSTER_FRAME = sceneStart("graduacao") + 176;

// ---------------------------------------------------------------------------
// Composição
// ---------------------------------------------------------------------------

export function PromoComposition() {
  const frame = useCurrentFrame();
  const pos = cursorAt(CURSOR_PATH, frame);
  const cursorOpacity = interpolate(
    frame,
    [CURSOR_START, CURSOR_START + 10, CURSOR_END - 14, CURSOR_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#030304" }}>
      <Backdrop frame={frame} />

      <Camera keys={CAMERA_PATH} frame={frame}>
        <Sequence from={0} durationInFrames={SCENE_FRAMES.intro} layout="none">
          <IntroRise>
            <AlunosScene frameOverride={0} />
          </IntroRise>
        </Sequence>

        <Sequence from={sceneStart("alunos")} durationInFrames={SCENE_FRAMES.alunos} layout="none">
          <AlunosScene />
        </Sequence>
        <Sequence from={sceneStart("graduacao")} durationInFrames={SCENE_FRAMES.graduacao} layout="none">
          <GraduacaoScene />
        </Sequence>
        <Sequence from={sceneStart("mensalidades")} durationInFrames={SCENE_FRAMES.mensalidades} layout="none">
          <MensalidadesScene />
        </Sequence>
        <Sequence from={sceneStart("painel")} durationInFrames={SCENE_FRAMES.painel} layout="none">
          <PainelScene />
        </Sequence>
        <Sequence from={sceneStart("documentos")} durationInFrames={SCENE_FRAMES.documentos} layout="none">
          <DocumentosScene />
        </Sequence>

        <Sequence from={sceneStart("outro")} durationInFrames={SCENE_FRAMES.outro} layout="none">
          <OutroWindowExit>
            <DocumentosScene frameOverride={SCENE_FRAMES.documentos - 1} />
          </OutroWindowExit>
        </Sequence>

        <Cursor x={pos.x} y={pos.y} opacity={cursorOpacity} clicks={CLICK_FRAMES} frame={frame} />
      </Camera>

      <Sequence from={0} durationInFrames={SCENE_FRAMES.intro} layout="none">
        <IntroTitle />
      </Sequence>

      {APP_SCENES.map((scene) => (
        <Sequence
          key={scene.id}
          from={sceneStart(scene.id)}
          durationInFrames={SCENE_FRAMES[scene.id]}
          layout="none"
        >
          <SceneNoteLocal title={scene.title} text={scene.note} duration={SCENE_FRAMES[scene.id]} />
        </Sequence>
      ))}

      <Sequence from={sceneStart("outro")} durationInFrames={SCENE_FRAMES.outro} layout="none">
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
}

function SceneNoteLocal({
  title,
  text,
  duration,
}: {
  title: string;
  text: string;
  duration: number;
}) {
  const frame = useCurrentFrame();
  return <SceneNote title={title} text={text} frame={frame} duration={duration} />;
}
