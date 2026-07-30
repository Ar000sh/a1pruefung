// Throwaway spike: render the same sample lines via Azure Speech HD (DragonHD)
// German voices, so we can A/B against Edge + ElevenLabs. Voice-only (no ffmpeg).
//
// Usage:
//   AZURE_SPEECH_KEY=xxxx AZURE_SPEECH_REGION=westeurope node scripts/audio/spike-azure.mjs
//
// German HD voices (native, expressive, LLM-based):
//   de-DE-Seraphina:DragonHDLatestNeural (female)
//   de-DE-Florian:DragonHDLatestNeural   (male)
// Note: DragonHD ignores <prosody> rate; it paces naturally. `temperature` (0..1)
// controls variation (lower = steadier). Output: scratch-audio/azure-*.mp3

import { writeFileSync, mkdirSync } from "node:fs";

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
if (!KEY || !REGION) {
  console.error("Missing env. Run: AZURE_SPEECH_KEY=xxxx AZURE_SPEECH_REGION=westeurope node scripts/audio/spike-azure.mjs");
  process.exit(1);
}

const OUT = "scratch-audio";
mkdirSync(OUT, { recursive: true });

const ENDPOINT = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const FEMALE = "de-DE-Seraphina:DragonHDLatestNeural";
const MALE = "de-DE-Florian:DragonHDLatestNeural";
const TEMPERATURE = process.env.TTS_TEMPERATURE ?? "0.7";

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ssml(voice, text) {
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='de-DE'>` +
    `<voice name='${voice}' parameters='temperature=${TEMPERATURE}'>${escapeXml(text)}</voice></speak>`;
}

async function tts(voice, text, out) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "a1-audio-spike",
    },
    body: ssml(voice, text),
  });
  if (!res.ok) throw new Error(`azure tts failed: ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`  wrote ${out} (${buf.length} bytes)`);
}

async function main() {
  console.log(`Endpoint: ${ENDPOINT}\nFemale: ${FEMALE}\nMale: ${MALE}\n`);
  await tts(MALE,   "Entschuldigung, was kostet dieser Pullover jetzt? Da steht 30 Prozent billiger.", `${OUT}/azure-male-shop.mp3`);
  await tts(FEMALE, "Einen Moment bitte. Neunzehn Euro fünfundneunzig.",                                `${OUT}/azure-female-shop.mp3`);
  await tts(FEMALE, "Liebe Fahrgäste, bitte hier nicht aussteigen. In wenigen Minuten erreichen wir den Bahnhof Bonn.", `${OUT}/azure-female-announce.mp3`);
  await tts(MALE,   "Guten Tag, hier ist Boris. Ich warte an der Information auf dich.",                `${OUT}/azure-male-phone.mp3`);
  console.log("\nDone. A/B these against scratch-audio/voice-*.mp3 (Edge) and eleven-*.mp3.");
}

main().catch((e) => { console.error(e); process.exit(1); });
