import { Easing, interpolate } from "remotion";
import { FADE_IN, FADE_OUT } from "./theme";

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN = Easing.in(Easing.cubic);

const clampOpts = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/** Fade in over `dur` frames starting at `start` (0.6s ease-out default). */
export const fadeIn = (frame: number, dur = 18, start = 0) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing: EASE_OUT,
    ...clampOpts,
  });

/** Fade out over the last `dur` frames before `end` (0.4s ease-in default). */
export const fadeOut = (frame: number, dur = 12, end = 0) =>
  interpolate(frame, [end - dur, end], [1, 0], {
    easing: EASE_IN,
    ...clampOpts,
  });

/**
 * Slide-up entrance: opacity 0→1 + translateY 30px→0 over `dur` frames.
 * Returns a style object. 0.8s ease-out, no overshoot.
 */
export const slideUp = (frame: number, start: number, dur = 24, dist = 30) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    easing: EASE_OUT,
    ...clampOpts,
  });
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * dist}px)`,
  };
};

/** Ease-in fade for exits. */
export const fadeOutStyle = (frame: number, start: number, dur = 12) => ({
  opacity: interpolate(frame, [start, start + dur], [1, 0], {
    easing: EASE_IN,
    ...clampOpts,
  }),
});

/** Count-up: 0 → target over `dur` frames starting at `start`. Round for display. */
export const countUp = (frame: number, start: number, dur: number, target: number) =>
  Math.round(
    interpolate(frame, [start, start + dur], [0, target], {
      easing: EASE_OUT,
      ...clampOpts,
    }),
  );

/** Typing: number of characters visible at `frame`. */
export const typedChars = (frame: number, start: number, speed: number) =>
  Math.max(0, Math.floor((frame - start) / speed));

/** Blinking block cursor: on for `on` frames, off for `off`, starting at `start`. */
export const cursorBlink = (frame: number, start: number, on = 18, off = 12) => {
  if (frame < start) return 0;
  const t = frame - start;
  const cycle = on + off;
  return t % cycle < on ? 1 : 0;
};

/** Scene shell: absolute fill + global fade-in/fade-out for crossfades. */
export const sceneOpacity = (frame: number, duration: number) =>
  fadeIn(frame, FADE_IN) * fadeOut(frame, FADE_OUT, duration);
