// Synthesizes the sharper, more digital "ff3ct" sound effects for the v2 demo
// video as 16-bit mono PCM wavs into src/remotion/audio/sfx-v2/.
//
// Approach: everything goes through ffmpeg lavfi for precise synth control —
//   - aevalsrc  : sine tones with exact frequency envelopes (decay, sweeps)
//   - anoisesrc : noise bursts shaped with bandpass + afade (digital ticks)
//   - flanger   : adds the moving "digital" shimmer to noise sweeps
// Each wav bakes in its own attack/decay so the composition only controls
// gain + timing. Outputs are peak-normalized to a target so the mix stays
// consistent and never clips.
//
// Run: bun scripts/gen-sfx-v2.mjs
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/remotion/audio/sfx-v2");
mkdirSync(OUT, { recursive: true });

const SR = 44100;

/** Run ffmpeg with a single lavfi filtergraph, write 44.1k mono 16-bit PCM. */
function synth(name, graph, extra = []) {
  const args = [
    "-y", "-v", "error",
    "-filter_complex", graph,
    "-map", "[out]",
    "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le",
    join(OUT, name),
    ...extra,
  ];
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
}

/** Peak-normalize a generated file to `target` (0..1). */
function normalize(name, target) {
  const file = join(OUT, name);
  const detect = spawnSync(
    "ffmpeg", ["-i", file, "-af", "volumedetect", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  if (detect.status !== 0) throw new Error(`volumedetect failed for ${name}`);
  const m = detect.stderr.match(/max_volume: (-?[\d.]+) dB/);
  if (!m) throw new Error(`volumedetect failed for ${name}`);
  const gain = target - Math.pow(10, parseFloat(m[1]) / 20);
  const tmp = file + ".tmp.wav";
  execFileSync(
    "ffmpeg", ["-y", "-v", "error", "-i", file, "-af", `volume=${gain.toFixed(6)}`, "-c:a", "pcm_s16le", tmp],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  execFileSync("mv", [tmp, file]);
  const size = execFileSync("stat", ["-c", "%s", file]).toString().trim();
  console.log(`${name.padEnd(18)} ${(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim())).toFixed(2)}s peak ${target} (${(size / 1024).toFixed(0)} KB)`);
}

// ---------- Scene 1 · HOOK ----------

// riser.wav (0.6s) — sharp digital riser, exponential sweep 200Hz → 2000Hz,
// amplitude ramps up with the pitch; 30ms end fade kills any click.
synth(
  "riser.wav",
  "aevalsrc=exprs='sin(2*PI*200*0.6*(pow(2000/200,t/0.6)-1)/log(2000/200))*min(t/0.12,1)*min((0.6-t)/0.03,1)':d=0.6:s=44100[out]",
);
normalize("riser.wav", 0.65);

// logo-chime.wav (0.15s) — clean sine 1200Hz, near-instant attack, fast decay.
synth(
  "logo-chime.wav",
  "aevalsrc=exprs='sin(2*PI*1200*t)*exp(-t*38)*min(t/0.002,1)':d=0.15:s=44100[out]",
);
normalize("logo-chime.wav", 0.6);

// data-tick.wav (0.02s) — tiny white-noise burst, bandpass 3kHz, super short.
synth(
  "data-tick.wav",
  "anoisesrc=d=0.02:c=white:a=0.9,bandpass=f=3000:t=q:w=1.5,afade=t=in:st=0:d=0.002,afade=t=out:st=0.012:d=0.008[out]",
);
normalize("data-tick.wav", 0.45);

// ---------- Scene 2 · INSTALL ----------

// key-tick.wav (0.02s) — keyboard click per typed char: crisper bandpass 2.8kHz.
synth(
  "key-tick.wav",
  "anoisesrc=d=0.02:c=white:a=0.9,bandpass=f=2800:t=q:w=2,afade=t=in:st=0:d=0.0015,afade=t=out:st=0.012:d=0.008[out]",
);
normalize("key-tick.wav", 0.5);

// term-beep.wav (0.06s) — sharp terminal startup beep, sine 1100Hz.
synth(
  "term-beep.wav",
  "aevalsrc=exprs='sin(2*PI*1100*t)*exp(-t*42)*min(t/0.002,1)':d=0.06:s=44100[out]",
);
normalize("term-beep.wav", 0.55);

// ---------- Scene 3 · SETUP ----------

// ui-blip.wav (0.04s) — UI blip base at 660Hz + octave harmonic, fast decay.
// playbackRate in the scene raises it to 880/1100/1320Hz.
synth(
  "ui-blip.wav",
  "aevalsrc=exprs='(sin(2*PI*660*t)+0.35*sin(2*PI*1320*t))*exp(-t*70)*min(t/0.002,1)':d=0.04:s=44100[out]",
);
normalize("ui-blip.wav", 0.5);

// ---------- Scene 4 · DOCS ----------

// browser-swish.wav (0.6s) — digital noise sweep up: bandpassed white noise
// with flanger movement for the sci-fi shimmer.
synth(
  "browser-swish.wav",
  "anoisesrc=d=0.6:c=white:a=0.85,bandpass=f=3500:t=q:w=1,flanger=delay=2:depth=3:speed=0.9:shape=sinusoidal,afade=t=in:st=0:d=0.12,afade=t=out:st=0.42:d=0.18[out]",
);
normalize("browser-swish.wav", 0.55);

// link-click.wav (0.03s) — short 2kHz sine click, very fast decay.
synth(
  "link-click.wav",
  "aevalsrc=exprs='sin(2*PI*2000*t)*exp(-t*120)*min(t/0.0015,1)':d=0.03:s=44100[out]",
);
normalize("link-click.wav", 0.5);

// scroll-swoosh.wav (0.5s) — downward-feeling noise sweep, lower bandpass.
synth(
  "scroll-swoosh.wav",
  "anoisesrc=d=0.5:c=white:a=0.85,bandpass=f=2200:t=q:w=1,flanger=delay=2:depth=3:speed=0.7:shape=sinusoidal,afade=t=in:st=0:d=0.1,afade=t=out:st=0.35:d=0.15[out]",
);
normalize("scroll-swoosh.wav", 0.5);

// ---------- Scene 5 · SUBAGENTS ----------

// sparkle-arpeggio.wav (0.5s) — 3 quick ascending notes 880/1320/1760Hz,
// each with a sharp envelope, concatenated.
synth(
  "sparkle-arpeggio.wav",
  "aevalsrc=exprs='sin(2*PI*880*t)*exp(-t*24)*min(t/0.002,1)':d=0.16:s=44100[a0];"
  + "aevalsrc=exprs='sin(2*PI*1320*(t-0.16))*exp(-(t-0.16)*24)*gt(t,0.16)*min((t-0.16)/0.002,1)':d=0.16:s=44100[a1];"
  + "aevalsrc=exprs='sin(2*PI*1760*(t-0.32))*exp(-(t-0.32)*24)*gt(t,0.32)*min((t-0.32)/0.002,1)':d=0.18:s=44100[a2];"
  + "[a0][a1][a2]concat=n=3:v=0:a=1[out]",
);
normalize("sparkle-arpeggio.wav", 0.6);

// data-write.wav (0.03s) — per-file write tick: bandpass 1.5kHz, 30ms.
synth(
  "data-write.wav",
  "anoisesrc=d=0.03:c=white:a=0.9,bandpass=f=1500:t=q:w=1.8,afade=t=in:st=0:d=0.002,afade=t=out:st=0.02:d=0.01[out]",
);
normalize("data-write.wav", 0.5);

// success-chime.wav (0.2s) — sine 1500 + 2200Hz together, sharp attack.
synth(
  "success-chime.wav",
  "aevalsrc=exprs='(sin(2*PI*1500*t)+0.6*sin(2*PI*2200*t))*exp(-t*16)*min(t/0.003,1)':d=0.2:s=44100[out]",
);
normalize("success-chime.wav", 0.55);

// ---------- Scene 6 · CAPABILITIES ----------

// count-tick.wav (0.012s) — tiny digital blip per count-up integer step.
synth(
  "count-tick.wav",
  "aevalsrc=exprs='(sin(2*PI*1000*t)+0.5*sin(2*PI*2000*t))*exp(-t*160)*min(t/0.001,1)':d=0.012:s=44100[out]",
);
normalize("count-tick.wav", 0.4);

// card-chime.wav (0.15s) — pentatonic base C5 (523Hz) + G5, sharp envelope.
// playbackRate raises it across C/E/G/A (523/659/784/988Hz).
synth(
  "card-chime.wav",
  "aevalsrc=exprs='(sin(2*PI*523*t)+0.45*sin(2*PI*784*t))*exp(-t*28)*min(t/0.002,1)':d=0.15:s=44100[out]",
);
normalize("card-chime.wav", 0.55);

// ---------- Scene 7 · CTA ----------

// final-chord.wav (1.0s) — warm C-major triad 523+659+784Hz, slow attack/release.
synth(
  "final-chord.wav",
  "aevalsrc=exprs='(sin(2*PI*523*t)+0.8*sin(2*PI*659*t)+0.65*sin(2*PI*784*t))*min(t/0.25,1)*min((1-t)/0.4,1)':d=1.0:s=44100[out]",
);
normalize("final-chord.wav", 0.6);

// sub-swell.wav (2.0s) — soft 50Hz sub-bass swell, slow fade in/out.
synth(
  "sub-swell.wav",
  "aevalsrc=exprs='sin(2*PI*50*t)*min(t/1.0,1)*min((2-t)/1.0,1)':d=2.0:s=44100[out]",
);
normalize("sub-swell.wav", 0.7);

console.log("done →", OUT);
