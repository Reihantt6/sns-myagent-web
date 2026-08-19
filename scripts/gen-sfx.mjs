// Synthesizes every "wow" sound effect for the demo video as 16-bit mono
// PCM wavs into src/remotion/audio/sfx/. Each wav bakes in its own attack
// (no clicks) and decay, so the composition only controls gain + timing.
// Run: bun scripts/gen-sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/remotion/audio/sfx");
mkdirSync(OUT, { recursive: true });

const TAU = Math.PI * 2;

function writeWav(name, samples, peak) {
  // Normalize to the target peak, then write 16-bit mono PCM.
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  const gain = peak / (max || 1);
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i] * gain));
    pcm.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  const file = join(OUT, name);
  writeFileSync(file, Buffer.concat([header, pcm]));
  console.log(`${name.padEnd(16)} ${(samples.length / SR).toFixed(2)}s peak ${peak.toFixed(2)} (${(pcm.length / 1024).toFixed(0)} KB)`);
}

function expDecay(n, rate) {
  return Math.pow(Math.E, (-rate * n) / SR);
}

/** Short cosine attack ramp (no click). */
function attack(n, dur) {
  const len = Math.floor((dur / 1000) * SR);
  return n < len ? 0.5 - 0.5 * Math.cos((Math.PI * n) / len) : 1;
}

/** One-pole lowpass, cutoff swept across the sample. */
function lowpassSweep(samples, f0, f1) {
  const out = new Float64Array(samples.length);
  let y = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / samples.length;
    const fc = f0 * Math.pow(f1 / f0, t);
    const alpha = 1 - Math.exp((-TAU * fc) / SR);
    y += alpha * (samples[i] - y);
    out[i] = y;
  }
  return out;
}

// ---------- whoosh.wav (0.8s) — soft noise sweep, used for logo / opens ----------
{
  const n = SR * 0.8;
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  const swept = lowpassSweep(s, 350, 4200);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // bell envelope: rise 0.25s, fall 0.35s
    const env = Math.min(t / 0.25, 1) * Math.min((1 - t) / 0.35, 1);
    out[i] = swept[i] * env * 3.2; // noise is low energy, boost after filtering
  }
  writeWav("whoosh.wav", out, 0.5);
}

// ---------- chime.wav (0.6s) — shimmer chime on C6 major-ish tones ----------
{
  const n = SR * 0.6;
  const out = new Float64Array(n);
  const partials = [
    { f: 1046.5, a: 1.0 }, // C6
    { f: 1318.5, a: 0.5 }, // E6
    { f: 1568.0, a: 0.35 }, // G6
    { f: 2093.0, a: 0.22 }, // C7
  ];
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (const p of partials) {
      v += p.a * Math.sin(TAU * p.f * (i / SR)) * expDecay(i, 5.5);
    }
    out[i] = v * attack(i, 4) * 0.5;
  }
  writeWav("chime.wav", out, 0.55);
}

// ---------- tick.wav (0.03s) — short keyboard / link / count click ----------
{
  const n = SR * 0.03;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const noise = Math.random() * 2 - 1;
    out[i] = noise * expDecay(i, 260) * attack(i, 1);
  }
  // bandpass-ish: difference of two lowpasses would be ideal; keep highpassed feel
  writeWav("tick.wav", out, 0.35);
}

// ---------- beep.wav (0.15s) — terminal startup beep 880Hz, low gain ----------
{
  const n = SR * 0.15;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = Math.sin(TAU * 880 * (i / SR)) * expDecay(i, 34) * attack(i, 3);
  }
  writeWav("beep.wav", out, 0.3);
}

// ---------- blip.wav (0.12s) — UI blip at 440Hz (playbackRate raises pitch) ----------
{
  const n = SR * 0.12;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = (Math.sin(TAU * 440 * t) + 0.35 * Math.sin(TAU * 880 * t)) * expDecay(i, 42) * attack(i, 2);
  }
  writeWav("blip.wav", out, 0.4);
}

// ---------- swish.wav (0.6s) — page scroll swoosh (slower, softer sweep) ----------
{
  const n = SR * 0.6;
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  const swept = lowpassSweep(s, 300, 2600);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.min(t / 0.3, 1) * Math.min((1 - t) / 0.3, 1);
    out[i] = swept[i] * env * 3;
  }
  writeWav("swish.wav", out, 0.4);
}

// ---------- sparkle.wav (0.6s) — 3 quick rising notes (subagent spawn) ----------
{
  const n = SR * 0.6;
  const out = new Float64Array(n);
  const notes = [
    { start: 0.0, f: 659.25, a: 0.9 }, // E5
    { start: 0.12, f: 880.0, a: 0.9 }, // A5
    { start: 0.24, f: 1174.66, a: 0.9 }, // D6
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const note of notes) {
      const lt = t - note.start;
      if (lt < 0) continue;
      const li = Math.floor(lt * SR);
      v += note.a * Math.sin(TAU * note.f * lt) * expDecay(li, 18) * attack(li, 2);
    }
    out[i] = v * 0.6;
  }
  writeWav("sparkle.wav", out, 0.5);
}

// ---------- write.wav (0.05s) — hard drive write click ----------
{
  const n = SR * 0.05;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const noise = Math.random() * 2 - 1;
    const thump = Math.sin(TAU * 90 * t) * expDecay(i, 60);
    out[i] = (noise * 0.7 + thump * 0.5) * expDecay(i, 150) * attack(i, 1);
  }
  writeWav("write.wav", out, 0.45);
}

// ---------- finalchime.wav (1.4s) — warm C-major ending chord ----------
{
  const n = SR * 1.4;
  const out = new Float64Array(n);
  const chord = [
    { f: 523.25, a: 1.0 }, // C5
    { f: 659.25, a: 0.8 }, // E5
    { f: 783.99, a: 0.7 }, // G5
    { f: 1046.5, a: 0.45 }, // C6
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const p of chord) {
      v += p.a * Math.sin(TAU * p.f * t) * expDecay(i, 3.2);
    }
    out[i] = v * attack(i, 8) * 0.5;
  }
  writeWav("finalchime.wav", out, 0.5);
}

// ---------- rumble.wav (1.8s) — low sub swell under the CTA logo ----------
{
  const n = SR * 1.8;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // slow swell up then gentle release
    const env = Math.min(t / 0.9, 1) * Math.min((1.8 - t) / 0.7, 1);
    const sub = Math.sin(TAU * 48 * t) + 0.4 * Math.sin(TAU * 96 * t);
    out[i] = sub * env * 0.5;
  }
  writeWav("rumble.wav", out, 0.5);
}

console.log("done →", OUT);
