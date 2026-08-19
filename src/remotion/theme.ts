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

/** Scene windows (nominal, in frames at 30fps) — 47s total. */
export const SCENE = {
  hook: { start: 0, dur: 120 },
  install: { start: 120, dur: 180 },
  setup: { start: 300, dur: 180 },
  docs: { start: 480, dur: 240 },
  subagents: { start: 720, dur: 270 },
  capabilities: { start: 990, dur: 270 },
  cta: { start: 1260, dur: 150 },
} as const;

export const TOTAL_FRAMES = 1410; // 47s @ 30fps

/** Crossfade overlap between scenes: 0.4s (12 frames). */
export const OVERLAP = 12;

/** Fade timings per the transition grammar. */
export const FADE_IN = 18; // 0.6s ease-out
export const FADE_OUT = 12; // 0.4s ease-in
export const SLIDE = 24; // 0.8s ease-out, 30px
export const STAGGER = 3; // 0.1s between items
