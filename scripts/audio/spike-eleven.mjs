// Throwaway spike: render the same sample lines via ElevenLabs so we can A/B
// against the Edge voices. Voice-only (no ffmpeg) — mirrors scratch-audio/voice-*.mp3.
//
// Usage:  ELEVENLABS_API_KEY=xxxx node scripts/audio/spike-eleven.mjs
// Output: scratch-audio/eleven-*.mp3
//
// Uses eleven_multilingual_v2 (reliable German). Picks one female + one male
// voice from your account's available voices.

import { writeFileSync, mkdirSync } from "node:fs";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Missing ELEVENLABS_API_KEY. Run: ELEVENLABS_API_KEY=xxxx node scripts/audio/spike-eleven.mjs");
  process.exit(1);
}

const OUT = "scratch-audio";
mkdirSync(OUT, { recursive: true });

const API = "https://api.elevenlabs.io/v1";
const MODEL = "eleven_multilingual_v2";

// Built-in premade voices (fixed IDs) so we don't need the voices_read permission.
const FEMALE = { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (female)" };
const MALE = { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (male)" };

async function tts(voiceId, text, out) {
  const res = await fetch(`${API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: Number(process.env.TTS_SPEED ?? 0.9) },
    }),
  });
  if (!res.ok) throw new Error(`tts failed: ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`  wrote ${out} (${buf.length} bytes)`);
}

async function main() {
  const female = FEMALE;
  const male = MALE;
  console.log(`Female voice: ${female.name}  |  Male voice: ${male.name}`);

  await tts(male.id,   "Entschuldigung, was kostet dieser Pullover jetzt? Da steht 30 Prozent billiger.", `${OUT}/eleven-male-shop.mp3`);
  await tts(female.id, "Einen Moment bitte. Neunzehn Euro fünfundneunzig.",                                `${OUT}/eleven-female-shop.mp3`);
  await tts(female.id, "Liebe Fahrgäste, bitte hier nicht aussteigen. In wenigen Minuten erreichen wir den Bahnhof Bonn.", `${OUT}/eleven-female-announce.mp3`);
  await tts(male.id,   "Guten Tag, hier ist Boris. Ich warte an der Information auf dich.",                `${OUT}/eleven-male-phone.mp3`);

  console.log("\nDone. A/B these against scratch-audio/voice-*.mp3");
}

main().catch((e) => { console.error(e); process.exit(1); });
