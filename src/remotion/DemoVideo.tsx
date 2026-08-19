import { Audio } from "@remotion/media";
import { lightLeak } from "@remotion/effects/light-leak";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";
import cyberBed from "./audio/cyber-bed.wav";
import { EASE_IN, EASE_OUT, sceneOpacity } from "./helpers";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Install } from "./scenes/Scene2Install";
import { Scene3Setup } from "./scenes/Scene3Setup";
import { Scene4Capabilities } from "./scenes/Scene4Capabilities";
import { Scene4Docs } from "./scenes/Scene4Docs";
import { Scene5Subagents } from "./scenes/Scene5Subagents";
import { Scene7Cta } from "./scenes/Scene7Cta";
import { C, FADE_IN, SCENE, TOTAL_FRAMES, TRANSITION } from "./theme";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 0.5s elegant cut between scenes (linear, not slow). */
const TIMING = linearTiming({ durationInFrames: TRANSITION });

/**
 * Music bed volume: the wav is re-baked loud (mean ~-10.7dB RMS / -1.5dB peak)
 * so the base volume stays 1.0. Fade in 1.0s, fade out 1.5s, and pump the bed
 * down a gentle -2dB during SFX-heavy windows so effects sit on top without
 * the music ever disappearing — "lumayan keras, medium".
 */
function musicVolume(frame: number) {
  const fadeIn = interpolate(frame, [0, 30], [0, 1], { easing: EASE_OUT, ...clamp });
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], {
    easing: EASE_IN,
    ...clamp,
  });
  const dip = (start: number, end: number, level: number) => {
    const a = interpolate(frame, [start - 12, start], [1, level], { ...clamp });
    const b = interpolate(frame, [end, end + 12], [level, 1], { ...clamp });
    return Math.max(a, b);
  };
  // Scene windows on the TransitionSeries timeline (with 15-frame overlaps):
  //   hook 0-125 · install 110-300 · setup 285-475 · docs 460-710 ·
  //   subagents 710-995 · capabilities 980-1265 · cta 1250-1410
  const dips =
    dip(120, 290, 0.794) * // install typing (-2dB)
    dip(295, 465, 0.794) * // setup blips (-2dB)
    dip(470, 700, 0.794) * // docs swish/scroll (-2dB)
    dip(720, 985, 0.794) * // subagent sparkles + writes (-2dB)
    dip(990, 1255, 0.794) * // capability count-up (-2dB)
    dip(1260, 1398, 0.841); // CTA chord + swell (-1.5dB)
  return fadeIn * fadeOut * dips;
}

/** Scene wrapper: consumes scene-local frames and applies the shared fade grammar. */
function SceneShell({ duration, render }: { duration: number; render: (f: number) => React.ReactNode }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOpacity(frame, duration) }}>
      {render(frame)}
    </div>
  );
}

/** Warm light-leak overlay at the docs → subagents cut (1.0s), kept subtle. */
function LightLeakOverlay() {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.32 }}>
      <Solid
        width={width}
        height={height}
        effects={[
          lightLeak({
            // Evolve the leak in over the overlay window; hueShift 0 keeps it
            // in the warm yellow/orange family (palette-safe, no green).
            progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            hueShift: 0,
          }),
        ]}
      />
    </div>
  );
}

/**
 * 47s brand demo, cut with @remotion/transitions: each scene slides/fades/wipes
 * into the next over a 0.5s linear cut, with a warm light-leak at the docs
 * moment. Scenes keep their shared fade-in/out grammar for soft edges.
 */
export function DemoVideo() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: "var(--font-sans)" }}>
      {/* Static, very subtle orange aura in the upper third */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(234, 88, 12, 0.065), transparent 58%)",
          opacity: interpolate(frame, [0, FADE_IN * 2], [0, 1], { ...clamp }),
        }}
      />
      <TransitionSeries>
        {/* Scene 1 · HOOK → slides in from the left */}
        <TransitionSeries.Sequence durationInFrames={SCENE.hook.dur} name="hook">
          <SceneShell duration={SCENE.hook.dur} render={(f) => <Scene1Hook frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={TIMING} />

        {/* Scene 2 · INSTALL → fade */}
        <TransitionSeries.Sequence durationInFrames={SCENE.install.dur} name="install">
          <SceneShell duration={SCENE.install.dur} render={(f) => <Scene2Install frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={TIMING} />

        {/* Scene 3 · SETUP → slide up */}
        <TransitionSeries.Sequence durationInFrames={SCENE.setup.dur} name="setup">
          <SceneShell duration={SCENE.setup.dur} render={(f) => <Scene3Setup frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TIMING} />

        {/* Scene 4 · DOCS → warm light-leak overlay on the cut */}
        <TransitionSeries.Sequence durationInFrames={SCENE.docs.dur} name="docs">
          <SceneShell duration={SCENE.docs.dur} render={(f) => <Scene4Docs frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30}>
          <LightLeakOverlay />
        </TransitionSeries.Overlay>

        {/* Scene 5 · SUBAGENTS → wipe from the right */}
        <TransitionSeries.Sequence durationInFrames={SCENE.subagents.dur} name="subagents">
          <SceneShell duration={SCENE.subagents.dur} render={(f) => <Scene5Subagents frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={TIMING} />

        {/* Scene 6 · CAPABILITIES → fade */}
        <TransitionSeries.Sequence durationInFrames={SCENE.capabilities.dur} name="capabilities">
          <SceneShell duration={SCENE.capabilities.dur} render={(f) => <Scene4Capabilities frame={f} />} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={TIMING} />

        {/* Scene 7 · CTA — final, fades to black via the scene shell */}
        <TransitionSeries.Sequence durationInFrames={SCENE.cta.dur} name="cta">
          <SceneShell duration={SCENE.cta.dur} render={(f) => <Scene7Cta frame={f} />} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={cyberBed} volume={musicVolume} />
    </AbsoluteFill>
  );
}
