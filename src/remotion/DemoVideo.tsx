import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame } from "remotion";
import ambient from "./audio/ambient.wav";
import { sceneOpacity } from "./helpers";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Install } from "./scenes/Scene2Install";
import { Scene3Setup } from "./scenes/Scene3Setup";
import { Scene4Capabilities } from "./scenes/Scene4Capabilities";
import { Scene5Workflow } from "./scenes/Scene5Workflow";
import { Scene6Cta } from "./scenes/Scene6Cta";
import { C, FADE_IN, OVERLAP, SCENE, TOTAL_FRAMES } from "./theme";

/**
 * 45s brand demo. Every scene fades in (0.6s ease-out) and out (0.4s
 * ease-in) and overlaps its neighbours by 0.4s for a soft crossfade —
 * no hard cuts anywhere.
 */
export function DemoVideo() {
  const frame = useCurrentFrame();

  const scenes: { from: number; durationInFrames: number; el: (f: number) => React.ReactNode }[] = [
    { from: SCENE.hook.start, durationInFrames: SCENE.hook.dur + OVERLAP, el: (f) => <Scene1Hook frame={f} /> },
    { from: SCENE.install.start, durationInFrames: SCENE.install.dur + OVERLAP, el: (f) => <Scene2Install frame={f} /> },
    { from: SCENE.setup.start, durationInFrames: SCENE.setup.dur + OVERLAP, el: (f) => <Scene3Setup frame={f} /> },
    { from: SCENE.capabilities.start, durationInFrames: SCENE.capabilities.dur + OVERLAP, el: (f) => <Scene4Capabilities frame={f} /> },
    { from: SCENE.workflow.start, durationInFrames: SCENE.workflow.dur + OVERLAP, el: (f) => <Scene5Workflow frame={f} /> },
    { from: SCENE.cta.start, durationInFrames: SCENE.cta.dur, el: (f) => <Scene6Cta frame={f} /> },
  ];

  // Quiet ambient bed: already mixed at ~-18dB in the wav; fade in/out at edges.
  const volume = interpolate(frame, [0, 60, TOTAL_FRAMES - 90, TOTAL_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: "var(--font-sans)" }}>
      {/* Static, very subtle orange aura in the upper third */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(234, 88, 12, 0.065), transparent 58%)",
          opacity: interpolate(frame, [0, FADE_IN * 2], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      {scenes.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.durationInFrames}>
          <SceneShell duration={s.durationInFrames} render={s.el} />
        </Sequence>
      ))}
      <Audio src={ambient} volume={volume} />
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
