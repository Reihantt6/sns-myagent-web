// Synthesizes the warm, elegant "Stripe/Linear/Notion" sound effects for the
// v3 demo video as 16-bit mono PCM wavs into src/remotion/audio/sfx-v3/.
//
// Design principles (opposite of the harsh v2 set):
//   - soft attack/release everywhere (no clicks or pops)
//   - lower, warmer pitches; rich intervals (thirds/fifths/chords)
//   - aecho reverb tails on everything for space and warmth
//   - bandpassed/lowpassed noise instead of bright transients
//
// Every wav is generated via ffmpeg lavfi (aevalsrc for tones, anoisesrc for
// noise, aecho for reverb, afade for envelopes) and peak-normalized so the
// composition only controls gain + timing.
//
// Run: bun scripts/gen-sfx-v3.mjs
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/remotion/audio/sfx-v3");
mkdirSync(OUT, { recursive: true });

const SR = 44100;

/** Run ffmpeg with a single lavfi filtergraph, write 44.1k mono 16-bit PCM. */
function synth(name, graph) {
  const args = [
    "-y", "-v", "error",
    "-filter_complex", graph,
    "-map", "[out]",
    "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le",
    join(OUT, name),
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
  if (!m) throw new Error(`no max_volume for ${name}`);
  const gain = target - Math.pow(10, parseFloat(m[1]) / 20);
  const tmp = file + ".tmp.wav";
  execFileSync(
    "ffmpeg", ["-y", "-v", "error", "-i", file, "-af", `volume=${gain.toFixed(6)}`, "-c:a", "pcm_s16le", tmp],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  execFileSync("mv", [tmp, file]);
  const size = execFileSync("stat", ["-c", "%s", file]).toString().trim();
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim();
  console.log(`${name.padEnd(18)} ${parseFloat(dur).toFixed(2)}s peak ${target} (${(size / 1024).toFixed(0)} KB)`);
}

// ---------- Scene 1 · HOOK ----------

// soft-whoosh.wav (0.6s) — warm noise swell, lowpassed 800Hz, reverb tail.
synth(
  "soft-whoosh.wav",
  "anoisesrc=d=0.6:c=white:a=0.5,lowpass=f=800,aecho=0.8:0.7:200:0.5,afade=t=in:st=0:d=0.25,afade=t=out:st=0.3:d=0.3[out]",
);
normalize("soft-whoosh.wav", 0.6);

// logo-chime.wav (0.4s) — glassy perfect-5th chime 660+990Hz, slow attack/release.
synth(
  "logo-chime.wav",
  "aevalsrc=exprs='(sin(2*PI*660*t)+0.6*sin(2*PI*990*t))*min(t/0.08,1)*min((0.4-t)/0.2,1)':d=0.4:s=44100,aecho=0.8:0.7:250:0.5[out]",
);
normalize("logo-chime.wav", 0.6);

// ---------- Scene 2 · INSTALL ----------

// key-tick.wav (0.015s) — soft mechanical key, bandpassed noise 1.2kHz + reverb.
synth(
  "key-tick.wav",
  "anoisesrc=d=0.015:c=white:a=0.35,bandpass=f=1200:t=q:w=1.5,aecho=0.6:0.5:60:0.35,afade=t=in:st=0:d=0.003,afade=t=out:st=0.008:d=0.007[out]",
);
normalize("key-tick.wav", 0.4);

// term-beep.wav (0.06s) — warm welcome tone 440+660Hz, soft envelope.
synth(
  "term-beep.wav",
  "aevalsrc=exprs='(sin(2*PI*440*t)+0.5*sin(2*PI*660*t))*min(t/0.015,1)*min((0.06-t)/0.03,1)':d=0.06:s=44100,aecho=0.7:0.6:150:0.4[out]",
);
normalize("term-beep.wav", 0.5);

// ---------- Scene 3 · SETUP ----------

// ui-blip.wav (0.08s) — pleasing chord arpeggio base at 392Hz (G), with
// 494+587 partials; playbackRate raises it through the field progression.
synth(
  "ui-blip.wav",
  "aevalsrc=exprs='(sin(2*PI*392*t)+0.4*sin(2*PI*494*t)+0.25*sin(2*PI*587*t))*min(t/0.015,1)*min((0.08-t)/0.05,1)':d=0.08:s=44100,aecho=0.7:0.6:120:0.4[out]",
);
normalize("ui-blip.wav", 0.5);

// ---------- Scene 4 · DOCS ----------

// browser-swish.wav (0.6s) — page-unfolding sweep: energy rises 200Hz→2kHz.
// Two filtered noises crossfaded (lowpass 300 → highpass 1.2k) + reverb.
synth(
  "browser-swish.wav",
  "anoisesrc=d=0.6:c=white:a=0.4,lowpass=f=300,volume='1-0.85*t/0.6':eval=frame[a];"
  + "anoisesrc=d=0.6:c=white:a=0.4,highpass=f=1200,lowpass=f=4000,volume='0.85*t/0.6':eval=frame[b];"
  + "[a][b]amix=inputs=2,aecho=0.8:0.7:180:0.45,afade=t=in:st=0:d=0.2,afade=t=out:st=0.38:d=0.22[out]",
);
normalize("browser-swish.wav", 0.55);

// link-click.wav (0.05s) — pleasant wood-block-ish click 880+1320Hz.
synth(
  "link-click.wav",
  "aevalsrc=exprs='(sin(2*PI*880*t)+0.5*sin(2*PI*1320*t))*min(t/0.004,1)*min((0.05-t)/0.03,1)':d=0.05:s=44100,aecho=0.7:0.6:90:0.4[out]",
);
normalize("link-click.wav", 0.5);

// scroll-swoosh.wav (0.5s) — soft page movement, lowpassed noise, downward feel.
synth(
  "scroll-swoosh.wav",
  "anoisesrc=d=0.5:c=white:a=0.4,lowpass=f=2500,volume='1-0.85*t/0.5':eval=frame[a];"
  + "anoisesrc=d=0.5:c=white:a=0.4,lowpass=f=400,volume='0.85*t/0.5':eval=frame[b];"
  + "[a][b]amix=inputs=2,aecho=0.8:0.7:160:0.45,afade=t=in:st=0:d=0.18,afade=t=out:st=0.3:d=0.2[out]",
);
normalize("scroll-swoosh.wav", 0.5);

// ---------- Scene 5 · SUBAGENTS ----------

// sparkle.wav (0.6s) — crystal-like 3-note rise 660/880/1320Hz, soft envelopes.
synth(
  "sparkle.wav",
  "aevalsrc=exprs='sin(2*PI*660*t)*min(t/0.06,1)*min((0.2-t)/0.1,1)':d=0.2:s=44100[a0];"
  + "aevalsrc=exprs='sin(2*PI*880*(t-0.2))*gt(t,0.2)*min((t-0.2)/0.06,1)*min((0.4-t)/0.1,1)':d=0.2:s=44100[a1];"
  + "aevalsrc=exprs='sin(2*PI*1320*(t-0.4))*gt(t,0.4)*min((t-0.4)/0.06,1)*min((0.6-t)/0.14,1)':d=0.2:s=44100[a2];"
  + "[a0][a1][a2]concat=n=3:v=0:a=1,aecho=0.8:0.7:200:0.45[out]",
);
normalize("sparkle.wav", 0.55);

// data-write.wav (0.04s) — soft pen-on-paper: 220Hz thump + bandpassed noise.
synth(
  "data-write.wav",
  "aevalsrc=exprs='sin(2*PI*220*t)*min(t/0.006,1)*min((0.04-t)/0.025,1)':d=0.04:s=44100[a];"
  + "anoisesrc=d=0.04:c=white:a=0.25,bandpass=f=1500:t=q:w=1.5[b];"
  + "[a][b]amix=inputs=2,aecho=0.7:0.6:80:0.35,afade=t=in:st=0:d=0.004[out]",
);
normalize("data-write.wav", 0.45);

// success-chime.wav (0.4s) — refined major chord 880+1320+1760Hz, reverb.
synth(
  "success-chime.wav",
  "aevalsrc=exprs='(sin(2*PI*880*t)+0.6*sin(2*PI*1320*t)+0.35*sin(2*PI*1760*t))*min(t/0.06,1)*min((0.4-t)/0.25,1)':d=0.4:s=44100,aecho=0.8:0.7:220:0.45[out]",
);
normalize("success-chime.wav", 0.55);

// ---------- Scene 6 · CAPABILITIES ----------

// count-tick.wav (0.008s) — whisper-quiet 1760Hz blip, just a hint of progress.
synth(
  "count-tick.wav",
  "aevalsrc=exprs='sin(2*PI*1760*t)*min(t/0.002,1)*min((0.008-t)/0.005,1)':d=0.008:s=44100,aecho=0.5:0.4:40:0.3[out]",
);
normalize("count-tick.wav", 0.25);

// card-chime.wav (0.3s) — full C-major triad 523+659+784Hz, warm chord.
synth(
  "card-chime.wav",
  "aevalsrc=exprs='(sin(2*PI*523*t)+0.7*sin(2*PI*659*t)+0.5*sin(2*PI*784*t))*min(t/0.05,1)*min((0.3-t)/0.18,1)':d=0.3:s=44100,aecho=0.8:0.7:200:0.45[out]",
);
normalize("card-chime.wav", 0.55);

// ---------- Scene 7 · CTA ----------

// final-chord.wav (1.5s) — warm full C-major 261+329+392+523Hz, slow close.
synth(
  "final-chord.wav",
  "aevalsrc=exprs='(sin(2*PI*261.63*t)+0.7*sin(2*PI*329.63*t)+0.6*sin(2*PI*392*t)+0.5*sin(2*PI*523.25*t))*min(t/0.35,1)*min((1.5-t)/0.6,1)':d=1.5:s=44100,aecho=0.85:0.75:300:0.5[out]",
);
normalize("final-chord.wav", 0.6);

// sub-swell.wav (2.0s) — felt-not-heard 50Hz swell, slow 2s fade.
synth(
  "sub-swell.wav",
  "aevalsrc=exprs='sin(2*PI*50*t)*min(t/1.0,1)*min((2-t)/1.0,1)':d=2.0:s=44100,aecho=0.8:0.7:250:0.4[out]",
);
normalize("sub-swell.wav", 0.7);

console.log("done →", OUT);
