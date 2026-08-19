import uiBlip from "../audio/sfx-v3/ui-blip.wav";
import { Check } from "../components/Icons";
import { Sfx } from "../components/Sfx";
import { BlockCursor, MONO, TerminalWindow } from "../components/TerminalWindow";
import { fadeIn, slideUp, typedChars } from "../helpers";
import { C } from "../theme";

interface Field {
  label: string;
  value: string;
  /** frames per character */
  speed: number;
  start: number;
  /** value is a sequence of dots */
  dots?: boolean;
}

const FIELDS: Field[] = [
  { label: "Provider", value: "OpenAI-compatible", speed: 2.2, start: 24 },
  { label: "API key", value: "••••••••", speed: 3.2, start: 58, dots: true },
  { label: "Model", value: "deepseek-v4-pro", speed: 2.2, start: 88 },
];

const PLATFORMS = ["Windows", "Linux", "macOS", "Termux"];

// Pleasing chord-arpeggio blips on each field + Connected: 392 → 494 → 587 → 698 Hz
// (G4/B4/D5/F5). ui-blip.wav is synthesized at 392Hz; playbackRate multiplies.
const BLIPS: { at: number; rate: number }[] = [
  { at: 26, rate: 1.0 }, // 392 Hz
  { at: 60, rate: 1.2602 }, // 494 Hz
  { at: 90, rate: 1.4974 }, // 587 Hz
  { at: 134, rate: 1.7806 }, // 698 Hz
];

/** Scene 3 · SETUP (10-16s): wizard fields auto-fill, Connected badge, platform chips. */
export function Scene3Setup({ frame }: { frame: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* UI blips, rising in pitch per field */}
      {BLIPS.map((b, i) => (
        <Sfx key={i} src={uiBlip} at={b.at} volume={0.55} playbackRate={b.rate} />
      ))}
      <TerminalWindow title="snsagent — first run" width={1040} style={slideUp(frame, 6, 24, 30)}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 23, fontWeight: 700, color: C.fg }}>
          Setup wizard
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            color: C.fg3,
            marginTop: 4,
            marginBottom: 18,
          }}
        >
          talking to snsagent · no config files
        </div>

        {FIELDS.map((f, i) => {
          const chars = typedChars(frame, f.start, f.speed);
          const rowIn = slideUp(frame, 12 + i * 6, 16, 18);
          const rowDone = frame >= f.start + f.value.length * f.speed;
          return (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 4px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                ...rowIn,
              }}
            >
              <span style={{ ...MONO, fontSize: 19, color: C.fg3, letterSpacing: "0.04em" }}>
                {f.label}
              </span>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ ...MONO, fontSize: 25, color: C.fg }}>
                  {f.dots ? "•".repeat(chars) : f.value.slice(0, chars)}
                </span>
                {!rowDone && <BlockCursor visible={1} size={25} />}
              </span>
            </div>
          );
        })}

        {/* Connected badge */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 26, ...slideUp(frame, 132, 18, 20) }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 30px",
              borderRadius: 999,
              border: `1px solid rgba(234, 88, 12, 0.5)`,
              background: "rgba(234, 88, 12, 0.10)",
            }}
          >
            <Check size={22} />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 21,
                fontWeight: 700,
                color: C.fg,
              }}
            >
              Connected
            </span>
          </span>
        </div>
      </TerminalWindow>

      {/* Platform chips */}
      <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
        {PLATFORMS.map((p, i) => (
          <span
            key={p}
            style={{
              ...MONO,
              fontSize: 18,
              color: C.fg2,
              padding: "11px 26px",
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              background: C.panel2,
              opacity: fadeIn(frame, 14, 168 + i * 3),
              transform: `translateY(${(1 - fadeIn(frame, 14, 168 + i * 3)) * 16}px)`,
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
