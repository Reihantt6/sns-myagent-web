import finalchime from "../audio/sfx/finalchime.wav";
import rumble from "../audio/sfx/rumble.wav";
import { Sfx } from "../components/Sfx";
import { fadeIn, slideUp } from "../helpers";
import { C } from "../theme";

/**
 * Scene 7 · CTA (48-55s): logo, URL, install pill with subtle glow.
 * Warm final chime + soft sub rumble swell under the logo; the scene
 * (and the URL) fades out to black exactly at 55s via the scene shell.
 */
export function Scene7Cta({ frame }: { frame: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Sfx src={finalchime} at={16} volume={0.8} />
      <Sfx src={rumble} at={22} volume={0.55} />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1,
          color: C.accent,
          opacity: fadeIn(frame, 18),
        }}
      >
        {">_"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 800,
          fontSize: 48,
          letterSpacing: "-0.02em",
          color: C.fg,
          marginTop: 28,
          ...slideUp(frame, 14, 24, 30),
        }}
      >
        sns-myagent.web.id
      </div>
      <div style={{ position: "relative", marginTop: 46 }}>
        {/* Subtle glow that eases in once (0.4s) and stays — no flashy shine */}
        <div
          style={{
            position: "absolute",
            inset: -34,
            borderRadius: 999,
            boxShadow: "0 0 90px 22px rgba(234, 88, 12, 0.28)",
            opacity: fadeIn(frame, 12, 40),
          }}
        />
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "20px 48px",
            borderRadius: 999,
            background: C.accent,
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: 25,
            color: "#09090b",
            ...slideUp(frame, 40, 20, 24),
          }}
        >
          Install snsagent
          <span style={{ fontSize: 26, lineHeight: 1 }}>→</span>
        </div>
      </div>
    </div>
  );
}
