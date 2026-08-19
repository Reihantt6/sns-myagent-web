import { interpolate } from "remotion";
import cardChime from "../audio/sfx-v3/card-chime.wav";
import countTick from "../audio/sfx-v3/count-tick.wav";
import type { CSSProperties } from "react";
import { Icon } from "../components/Icons";
import { Sfx } from "../components/Sfx";
import { countUp, fadeIn, slideUp } from "../helpers";
import { C } from "../theme";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

type Card =
  | { kind: "count"; icon: "wrench" | "terminal"; target: number; label: string }
  | { kind: "text"; icon: "chip" | "plug" | "branch" | "shield"; title: string; desc: string };

const CARDS: Card[] = [
  { kind: "count", icon: "wrench", target: 30, label: "built-in tools" },
  { kind: "count", icon: "terminal", target: 62, label: "slash commands" },
  { kind: "text", icon: "chip", title: "Persistent memory", desc: "survives restarts, per-project" },
  { kind: "text", icon: "plug", title: "Any MCP server", desc: "tools & resources, live" },
  { kind: "text", icon: "branch", title: "Subagents in parallel", desc: "delegate, critic, consensus" },
  { kind: "text", icon: "shield", title: "Safe by default", desc: "approval mode: always-ask" },
];

const CARD_W = 560;
const CARD_H = 235;
const GAP = 28;

function CardView({ card, index, frame }: { card: Card; index: number; frame: number }) {
  const enter = 20 + index * 3; // 0.1s stagger
  const done = enter + 12 + 46; // count-up / reveal completes
  // Subtle orange border-glow as the card completes (300ms = 9 frames).
  const glow = interpolate(frame, [done, done + 9], [0, 1], { ...clamp });
  const style: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    border: `1px solid rgba(234, 88, 12, ${0.25 + 0.55 * glow})`,
    boxShadow: `0 0 ${34 * glow}px ${8 * glow}px rgba(234, 88, 12, ${0.22 * glow})`,
    background: C.panel,
    padding: "30px 32px",
    display: "flex",
    flexDirection: "column",
    ...slideUp(frame, enter, 24, 30),
  };

  return (
    <div style={style}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 13,
          background: "rgba(234, 88, 12, 0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={card.icon} size={25} />
      </div>
      {card.kind === "count" ? (
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: C.fg,
              fontVariantNumeric: "tabular-nums",
              opacity: fadeIn(frame, 10, enter + 12),
            }}
          >
            {countUp(frame, enter + 12, 46, card.target)}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 20, color: C.fg2, marginTop: 8 }}>
            {card.label}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: 27,
              letterSpacing: "-0.01em",
              color: C.fg,
            }}
          >
            {card.title}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 19, color: C.fg2, marginTop: 7 }}>
            {card.desc}
          </div>
        </div>
      )}
    </div>
  );
}

/** Gentle chord progression for the six card completions (C major triad, rising). */
const CHIMES = [1.0, 1.1225, 1.26, 1.4983, 1.6818, 2.0];

/** Card completion frames (same math as CardView). */
const DONE_AT = CARDS.map((_, i) => 20 + i * 3 + 12 + 46);

/** Count-up tick frames: every 3 frames across both count windows. */
const COUNT_TICKS: number[] = [];
for (let c = 0; c < 2; c++) {
  const start = 20 + c * 3 + 12; // 32, 35
  for (let f = start; f < start + 46; f += 3) COUNT_TICKS.push(f);
}

/** Scene 6 · CAPABILITIES (33-42s): bento grid, staggered, count-ups. */
export function Scene4Capabilities({ frame }: { frame: number }) {
  const gridW = CARD_W * 3 + GAP * 2;
  const left = (1920 - gridW) / 2;
  const top = (1080 - (CARD_H * 2 + GAP + 96)) / 2;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Whisper-quiet count ticks, warm C-major chord per completed card */}
      {COUNT_TICKS.map((at, i) => (
        <Sfx key={i} src={countTick} at={at} volume={0.35} />
      ))}
      {DONE_AT.map((at, i) => (
        <Sfx key={i} src={cardChime} at={at} volume={0.6} playbackRate={CHIMES[i]} />
      ))}
      <div
        style={{
          position: "absolute",
          top: top - 84,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 18,
          letterSpacing: "0.34em",
          color: C.fg3,
          opacity: fadeIn(frame, 16, 6),
        }}
      >
        CAPABILITIES
      </div>
      <div
        style={{
          position: "absolute",
          top,
          left,
          display: "grid",
          gridTemplateColumns: `repeat(3, ${CARD_W}px)`,
          gap: GAP,
        }}
      >
        {CARDS.map((card, i) => (
          <CardView key={i} card={card} index={i} frame={frame} />
        ))}
      </div>
    </div>
  );
}
