import swish from "../audio/sfx/swish.wav";
import tick from "../audio/sfx/tick.wav";
import whoosh from "../audio/sfx/whoosh.wav";
import { Sfx } from "../components/Sfx";
import { fadeIn, slideUp } from "../helpers";
import { C } from "../theme";

const NAV = ["Installation", "Providers", "Memory", "MCP", "Subagents", "Slash Commands"];

/** Active sidebar item switches: Installation → Providers → Subagents. */
const ACTIVE_AT = [0, 120, 180];
const ACTIVE_ITEMS = ["Installation", "Providers", "Subagents"];

const CODE_LINES: { parts: { t: string; c: string }[] }[] = [
  { parts: [{ t: "import", c: C.accent }, { t: " { snsagent } from ", c: C.fg2 }, { t: '"snsagent"', c: C.fg }] },
  { parts: [{ t: "const agent = await snsagent.start(", c: C.fg }, { t: "{ model: ", c: C.fg }, { t: '"deepseek-v4-pro"', c: C.fg }, { t: " })", c: C.fg }] },
  { parts: [{ t: "await agent.refactor(", c: C.fg }, { t: '"src/auth/"', c: C.fg }, { t: ", { to: ", c: C.fg }, { t: '"async/await"', c: C.fg }, { t: " })", c: C.fg }] },
];

/**
 * Scene 4 · DOCS (17-25s): website docs in a browser window — sidebar
 * navigation with an orange active pill, scrolling content, code block.
 */
export function Scene4Docs({ frame }: { frame: number }) {
  const activeIdx = ACTIVE_AT.reduce((acc, at, i) => (frame >= at ? i : acc), 0);
  const active = ACTIVE_ITEMS[activeIdx];

  // Docs content scrolls up 40px between frame 55 and 200.
  const scroll = (frame - 55) / 145;
  const scrollY = Math.max(0, Math.min(1, scroll)) * 40;

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
      {/* Page swish on open, scroll swoosh, link clicks per sidebar switch */}
      <Sfx src={whoosh} at={6} volume={0.55} />
      <Sfx src={swish} at={55} volume={0.6} />
      <Sfx src={tick} at={120} volume={0.7} />
      <Sfx src={tick} at={180} volume={0.7} />

      <div
        style={{
          width: 1140,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: C.panel,
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
          overflow: "hidden",
          ...slideUp(frame, 6, 24, 30),
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 22px",
            height: 56,
            borderBottom: `1px solid ${C.line}`,
            background: C.panel2,
          }}
        >
          <span style={{ width: 13, height: 13, borderRadius: 99, background: "#3f3f46" }} />
          <span style={{ width: 13, height: 13, borderRadius: 99, background: "#52525b" }} />
          <span style={{ width: 13, height: 13, borderRadius: 99, background: "#71717a" }} />
          <span style={{ marginLeft: 14, fontFamily: "var(--font-mono)", fontSize: 15, color: C.fg3 }}>
            sns-myagent.web.id/docs
          </span>
        </div>

        {/* URL bar */}
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.line}` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 10,
              background: "#0a0a0d",
              border: `1px solid ${C.line}`,
              opacity: fadeIn(frame, 12, 16),
            }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.accentSoft} strokeWidth={2.2} strokeLinecap="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: C.fg2 }}>
              sns-myagent.web.id/docs
            </span>
          </div>
        </div>

        {/* Body: sidebar + main */}
        <div style={{ display: "flex", height: 500 }}>
          {/* Sidebar */}
          <div
            style={{
              width: 250,
              borderRight: `1px solid ${C.line}`,
              padding: "20px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.22em",
                color: C.fg3,
                padding: "4px 10px 12px",
              }}
            >
              DOCS
            </div>
            {NAV.map((item, i) => {
              const isActive = item === active;
              return (
                <div
                  key={item}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 16.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? C.accentSoft : C.fg2,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: isActive ? "rgba(234, 88, 12, 0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(234, 88, 12, 0.4)" : "1px solid transparent",
                    opacity: fadeIn(frame, 12, 26 + i * 3),
                    transform: `translateY(${(1 - fadeIn(frame, 12, 26 + i * 3)) * 12}px)`,
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>

          {/* Main content (scrolls up) */}
          <div style={{ flex: 1, padding: "26px 34px", overflow: "hidden", position: "relative" }}>
            <div
              style={{
                transform: `translateY(${-scrollY}px)`,
                opacity: fadeIn(frame, 14, 30),
              }}
            >
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 31, fontWeight: 800, letterSpacing: "-0.01em", color: C.fg }}>
                Getting Started
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 20 }}>
                <div style={{ width: 340, height: 11, borderRadius: 6, background: "#232327" }} />
                <div style={{ width: 300, height: 11, borderRadius: 6, background: "#232327" }} />
                <div style={{ width: 322, height: 11, borderRadius: 6, background: "#1d1d20" }} />
              </div>

              {/* Code block */}
              <div
                style={{
                  marginTop: 26,
                  borderRadius: 14,
                  border: `1px solid ${C.line}`,
                  background: "#0a0a0d",
                  padding: "20px 22px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 16.5,
                  lineHeight: 1.9,
                }}
              >
                {CODE_LINES.map((line, i) => (
                  <div key={i} style={{ whiteSpace: "nowrap" }}>
                    <span style={{ color: C.fg3, marginRight: 18 }}>{i + 1}</span>
                    {line.parts.map((p, j) => (
                      <span key={j} style={{ color: p.c }}>
                        {p.t}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Second paragraph block, revealed by the scroll */}
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 26 }}>
                <div style={{ width: 360, height: 11, borderRadius: 6, background: "#232327" }} />
                <div style={{ width: 290, height: 11, borderRadius: 6, background: "#232327" }} />
                <div style={{ width: 330, height: 11, borderRadius: 6, background: "#1d1d20" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
