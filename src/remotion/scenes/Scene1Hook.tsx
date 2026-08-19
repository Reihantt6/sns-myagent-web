import { interpolate } from "remotion";
import dataTick from "../audio/sfx-v2/data-tick.wav";
import logoChime from "../audio/sfx-v2/logo-chime.wav";
import riser from "../audio/sfx-v2/riser.wav";
import { Sfx } from "../components/Sfx";
import { EASE_OUT, fadeIn, slideUp } from "../helpers";
import { C } from "../theme";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** Scene 1 · HOOK (0-4s): `>_` logo punch-in, SNS-MyAgent, subtitle. */
export function Scene1Hook({ frame }: { frame: number }) {
  // Logo scale punch-in 0.8 → 1.0 with the same ease-out as the fade.
  const punch = interpolate(frame, [0, 18], [0, 1], { easing: EASE_OUT, ...clamp });
  const logoOpacity = fadeIn(frame, 18);
  // Radial pulse ring: expands 1 → 2 and fades out over 1s (30 frames).
  const ring = interpolate(frame, [8, 38], [0, 1], { ...clamp });

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
      {/* Sharp digital riser into the logo, clean chime on landing, tiny data tick */}
      <Sfx src={riser} at={2} volume={0.8} />
      <Sfx src={dataTick} at={12} volume={0.7} />
      <Sfx src={logoChime} at={15} volume={0.8} />
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
        {/* Logo glyph wrapped so the expanding pulse ring stays centered on it */}
        <div style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
          {/* Expanding radial pulse ring behind the logo (ff3ct feel) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 300,
              marginTop: -150,
              marginLeft: -150,
              borderRadius: "50%",
              border: `2px solid rgba(234, 88, 12, 0.55)`,
              transform: `scale(${1 + ring})`,
              opacity: (1 - ring) * 0.9,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 116,
              color: C.accent,
              opacity: logoOpacity,
              transform: `translateY(${(1 - punch) * 14}px) scale(${0.8 + 0.2 * punch})`,
            }}
          >
            {">_"}
          </div>
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
