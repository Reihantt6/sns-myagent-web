import dataWrite from "../audio/sfx-v2/data-write.wav";
import sparkleArpeggio from "../audio/sfx-v2/sparkle-arpeggio.wav";
import successChime from "../audio/sfx-v2/success-chime.wav";
import { Check, Icon } from "../components/Icons";
import { Sfx } from "../components/Sfx";
import { BlockCursor, MONO, TerminalWindow } from "../components/TerminalWindow";
import { cursorBlink, fadeIn, slideUp, typedChars } from "../helpers";
import { C } from "../theme";

const PROMPT = "Refactor the auth module to use async/await";
const PROMPT_START = 18;
const PROMPT_SPEED = 2.4;

const AGENTS = [
  { name: "parse.ts", file: "src/auth/parse.ts", spawn: 92 },
  { name: "rewrite.ts", file: "src/auth/rewrite.ts", spawn: 112 },
  { name: "tests.ts", file: "tests/auth.test.ts", spawn: 132 },
];

const SKILLS = ["remotion", "skill", "git", "fs"];

/**
 * Scene 5 · SUBAGENT TUTORIAL (24-33s): the "wow" centerpiece — the agent
 * plans, spawns 3 subagents in parallel (arpeggio sparkle each), writes
 * files (digital write tick each), and reports tests passing. Skills chips
 * top-right, pulsing orange "active" dot on each running card.
 */
export function Scene5Subagents({ frame }: { frame: number }) {
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
      {/* Arpeggio sparkle per subagent spawn, digital write ticks, success chime */}
      {AGENTS.map((a, i) => (
        <Sfx key={`s${i}`} src={sparkleArpeggio} at={a.spawn} volume={0.75} />
      ))}
      {AGENTS.map((a, i) => (
        <Sfx key={`w${i}`} src={dataWrite} at={a.spawn + 12} volume={0.65} />
      ))}
      <Sfx src={successChime} at={172} volume={0.8} />

      {/* Skills chip row, top-right */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 60,
          display: "flex",
          gap: 12,
        }}
      >
        {SKILLS.map((s, i) => (
          <span
            key={s}
            style={{
              ...MONO,
              fontSize: 15,
              color: C.accentSoft,
              padding: "9px 18px",
              borderRadius: 999,
              border: "1px solid rgba(234, 88, 12, 0.35)",
              background: "rgba(234, 88, 12, 0.06)",
              opacity: fadeIn(frame, 12, 56 + i * 3),
              transform: `translateY(${(1 - fadeIn(frame, 12, 56 + i * 3)) * 12}px)`,
            }}
          >
            [{s}]
          </span>
        ))}
      </div>

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
        <div style={{ padding: "30px 28px", ...MONO, fontSize: 24, lineHeight: 1.8, color: C.fg }}>
          <span style={{ color: C.accent, fontWeight: 700, marginRight: 12 }}>&gt;</span>
          {PROMPT.slice(0, typed)}
          <BlockCursor
            visible={typingDone ? cursorBlink(frame, PROMPT_START + PROMPT.length * PROMPT_SPEED) : 1}
            size={24}
          />
        </div>
      </div>

      {/* Right: agent terminal with subagent cards */}
      <TerminalWindow title="snsagent · subagents" width={1000} style={slideUp(frame, 12, 24, 30)}>
        <div style={{ ...MONO, fontSize: 21, lineHeight: 2.0 }}>
          <div style={{ color: C.fg, opacity: fadeIn(frame, 10, 10) }}>$ snsagent</div>
          <div style={{ color: C.fg, opacity: fadeIn(frame, 10, 22) }}>
            <span style={{ color: C.accent, fontWeight: 700, marginRight: 10 }}>&gt;</span>
            refactor the auth module to use async/await
          </div>
          <div style={{ color: C.fg2, opacity: fadeIn(frame, 10, 52) }}>planning…</div>
          <div style={{ color: C.fg, opacity: fadeIn(frame, 10, 72) }}>
            <span style={{ color: C.accentSoft }}>spawning 3 subagents</span>
          </div>

          {/* Subagent cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            {AGENTS.map((a, i) => {
              const inStyle = slideUp(frame, a.spawn, 18, 26);
              // Pulsing "active" dot once the card is running (sine pulse ~1.2Hz).
              const running = frame >= a.spawn;
              const pulse = running ? 0.55 + 0.45 * Math.sin((frame - a.spawn) / 8.3) : 0;
              return (
                <div
                  key={a.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderRadius: 13,
                    border: "1px solid rgba(234, 88, 12, 0.28)",
                    background: "#0e0e11",
                    ...inStyle,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(234, 88, 12, 0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="branch" size={18} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 20, fontWeight: 600, color: C.fg }}>
                        {a.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 14,
                          color: C.fg3,
                          marginTop: 2,
                          opacity: fadeIn(frame, 10, a.spawn + 12),
                        }}
                      >
                        {a.file}
                      </span>
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Pulsing orange "active" indicator on running cards */}
                    <span
                      style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        borderRadius: 99,
                        background: C.accent,
                        boxShadow: `0 0 12px 2px rgba(234, 88, 12, ${0.35 * pulse})`,
                        opacity: running ? pulse : 0,
                      }}
                    />
                    <span style={{ opacity: fadeIn(frame, 10, a.spawn + 18) }}>
                      <Check size={18} strokeWidth={3} />
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tests pass badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginTop: 22,
              padding: "13px 26px",
              borderRadius: 999,
              border: "1px solid rgba(234, 88, 12, 0.5)",
              background: "rgba(234, 88, 12, 0.10)",
              opacity: fadeIn(frame, 14, 172),
              transform: `translateY(${(1 - fadeIn(frame, 14, 172)) * 12}px)`,
            }}
          >
            <Check size={18} strokeWidth={3} />
            <span style={{ fontSize: 18, color: C.accentSoft, fontWeight: 600, letterSpacing: "0.04em" }}>
              3 files changed · tests pass
            </span>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
