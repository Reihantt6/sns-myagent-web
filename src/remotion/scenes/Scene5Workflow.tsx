import { Check } from "../components/Icons";
import { BlockCursor, MONO, TerminalWindow } from "../components/TerminalWindow";
import { cursorBlink, fadeIn, slideUp, typedChars } from "../helpers";
import { C } from "../theme";

const PROMPT = "Refactor the auth module to use async/await";
const PROMPT_START = 18;
const PROMPT_SPEED = 2.4;

const FILE_LINES = [
  { text: "$ snsagent", at: 10, cls: C.fg },
  { text: "> refactor the auth module to use async/await", at: 22, cls: C.fg },
  { text: "reading src/auth/ · 3 files", at: 52, cls: C.fg2 },
  { text: "✎ src/auth/login.ts", at: 72, cls: C.fg },
  { text: "✎ src/auth/session.ts", at: 84, cls: C.fg },
  { text: "✎ src/auth/middleware.ts", at: 96, cls: C.fg },
];

/** Scene 5 · REAL WORKFLOW (32-40s): user prompt + terminal output. Orange-only. */
export function Scene5Workflow({ frame }: { frame: number }) {
  const typed = typedChars(frame, PROMPT_START, PROMPT_SPEED);
  const typingDone = frame >= PROMPT_START + PROMPT.length * PROMPT_SPEED;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
      }}
    >
      {/* Left: user prompt panel */}
      <div
        style={{
          width: 780,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: C.panel,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
          ...slideUp(frame, 8, 24, 30),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            height: 58,
            borderBottom: `1px solid ${C.line}`,
            background: C.panel2,
          }}
        >
          <span style={{ ...MONO, fontSize: 15, color: C.fg3 }}>you · prompt</span>
          <span style={{ ...MONO, fontSize: 13, color: C.accentSoft, opacity: fadeIn(frame, 10, 120) }}>
            sent ✓
          </span>
        </div>
        <div style={{ padding: "34px 30px", minHeight: 210, ...MONO, fontSize: 24, lineHeight: 1.8, color: C.fg }}>
          <span style={{ color: C.accent, fontWeight: 700, marginRight: 12 }}>&gt;</span>
          {PROMPT.slice(0, typed)}
          <BlockCursor visible={typingDone ? cursorBlink(frame, PROMPT_START + PROMPT.length * PROMPT_SPEED) : 1} size={24} />
        </div>
      </div>

      {/* Right: terminal output */}
      <TerminalWindow title="snsagent · output" width={1000} style={slideUp(frame, 12, 24, 30)}>
        <div style={{ ...MONO, fontSize: 23, lineHeight: 2.05 }}>
          {FILE_LINES.map((l, i) => (
            <div
              key={i}
              style={{
                color: l.cls,
                opacity: fadeIn(frame, 12, l.at),
                transform: `translateY(${(1 - fadeIn(frame, 12, l.at)) * 12}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {l.text}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: C.fg,
              opacity: fadeIn(frame, 14, 112),
              transform: `translateY(${(1 - fadeIn(frame, 14, 112)) * 12}px)`,
            }}
          >
            <Check size={22} />
            <span style={{ fontWeight: 600 }}>3 files changed</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginTop: 22,
              padding: "12px 26px",
              borderRadius: 999,
              border: "1px solid rgba(234, 88, 12, 0.5)",
              background: "rgba(234, 88, 12, 0.10)",
              opacity: fadeIn(frame, 14, 132),
              transform: `translateY(${(1 - fadeIn(frame, 14, 132)) * 12}px)`,
            }}
          >
            <Check size={18} strokeWidth={3} />
            <span style={{ ...MONO, fontSize: 18, color: C.accentSoft, fontWeight: 600, letterSpacing: "0.04em" }}>
              TESTS PASS · 3/3
            </span>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
