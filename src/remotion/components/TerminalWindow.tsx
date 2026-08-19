import type { CSSProperties, ReactNode } from "react";
import { C } from "../theme";

/**
 * Terminal window mockup: dark rounded panel, muted traffic-light dots
 * (palette-safe zinc tones — the design system bans red/green), title bar.
 */
export function TerminalWindow({
  title,
  width,
  style,
  children,
}: {
  title: string;
  width: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        border: `1px solid ${C.line}`,
        background: C.panel,
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          height: 58,
          borderBottom: `1px solid ${C.line}`,
          background: C.panel2,
        }}
      >
        <span style={{ width: 13, height: 13, borderRadius: 99, background: "#3f3f46" }} />
        <span style={{ width: 13, height: 13, borderRadius: 99, background: "#52525b" }} />
        <span style={{ width: 13, height: 13, borderRadius: 99, background: "#71717a" }} />
        <span
          style={{
            marginLeft: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            color: C.fg3,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "34px 40px 40px" }}>{children}</div>
    </div>
  );
}

/** Orange block cursor (blink handled by caller). */
export function BlockCursor({ visible, size = 30 }: { visible: number; size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size * 0.55,
        height: size * 0.9,
        background: C.accent,
        opacity: visible,
        verticalAlign: "text-bottom",
        marginLeft: 4,
      }}
    />
  );
}

export const MONO: CSSProperties = { fontFamily: "var(--font-mono)" };
export const SANS: CSSProperties = { fontFamily: "var(--font-sans)" };
