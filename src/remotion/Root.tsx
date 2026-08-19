import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export function RemotionRoot() {
  return (
    <Composition
      id="DemoVideo"
      component={DemoVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
