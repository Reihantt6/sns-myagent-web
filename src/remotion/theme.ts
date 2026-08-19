/**
 * SNS-MyAgent demo video design system.
 * Palette is STRICT: near-black zinc + orange only.
 */
export const C = {
  bg: "#09090b", // zinc-950
  panel: "#0f0f13",
  panel2: "#131316",
  line: "#27272a", // zinc-800
  lineAccent: "rgba(234, 88, 12, 0.28)",
  accent: "#ea580c", // orange-600
  accentSoft: "#fb923c", // orange-400 (gradients/glows)
  accentDeep: "#c2410c", // orange-700
  accentGlow: "rgba(234, 88, 12, 0.14)",
  fg: "#fafafa", // zinc-100
  fg2: "#a1a1aa", // zinc-400
  fg3: "#52525b", // zinc-500
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/**
 * Scene durations (in frames at 30fps). Sum = 1485. TransitionSeries
 * overlaps each cut by TRANSITION frames (5 transitions × 15), so the
 * rendered timeline is 1485 − 75 = 1410 frames = 47s.
 */
export const SCENE = {
  hook: { dur: 125 },
  install: { dur: 190 },
  setup: { dur: 190 },
  docs: { dur: 250 },
  subagents: { dur: 285 },
  capabilities: { dur: 285 },
  cta: { dur: 160 },
} as const;

export const TOTAL_FRAMES = 1410; // 47s @ 30fps

/** TransitionSeries cut duration: 0.5s @ 30fps. */
export const TRANSITION = 15;

/** Fade timings per the transition grammar. */
export const FADE_IN = 18; // 0.6s ease-out
export const FADE_OUT = 12; // 0.4s ease-in
export const SLIDE = 24; // 0.8s ease-out, 30px
export const STAGGER = 3; // 0.1s between items
