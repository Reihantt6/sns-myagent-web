import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import cyberBed from "./audio/cyber-bed.wav";
import { EASE_IN, EASE_OUT, sceneOpacity } from "./helpers";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Install } from "./scenes/Scene2Install";
import { Scene3Setup } from "./scenes/Scene3Setup";
import { Scene4Capabilities } from "./scenes/Scene4Capabilities";
import { Scene4Docs } from "./scenes/Scene4Docs";
import { Scene5Subagents } from "./scenes/Scene5Subagents";
import { Scene7Cta } from "./scenes/Scene7Cta";
import { C, FADE_IN, OVERLAP, SCENE, TOTAL_FRAMES } from "./theme";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * Music bed volume: the wav is pre-mixed at ~-15dB RMS / -1.9dB peak.
 * Fade in 1.0s, fade out 1.5s, and pump the bed down during SFX-heavy
 * windows so effects cut through: -3dB during typing/swish scenes,
 * -2dB during the capability count-up, -1.5dB under the CTA chord.
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
  const dips =
    dip(120, 300, 0.708) * // install typing ticks (-3dB)
    dip(300, 480, 0.708) * // setup blips (-3dB)
    dip(480, 720, 0.708) * // docs swishes/clicks (-3dB)
    dip(720, 990, 0.708) * // subagent sparkles + writes (-3dB)
    dip(990, 1260, 0.794) * // capability count-up (-2dB)
    dip(1260, 1410, 0.841); // CTA chord + sub swell (-1.5dB)
  return fadeIn * fadeOut * dips;
}

/**
 * 47s brand demo. Every scene fades in (0.6s ease-out) and out (0.4s
 * ease-in) and overlaps its neighbours by 0.4s for a soft crossfade —
 * no hard cuts anywhere.
 */
export function DemoVideo() {
  const frame = useCurrentFrame();

  const scenes: { from: number; durationInFrames: number; el: (f: number) => React.ReactNode }[] = [
    { from: SCENE.hook.start, durationInFrames: SCENE.hook.dur + OVERLAP, el: (f) => <Scene1Hook frame={f} /> },
    { from: SCENE.install.start, durationInFrames: SCENE.install.dur + OVERLAP, el: (f) => <Scene2Install frame={f} /> },
    { from: SCENE.setup.start, durationInFrames: SCENE.setup.dur + OVERLAP, el: (f) => <Scene3Setup frame={f} /> },
    { from: SCENE.docs.start, durationInFrames: SCENE.docs.dur + OVERLAP, el: (f) => <Scene4Docs frame={f} /> },
    { from: SCENE.subagents.start, durationInFrames: SCENE.subagents.dur + OVERLAP, el: (f) => <Scene5Subagents frame={f} /> },
    { from: SCENE.capabilities.start, durationInFrames: SCENE.capabilities.dur + OVERLAP, el: (f) => <Scene4Capabilities frame={f} /> },
    { from: SCENE.cta.start, durationInFrames: SCENE.cta.dur, el: (f) => <Scene7Cta frame={f} /> },
  ];

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
      {scenes.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.durationInFrames}>
          <SceneShell duration={s.durationInFrames} render={s.el} />
        </Sequence>
      ))}
      <Audio src={cyberBed} volume={musicVolume} />
    </AbsoluteFill>
  );
}

function SceneShell({ duration, render }: { duration: number; render: (f: number) => React.ReactNode }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOpacity(frame, duration) }}>
      {render(frame)}
    </div>
  );
}
