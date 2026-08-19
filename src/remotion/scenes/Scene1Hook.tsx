import { fadeIn, slideUp } from "../helpers";
import { C } from "../theme";

/** Scene 1 · HOOK (0-5s): `>_` logo, SNS-MyAgent, subtitle. */
export function Scene1Hook({ frame }: { frame: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Soft orange aura behind the logo */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          width: 900,
          height: 520,
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse, rgba(234, 88, 12, 0.13), transparent 62%)",
          opacity: fadeIn(frame, 30),
        }}
      />
      <div style={{ textAlign: "center", marginTop: -40 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 116,
            lineHeight: 1,
            color: C.accent,
            opacity: fadeIn(frame, 18),
            transform: `translateY(${(1 - fadeIn(frame, 18)) * 14}px)`,
          }}
        >
          {">_"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 66,
            letterSpacing: "-0.02em",
            color: C.fg,
            marginTop: 26,
            ...slideUp(frame, 12, 24, 30),
          }}
        >
          SNS-MyAgent
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: 27,
            color: C.fg2,
            marginTop: 18,
            ...slideUp(frame, 30, 20, 22),
          }}
        >
          A coding agent that actually fits your terminal.
        </div>
      </div>
    </div>
  );
}
