/**
 * Ponto de entrada do vídeo-promo do sistema na landing.
 * A composição Remotion (UI recriada com cursor, cliques e preenchimentos) vive em `./promo/`.
 */
export {
  PROMO_DURATION as LP_SYSTEM_VIDEO_DURATION,
  PROMO_FPS as LP_SYSTEM_VIDEO_FPS,
  PROMO_HEIGHT as LP_SYSTEM_VIDEO_HEIGHT,
  PROMO_WIDTH as LP_SYSTEM_VIDEO_WIDTH,
  SCENE_ORDER as LP_SYSTEM_SCENE_ORDER,
  sceneAt as lpSystemSceneAt,
  sceneStart as lpSystemSceneStart,
  SCENE_FRAMES as LP_SYSTEM_SCENE_FRAMES,
  type SceneId as LpSystemSceneId,
} from "@/components/marketing/promo/timeline";
export {
  PROMO_POSTER_FRAME as LP_SYSTEM_VIDEO_POSTER_FRAME,
  PromoComposition as SystemScreensComposition,
} from "@/components/marketing/promo/promo-composition";
