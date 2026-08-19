import { useEffect, useState } from "react";

const VIDEO_SRC = "/videos/sns-myagent-demo.mp4";
const POSTER_SRC = "/videos/sns-myagent-demo.poster.jpg";

const FRAME_CLASS =
  "aspect-video w-full rounded-2xl border border-zinc-800 bg-black object-cover shadow-[0_20px_60px_rgba(0,0,0,0.35)]";

/**
 * 45s brand demo in the hero. Autoplays muted + looped; under
 * prefers-reduced-motion we show the static poster frame instead.
 */
export function DemoVideo() {
  const [posterOnly, setPosterOnly] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPosterOnly(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (posterOnly) {
    return (
      <img
        src={POSTER_SRC}
        alt="SNS-MyAgent demo video — first frame"
        loading="lazy"
        decoding="async"
        className={FRAME_CLASS}
      />
    );
  }

  return (
    <video
      src={VIDEO_SRC}
      poster={POSTER_SRC}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      loading="lazy"
      aria-label="SNS-MyAgent 45-second product demo"
      className={FRAME_CLASS}
    />
  );
}
