import keyTick from "../audio/sfx-v2/key-tick.wav";
import termBeep from "../audio/sfx-v2/term-beep.wav";
import { Sfx } from "../components/Sfx";
import { BlockCursor, MONO, TerminalWindow } from "../components/TerminalWindow";
import { cursorBlink, fadeIn, slideUp, typedChars } from "../helpers";
import { C } from "../theme";

const CMD = "npm i -g snsagent";
const TYPING_START = 26;
const TYPING_SPEED = 3.1;

/** Sharp keyboard tick on each character reveal. */
const TICKS = Array.from({ length: CMD.length }, (_, i) =>
  Math.floor(TYPING_START + i * TYPING_SPEED),
);

/** Scene 2 · INSTALL (4-10s): one-command install typing animation. */
export function Scene2Install({ frame }: { frame: number }) {
  const typed = typedChars(frame, TYPING_START, TYPING_SPEED);
  const typingDone = frame >= TYPING_START + CMD.length * TYPING_SPEED;
  const typingCursor = !typingDone ? 1 : 0;

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
      {/* Sharp terminal startup beep, digital key ticks per typed char */}
      <Sfx src={termBeep} at={8} volume={0.8} />
      {TICKS.map((at, i) => (
        <Sfx key={i} src={keyTick} at={at} volume={0.5} />
      ))}
      <TerminalWindow title="snsagent — zsh" width={1040} style={slideUp(frame, 8, 24, 30)}>
        <div style={{ ...MONO, fontSize: 27, lineHeight: 1.8, color: C.fg }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: C.accent, fontWeight: 700, marginRight: 14 }}>$</span>
            <span>{CMD.slice(0, typed)}</span>
            <BlockCursor visible={typingCursor} size={27} />
          </div>
          <div style={{ display: "flex", alignItems: "center", opacity: fadeIn(frame, 14, 96) }}>
            <span style={{ color: C.fg2 }}>+ snsagent@0.3.9 installed (3.2s)</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              opacity: fadeIn(frame, 12, 128),
              marginTop: 4,
            }}
          >
            <span style={{ color: C.accent, fontWeight: 700, marginRight: 14 }}>$</span>
            {/* Faster blink: 10 frames on / 6 off */}
            <BlockCursor visible={cursorBlink(frame, 136, 10, 6)} size={27} />
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
