// Generates a quiet (-18dB) ambient synth pad for the demo video:
// slow-breathing sine chord, A-minor-ish, faded in/out at the edges.
// Run: bun scripts/gen-ambient.mjs  →  writes src/remotion/audio/ambient.wav
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 22050;
const DUR = 45; // seconds
const N = SR * DUR;

// [frequency, amplitude, LFO rate, LFO phase]
const VOICES = [
  [110.0, 0.30, 0.05, 0.0], // A2
  [164.81, 0.24, 0.07, 1.3], // E3
  [220.0, 0.20, 0.09, 2.6], // A3
  [277.18, 0.15, 0.11, 3.9], // C#4
  [329.63, 0.11, 0.06, 5.2], // E4
];

const samples = new Float64Array(N);

for (const [freq, amp, lfoRate, lfoPhase] of VOICES) {
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Slow "breathing" amplitude modulation (period ~10-20s) + gentle detune chorus
    const breath = 0.62 + 0.38 * Math.sin(2 * Math.PI * lfoRate * t + lfoPhase);
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = Math.sin(2 * Math.PI * freq * 1.002 * t + 0.7); // +2 cents detune
    samples[i] += amp * breath * 0.5 * (s1 + s2);
  }
}

// Global envelope: fade in 2.5s, fade out last 3s.
const fadeIn = 2.5 * SR;
const fadeOut = 3 * SR;
for (let i = 0; i < N; i++) {
  let env = 1;
  if (i < fadeIn) env = Math.pow(i / fadeIn, 2.2);
  const fromEnd = N - i;
  if (fromEnd < fadeOut) env = Math.min(env, Math.pow(fromEnd / fadeOut, 2.2));
  samples[i] *= env;
}

// Normalize to ~-18dB peak (0.126 of full scale).
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(samples[i]));
const target = 0.126;
const gain = target / (peak || 1);

const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  const v = Math.max(-1, Math.min(1, samples[i] * gain));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16); // fmt chunk size
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/remotion/audio/ambient.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`wrote ${out} (${(pcm.length / 1024 / 1024).toFixed(2)} MB, peak ${(peak * gain).toFixed(3)})`);
