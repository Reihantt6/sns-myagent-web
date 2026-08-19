import { Audio } from "@remotion/media";
import { Sequence } from "remotion";

interface SfxProps {
  src: string;
  /** Local frame (within the scene's own timeline) at which the SFX starts. */
  at: number;
  volume?: number;
  playbackRate?: number;
}

/**
 * Plays a sound effect once. `at` is relative to the enclosing scene's
 * timeline (the scene itself sits inside a root <Sequence>), so SFX stay
 * self-contained per scene and naturally gate off when the scene ends.
 */
export function Sfx({ src, at, volume = 1, playbackRate = 1 }: SfxProps) {
  return (
    <Sequence from={at}>
      <Audio src={src} volume={volume} playbackRate={playbackRate} />
    </Sequence>
  );
}
