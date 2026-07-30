// Throwaway spike: prove out "natural voices + subtle ffmpeg ambience".
// Not the real pipeline — just renders two sample items so we can LISTEN and
// decide voices + how subtle the background should be.
//
// Prereqs (one time):
//   python -m pip install edge-tts
//   winget install --id Gyan.FFmpeg -e     (or: choco install ffmpeg -y)
//
// Run:  node scripts/audio/spike.mjs
// Output: scratch-audio/spike-shop.mp3  and  scratch-audio/spike-phone.mp3

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const OUT = "scratch-audio";
mkdirSync(OUT, { recursive: true });

const RATE = process.env.TTS_RATE ?? "-12%"; // slower = more authentic A1 pace

function edge(text, voice, out) {
  const r = spawnSync("python", ["-m", "edge_tts", "--voice", voice, `--rate=${RATE}`, "--text", text, "--write-media", out], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`edge_tts failed for ${out} (is edge-tts installed? python -m pip install edge-tts)`);
}

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg failed (is ffmpeg on PATH? winget install --id Gyan.FFmpeg -e)");
}

const FMT = "aformat=sample_rates=44100:channel_layouts=mono";
const NORM = "loudnorm=I=-16:TP=-1.5:LRA=11";

// ---- Sample 1: Teil 1 shop dialogue, two natural voices, SUBTLE store ambience ----
console.log("Rendering shop dialogue voices…");
edge("Entschuldigung, was kostet dieser Pullover jetzt? Da steht 30 Prozent billiger.", "de-DE-ConradNeural", `${OUT}/s1a.mp3`);
edge("Einen Moment bitte … neunzehn Euro fünfundneunzig.", "de-DE-KatjaNeural", `${OUT}/s1b.mp3`);
edge("Neunzehn Euro fünfundneunzig? Gut, den nehme ich.", "de-DE-ConradNeural", `${OUT}/s1c.mp3`);

console.log("Mixing subtle store ambience…");
ffmpeg([
  "-i", `${OUT}/s1a.mp3`, "-i", `${OUT}/s1b.mp3`, "-i", `${OUT}/s1c.mp3`,
  "-f", "lavfi", "-i", "anoisesrc=color=brown:amplitude=0.08:d=30",
  "-filter_complex",
  `[0:a]${FMT}[a0];[1:a]${FMT}[a1];[2:a]${FMT}[a2];` +
  `[a0][a1][a2]concat=n=3:v=0:a=1[voice];` +
  `[3:a]lowpass=f=800,volume=0.14,${FMT}[bed];` +
  `[voice][bed]amix=inputs=2:duration=first:normalize=0,${NORM}[out]`,
  "-map", "[out]", "-y", `${OUT}/spike-shop.mp3`,
]);

// ---- Sample 2: Teil 3 answering-machine message, beep + phone-line quality ----
console.log("Rendering phone message voice…");
edge("Telefonansagedienst der Deutschen Telekom. Die Rufnummer des Teilnehmers hat sich geändert. Bitte rufen Sie die Telefon-Auskunft an unter elf acht drei drei.", "de-DE-ConradNeural", `${OUT}/s2.mp3`);

console.log("Mixing beep + phone-line effect…");
ffmpeg([
  "-i", `${OUT}/s2.mp3`,
  "-f", "lavfi", "-i", "sine=frequency=1000:duration=0.4",
  "-f", "lavfi", "-i", "anoisesrc=color=white:amplitude=0.02:d=30",
  "-filter_complex",
  `[1:a]${FMT}[beep];[0:a]highpass=f=300,lowpass=f=3400,${FMT}[phone];` +
  `[beep][phone]concat=n=2:v=0:a=1[voice];` +
  `[2:a]volume=0.10,${FMT}[hiss];` +
  `[voice][hiss]amix=inputs=2:duration=first:normalize=0,${NORM}[out]`,
  "-map", "[out]", "-y", `${OUT}/spike-phone.mp3`,
]);

console.log("\nDone. Listen to:");
console.log(`  ${OUT}/spike-shop.mp3   (2 voices + subtle store ambience)`);
console.log(`  ${OUT}/spike-phone.mp3  (answering machine: beep + phone line)`);
