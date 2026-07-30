# Natürliches Hören-Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the robotic browser-`speechSynthesis` Hören playback with pre-generated, natural multi-voice MP3s that carry subtle scene-matched ambience and play under real-exam rules (fixed number of repeats, no scrubbing/re-listening until the attempt is resolved).

**Architecture:** An offline content pipeline (Node orchestrator calling `edge-tts` + `ffmpeg` as subprocesses) renders one MP3 per Hören item into `public/audio/<examId>/`, mixes synthesized ambience per scene, and writes the file path into `audioUrl` on each item in `exam.json`. The app gains a `HoerPlayer` component that plays `audioUrl` the exam-correct number of times and then locks; items without `audioUrl` fall back to today's `TranscriptPlayer`, so rollout is incremental and never breaks.

**Tech Stack:** Node.js ≥ 22.6 (native `.ts`/`.mjs` execution, `node:test`), `edge-tts` (Python, free Microsoft neural voices), `ffmpeg` (ambience synthesis + mixing), Next.js 16 / React 19 app. Optional `google-genai` (Python) for the spike only.

## Global Constraints

- Node.js ≥ 22.6 for native execution and `node:test`; never add `ts-node`, `tsx`, `vitest`, or a bundler (verified locally: v24.9.0).
- All file reads/writes use explicit `"utf-8"` encoding.
- Audio pipeline tooling (`edge-tts`, `ffmpeg`) is required only for generation, never by the app. The app gains **zero** new npm dependencies — it plays MP3s with a plain `<audio>` element.
- `audioUrl` is written into `content/exams/<examId>/exam.json` (field already exists in `FutureMediaFields`); generation is idempotent (same paths/files on re-run).
- Ambience is synthesized entirely with ffmpeg (no external sound files). Speech stays dominant: ambience mixed ~18–24 dB below the voice so every word stays clear at A1.
- Repeat count per item comes from the existing `hoerdurchgaenge` field (Teil 1 & 3 = 2, Teil 2 = 1).
- Audio file naming: `public/audio/<examId>/hoeren-<teilKey>-<nr>.mp3`, where `teilKey` ∈ {`teil1`,`teil2`,`teil3`} and `nr` is the item number (Beispiel = `0`).
- The exams and their scene inventory live in `content/exams/{modellsatz,uebungssatz-01,uebungssatz-02,uebungssatz-03}/exam.json`.

---

### Task 1: Prerequisites + toolchain smoke test

**Files:**
- Create: `scripts/audio/README.md` (records the one-time setup + smoke-test commands)

**Interfaces:**
- Produces: a working `edge-tts` and `ffmpeg` on PATH, consumed by all later generation tasks.

- [ ] **Step 1: Install ffmpeg**

Run (PowerShell): `winget install --id Gyan.FFmpeg -e` (or `choco install ffmpeg -y`). Open a fresh shell afterward so PATH updates.

- [ ] **Step 2: Install edge-tts**

Run: `python -m pip install edge-tts`

- [ ] **Step 3: Verify both tools respond**

Run: `ffmpeg -version` → expect a version banner (line starts `ffmpeg version`).
Run: `python -m edge_tts --list-voices` → expect a list; confirm German voices exist:
`python -m edge_tts --list-voices | grep "de-DE"` → expect lines including `de-DE-KatjaNeural` and `de-DE-ConradNeural`.

- [ ] **Step 4: Smoke-test a spoken line + an ffmpeg filter**

Run:
```bash
mkdir -p scratch-audio
python -m edge_tts --voice de-DE-KatjaNeural --text "Guten Tag, dies ist ein Test." --write-media scratch-audio/smoke.mp3
ffmpeg -y -i scratch-audio/smoke.mp3 -af "highpass=f=300,lowpass=f=3400,loudnorm=I=-16:TP=-1.5:LRA=11" scratch-audio/smoke-phone.mp3
```
Expected: both files exist and are non-empty (`ls -la scratch-audio`). Listen to `smoke-phone.mp3` — it should sound like a natural voice through a phone line.

- [ ] **Step 5: Write `scripts/audio/README.md`**

Document the exact install + smoke commands above, plus: "The app never needs these tools; they are only for `npm run generate-audio`." Add `scratch-audio/` to `.gitignore`.

- [ ] **Step 6: Commit**

```bash
git add scripts/audio/README.md .gitignore
git commit -m "chore: document audio toolchain setup (edge-tts + ffmpeg)"
```

---

### Task 2: Shared Hören-audio helpers (TDD)

Pure functions used by BOTH the pipeline and the app: audio path building, default ambience per Teil, repeat count.

**Files:**
- Create: `lib/hoeren-audio.ts`
- Test: `scripts/__tests__/hoeren-audio.test.ts`

**Interfaces:**
- Consumes: `HoerItem` type from `lib/types.ts`.
- Produces:
  - `type TeilKey = "teil1" | "teil2" | "teil3"`
  - `audioUrlFor(examId: string, teil: TeilKey, nr: number): string` → `"/audio/<examId>/hoeren-<teil>-<nr>.mp3"`
  - `defaultAmbiente(teil: TeilKey): string`
  - `repeatCountFor(item: HoerItem): number` → `item.hoerdurchgaenge ?? 2`

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/hoeren-audio.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert";
import { audioUrlFor, defaultAmbiente, repeatCountFor } from "../../lib/hoeren-audio.ts";
import type { HoerItem } from "../../lib/types.ts";

test("audioUrlFor builds the canonical public path", () => {
  assert.strictEqual(audioUrlFor("modellsatz", "teil1", 1), "/audio/modellsatz/hoeren-teil1-1.mp3");
  assert.strictEqual(audioUrlFor("uebungssatz-02", "teil3", 15), "/audio/uebungssatz-02/hoeren-teil3-15.mp3");
});

test("defaultAmbiente maps Teil 2 to a PA announcement and Teil 3 to phone", () => {
  assert.strictEqual(defaultAmbiente("teil1"), "neutral");
  assert.strictEqual(defaultAmbiente("teil2"), "durchsage_allgemein");
  assert.strictEqual(defaultAmbiente("teil3"), "telefon");
});

test("repeatCountFor uses hoerdurchgaenge, defaulting to 2", () => {
  const base: HoerItem = { nr: 1, loesung: "a" };
  assert.strictEqual(repeatCountFor({ ...base, hoerdurchgaenge: 1 }), 1);
  assert.strictEqual(repeatCountFor({ ...base, hoerdurchgaenge: 2 }), 2);
  assert.strictEqual(repeatCountFor(base), 2);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/hoeren-audio.test.ts"`
Expected: FAIL — `Cannot find module '../../lib/hoeren-audio.ts'`.

- [ ] **Step 3: Implement the helpers**

Create `lib/hoeren-audio.ts`:
```ts
import type { HoerItem } from "./types.ts";

export type TeilKey = "teil1" | "teil2" | "teil3";

export function audioUrlFor(examId: string, teil: TeilKey, nr: number): string {
  return `/audio/${examId}/hoeren-${teil}-${nr}.mp3`;
}

export function defaultAmbiente(teil: TeilKey): string {
  if (teil === "teil2") return "durchsage_allgemein";
  if (teil === "teil3") return "telefon";
  return "neutral";
}

export function repeatCountFor(item: HoerItem): number {
  return item.hoerdurchgaenge ?? 2;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/hoeren-audio.test.ts"`
Expected: `pass 3`, `fail 0`.

- [ ] **Step 5: Add `ambiente` to the data model**

Edit `lib/types.ts` — add one optional field to `HoerItem` (after `hoerdurchgaenge?: number;`):
```ts
  ambiente?: string;
```

- [ ] **Step 6: Commit**

```bash
git add lib/hoeren-audio.ts scripts/__tests__/hoeren-audio.test.ts lib/types.ts
git commit -m "feat: add shared hoeren-audio helpers and ambiente field"
```

---

### Task 3: Ambience profile registry (TDD)

Maps an `ambiente` tag to the ffmpeg extra-inputs + filter fragments that turn a clean voice track into a scene. Pure/data — the actual sound is judged at a manual checkpoint in Task 7.

**Files:**
- Create: `scripts/audio/ambience-profiles.mjs`
- Test: `scripts/__tests__/ambience-profiles.test.ts`

**Interfaces:**
- Produces:
  - `KNOWN_AMBIENTE` — array of tag strings.
  - `ambienceProfile(tag)` → `{ id, lavfiInputs: string[], voiceFilter: string, bedFilter: string, mixWeights: string }`.
    `lavfiInputs` are extra ffmpeg `-f lavfi -i "..."` sources (bed noise, beep). `voiceFilter` is applied to the concatenated speech. `bedFilter` shapes the mixed bed. Unknown tags fall back to the `neutral` profile.

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/ambience-profiles.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert";
import { KNOWN_AMBIENTE, ambienceProfile } from "../audio/ambience-profiles.mjs";

test("every known tag resolves to a profile with a voice filter", () => {
  for (const tag of KNOWN_AMBIENTE) {
    const p = ambienceProfile(tag);
    assert.strictEqual(p.id, tag);
    assert.ok(typeof p.voiceFilter === "string" && p.voiceFilter.length > 0, `${tag} voiceFilter`);
    assert.ok(Array.isArray(p.lavfiInputs), `${tag} lavfiInputs`);
  }
});

test("telefon profile adds a beep input and band-limits the voice", () => {
  const p = ambienceProfile("telefon");
  assert.ok(p.lavfiInputs.some((i) => i.includes("sine")), "has beep");
  assert.match(p.voiceFilter, /highpass/);
  assert.match(p.voiceFilter, /lowpass/);
});

test("unknown tags fall back to neutral", () => {
  assert.strictEqual(ambienceProfile("does-not-exist").id, "neutral");
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/ambience-profiles.test.ts"`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the registry**

Create `scripts/audio/ambience-profiles.mjs`:
```js
// Each profile turns a clean concatenated voice track into a scene.
// lavfiInputs: extra `-f lavfi -i "<expr>"` sources appended after the voice input.
// voiceFilter: filter applied to the voice ([voice] label).
// bedFilter: filter applied to the summed ambience bed ([bed] label).
// mixWeights: amix weights "voiceWeight bedWeight" (voice dominant).

const NEUTRAL = {
  id: "neutral",
  lavfiInputs: ["anoisesrc=color=brown:amplitude=0.05:duration=60"],
  voiceFilter: "acompressor=threshold=-18dB:ratio=2:attack=20:release=250",
  bedFilter: "lowpass=f=600,volume=0.12",
  mixWeights: "1 0.12",
};

const PROFILES = {
  neutral: NEUTRAL,
  geschaeft: {
    id: "geschaeft",
    lavfiInputs: ["anoisesrc=color=brown:amplitude=0.08:duration=60"],
    voiceFilter: "acompressor=threshold=-18dB:ratio=2:attack=20:release=250",
    bedFilter: "lowpass=f=800,volume=0.16",
    mixWeights: "1 0.16",
  },
  restaurant: {
    id: "restaurant",
    lavfiInputs: ["anoisesrc=color=brown:amplitude=0.10:duration=60"],
    voiceFilter: "acompressor=threshold=-18dB:ratio=2:attack=20:release=250",
    bedFilter: "lowpass=f=1000,volume=0.18",
    mixWeights: "1 0.18",
  },
  buero: {
    id: "buero",
    lavfiInputs: ["anoisesrc=color=brown:amplitude=0.04:duration=60"],
    voiceFilter: "acompressor=threshold=-18dB:ratio=2:attack=20:release=250",
    bedFilter: "lowpass=f=500,volume=0.10",
    mixWeights: "1 0.10",
  },
  strasse: {
    id: "strasse",
    lavfiInputs: ["anoisesrc=color=pink:amplitude=0.09:duration=60"],
    voiceFilter: "acompressor=threshold=-18dB:ratio=2:attack=20:release=250",
    bedFilter: "lowpass=f=1200,volume=0.16",
    mixWeights: "1 0.16",
  },
  durchsage_allgemein: {
    id: "durchsage_allgemein",
    lavfiInputs: ["anoisesrc=color=pink:amplitude=0.05:duration=60"],
    voiceFilter: "highpass=f=350,lowpass=f=3600,aecho=0.8:0.88:120:0.35,acompressor=threshold=-16dB:ratio=3:attack=10:release=200",
    bedFilter: "lowpass=f=900,volume=0.12",
    mixWeights: "1 0.12",
  },
  durchsage_bahnhof: {
    id: "durchsage_bahnhof",
    lavfiInputs: ["anoisesrc=color=pink:amplitude=0.07:duration=60"],
    voiceFilter: "highpass=f=350,lowpass=f=3400,aecho=0.8:0.9:150:0.4,acompressor=threshold=-16dB:ratio=3:attack=10:release=200",
    bedFilter: "lowpass=f=1000,volume=0.15",
    mixWeights: "1 0.15",
  },
  durchsage_flughafen: {
    id: "durchsage_flughafen",
    lavfiInputs: ["anoisesrc=color=pink:amplitude=0.06:duration=60"],
    voiceFilter: "highpass=f=350,lowpass=f=3600,aecho=0.85:0.9:180:0.45,acompressor=threshold=-16dB:ratio=3:attack=10:release=200",
    bedFilter: "lowpass=f=1100,volume=0.14",
    mixWeights: "1 0.14",
  },
  telefon: {
    id: "telefon",
    // beep at start (0.4s tone) + faint line hiss
    lavfiInputs: [
      "sine=frequency=1000:duration=0.4",
      "anoisesrc=color=white:amplitude=0.015:duration=60",
    ],
    voiceFilter: "highpass=f=300,lowpass=f=3400,acompressor=threshold=-16dB:ratio=3:attack=10:release=200",
    bedFilter: "volume=0.10",
    mixWeights: "1 0.10",
  },
};

export const KNOWN_AMBIENTE = Object.keys(PROFILES);

export function ambienceProfile(tag) {
  return PROFILES[tag] ?? NEUTRAL;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/ambience-profiles.test.ts"`
Expected: `pass 3`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/audio/ambience-profiles.mjs scripts/__tests__/ambience-profiles.test.ts
git commit -m "feat: add ffmpeg ambience profile registry"
```

---

### Task 4: Voice assignment (TDD)

Assign a consistent German voice to each speaker in an item, gender-guessed from the `sprecher` label.

**Files:**
- Create: `scripts/audio/voice-map.mjs`
- Test: `scripts/__tests__/voice-map.test.ts`

**Interfaces:**
- Produces:
  - `VOICES` → `{ female: string[], male: string[] }` (the Edge voice pool).
  - `guessGender(sprecher: string)` → `"f" | "m"`.
  - `assignVoices(sprecherList: string[])` → `Map<string,string>` mapping each distinct speaker label to a voice, alternating within a gender, stable for a given input.

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/voice-map.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert";
import { guessGender, assignVoices, VOICES } from "../audio/voice-map.mjs";

test("guessGender reads common role labels", () => {
  assert.strictEqual(guessGender("Frau"), "f");
  assert.strictEqual(guessGender("Verkäuferin"), "f");
  assert.strictEqual(guessGender("Kundin"), "f");
  assert.strictEqual(guessGender("Herr"), "m");
  assert.strictEqual(guessGender("Kellner"), "m");
  assert.strictEqual(guessGender("Kunde"), "m");
});

test("assignVoices gives each distinct speaker one stable voice from the right gender", () => {
  const map = assignVoices(["Kellner", "Gast", "Kellner"]);
  assert.strictEqual(map.size, 2);
  assert.ok(VOICES.male.includes(map.get("Kellner")));
  // "Gast" is neutral -> falls to alternation; just assert it got a voice
  assert.ok([...VOICES.male, ...VOICES.female].includes(map.get("Gast")));
});

test("two same-gender speakers get different voices", () => {
  const map = assignVoices(["Frau", "Kollegin"]);
  assert.notStrictEqual(map.get("Frau"), map.get("Kollegin"));
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/voice-map.test.ts"`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement voice assignment**

Create `scripts/audio/voice-map.mjs`:
```js
export const VOICES = {
  female: ["de-DE-KatjaNeural", "de-DE-SeraphinaMultilingualNeural"],
  male: ["de-DE-ConradNeural", "de-DE-FlorianMultilingualNeural"],
};

const FEMALE_HINTS = [/frau/i, /dame/i, /kundin/i, /verkäuferin/i, /kellnerin/i, /kollegin/i, /passantin/i, /mama/i, /mutter/i, /in$/];
const MALE_HINTS = [/herr/i, /mann/i, /kunde$/i, /kellner$/i, /ober/i, /kollege$/i, /passant$/i, /vater/i, /papa/i];

const FEMALE_NAMES = ["maria", "laura", "anna", "nina", "sarah", "sabine", "julia", "clara", "eva", "karin", "renate", "hanna", "steffi", "luisa", "greta", "petra", "lisa", "carmen", "johanna", "irene", "yvonne"];

export function guessGender(sprecher) {
  const s = (sprecher ?? "").trim();
  const lower = s.toLowerCase();
  if (FEMALE_NAMES.includes(lower)) return "f";
  for (const re of MALE_HINTS) if (re.test(s)) return "m";
  for (const re of FEMALE_HINTS) if (re.test(s)) return "f";
  return "m"; // deterministic default; corrected at listen checkpoint if wrong
}

export function assignVoices(sprecherList) {
  const map = new Map();
  const counters = { f: 0, m: 0 };
  for (const raw of sprecherList) {
    const key = (raw ?? "").trim();
    if (map.has(key)) continue;
    const g = guessGender(key);
    const pool = g === "f" ? VOICES.female : VOICES.male;
    map.set(key, pool[counters[g] % pool.length]);
    counters[g] += 1;
  }
  return map;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/voice-map.test.ts"`
Expected: `pass 3`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/audio/voice-map.mjs scripts/__tests__/voice-map.test.ts
git commit -m "feat: add speaker-to-voice assignment"
```

---

### Task 5: edge-tts line renderer + command builder (TDD for the pure part)

**Files:**
- Create: `scripts/audio/tts-edge.mjs`
- Test: `scripts/__tests__/tts-edge.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `buildEdgeArgs({ text, voice, out })` → `string[]` (args for `python -m edge_tts`), pure/testable.
  - `renderLine({ text, voice, out })` → `Promise<void>` (spawns `python -m edge_tts`, writes `out`).

- [ ] **Step 1: Write the failing test**

Create `scripts/__tests__/tts-edge.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert";
import { buildEdgeArgs } from "../audio/tts-edge.mjs";

test("buildEdgeArgs passes voice, text and output through", () => {
  const args = buildEdgeArgs({ text: "Hallo Welt", voice: "de-DE-KatjaNeural", out: "x/y.mp3" });
  assert.deepStrictEqual(args, [
    "-m", "edge_tts",
    "--voice", "de-DE-KatjaNeural",
    "--text", "Hallo Welt",
    "--write-media", "x/y.mp3",
  ]);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node --test "scripts/__tests__/tts-edge.test.ts"`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the renderer**

Create `scripts/audio/tts-edge.mjs`:
```js
import { spawn } from "node:child_process";

export function buildEdgeArgs({ text, voice, out }) {
  return ["-m", "edge_tts", "--voice", voice, "--text", text, "--write-media", out];
}

export function renderLine({ text, voice, out }) {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", buildEdgeArgs({ text, voice, out }), { stdio: "inherit" });
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`edge_tts exited ${code}`))));
  });
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `node --test "scripts/__tests__/tts-edge.test.ts"`
Expected: `pass 1`, `fail 0`.

- [ ] **Step 5: Manual: render two real lines with different voices**

Run:
```bash
node -e "import('./scripts/audio/tts-edge.mjs').then(m=>Promise.all([m.renderLine({text:'Was kostet der Pullover?',voice:'de-DE-ConradNeural',out:'scratch-audio/l1.mp3'}),m.renderLine({text:'Neunzehn Euro fünfundneunzig.',voice:'de-DE-KatjaNeural',out:'scratch-audio/l2.mp3'})]))"
```
Expected: two mp3s exist; listen — clearly two different natural German voices.

- [ ] **Step 6: Commit**

```bash
git add scripts/audio/tts-edge.mjs scripts/__tests__/tts-edge.test.ts
git commit -m "feat: add edge-tts line renderer"
```

---

### Task 6: Item assembler — concat + ambience + normalize (TDD for the command builder)

Builds ONE ffmpeg invocation that concatenates the per-line mp3s (with a short gap and, for `telefon`, a leading beep), applies the ambience profile, mixes the bed under the voice, and loudness-normalizes to a single output mp3.

**Files:**
- Create: `scripts/audio/assemble.mjs`
- Test: `scripts/__tests__/assemble.test.ts`

**Interfaces:**
- Consumes: `ambienceProfile` from Task 3.
- Produces:
  - `buildAssembleArgs({ lineFiles, ambienteTag, out, gapSeconds })` → `string[]` (full `ffmpeg` argv after the `ffmpeg` binary), pure/testable.
  - `assembleItem({ lineFiles, ambienteTag, out, gapSeconds })` → `Promise<void>` (spawns ffmpeg).

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/assemble.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert";
import { buildAssembleArgs } from "../audio/assemble.mjs";

test("assemble includes every line file as an input", () => {
  const args = buildAssembleArgs({ lineFiles: ["a.mp3", "b.mp3"], ambienteTag: "neutral", out: "o.mp3", gapSeconds: 0.4 });
  assert.ok(args.includes("a.mp3"));
  assert.ok(args.includes("b.mp3"));
  assert.strictEqual(args.at(-1), "o.mp3");
  assert.ok(args.includes("-filter_complex"));
});

test("telefon assembly adds lavfi beep + hiss inputs and loudnorm", () => {
  const args = buildAssembleArgs({ lineFiles: ["a.mp3"], ambienteTag: "telefon", out: "o.mp3", gapSeconds: 0.4 });
  const joined = args.join(" ");
  assert.match(joined, /sine=frequency=1000/);
  assert.match(joined, /loudnorm/);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/assemble.test.ts"`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the assembler**

Create `scripts/audio/assemble.mjs`:
```js
import { spawn } from "node:child_process";
import { ambienceProfile } from "./ambience-profiles.mjs";

// Layout of ffmpeg inputs:
//   [0..N-1] the N line mp3s (real speech)
//   [N..]    the profile.lavfiInputs (bed noise, and for telefon: beep first)
// We concat the speech with silence gaps into [voice], shape it with voiceFilter,
// build a [bed] from the lavfi sources, then amix voice+bed and loudnorm.
export function buildAssembleArgs({ lineFiles, ambienteTag, out, gapSeconds = 0.4 }) {
  const profile = ambienceProfile(ambienteTag);
  const args = [];
  for (const f of lineFiles) args.push("-i", f);
  for (const lavfi of profile.lavfiInputs) args.push("-f", "lavfi", "-i", lavfi);

  const n = lineFiles.length;
  const bedStart = n; // index of first lavfi input

  // Concatenate speech lines with silent gaps between them.
  const parts = [];
  const gapLabels = [];
  for (let i = 0; i < n; i++) {
    parts.push(`[${i}:a]`);
    if (i < n - 1) {
      const gl = `g${i}`;
      // build a silence segment via aevalsrc through anullsrc trimmed to gapSeconds
      gapLabels.push(`aevalsrc=0:d=${gapSeconds}[${gl}]`);
      parts.push(`[${gl}]`);
    }
  }
  const concatInputs = parts.join("");
  const concatCount = n + (n - 1);

  // Bed: sum all lavfi bed sources (skip a leading beep for telefon which is prepended to voice instead).
  const isTelefon = ambienceTagIsTelefon(ambienteTag);
  const bedIdx = [];
  for (let k = 0; k < profile.lavfiInputs.length; k++) {
    const inputIndex = bedStart + k;
    if (isTelefon && k === 0) continue; // the sine beep is handled on the voice chain
    bedIdx.push(`[${inputIndex}:a]`);
  }

  const fc = [];
  // gaps
  for (const g of gapLabels) fc.push(g);
  // concat speech
  fc.push(`${concatInputs}concat=n=${concatCount}:v=0:a=1[speech]`);

  // telefon: prepend beep to speech
  if (isTelefon) {
    fc.push(`[${bedStart}:a]${""}atrim=0:0.4[beep]`);
    fc.push(`[beep][speech]concat=n=2:v=0:a=1[voiced]`);
  } else {
    fc.push(`[speech]anull[voiced]`);
  }
  fc.push(`[voiced]${profile.voiceFilter}[voice]`);

  // bed
  if (bedIdx.length > 0) {
    fc.push(`${bedIdx.join("")}amix=inputs=${bedIdx.length}:normalize=0,${profile.bedFilter}[bed]`);
    fc.push(`[voice][bed]amix=inputs=2:normalize=0:weights=${profile.mixWeights}:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[out]`);
  } else {
    fc.push(`[voice]loudnorm=I=-16:TP=-1.5:LRA=11[out]`);
  }

  args.push("-filter_complex", fc.join(";"), "-map", "[out]", "-y", out);
  return args;
}

function ambienceTagIsTelefon(tag) {
  return tag === "telefon";
}

export function assembleItem(opts) {
  const args = buildAssembleArgs(opts);
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/assemble.test.ts"`
Expected: `pass 2`, `fail 0`.

- [ ] **Step 5: Manual: assemble the two lines from Task 5 as a phone message**

Run:
```bash
node -e "import('./scripts/audio/assemble.mjs').then(m=>m.assembleItem({lineFiles:['scratch-audio/l1.mp3','scratch-audio/l2.mp3'],ambienteTag:'telefon',out:'scratch-audio/item-phone.mp3',gapSeconds:0.4}))"
```
Expected: `scratch-audio/item-phone.mp3` exists. Listen: a beep, then both voices through a phone-line EQ with faint hiss, speech clearly intelligible. If ffmpeg errors on the filtergraph, fix the `-filter_complex` string until it renders, keeping the same [out] contract.

- [ ] **Step 6: Commit**

```bash
git add scripts/audio/assemble.mjs scripts/__tests__/assemble.test.ts
git commit -m "feat: add ffmpeg item assembler with ambience mixing"
```

---

### Task 7: Pipeline orchestrator `generate-audio.mjs`

Reads an exam.json, renders every Hören item (Beispiel + scored) to an MP3, writes `audioUrl` back into the exam.json. Supports scoping to a single item for the spike.

**Files:**
- Create: `scripts/generate-audio.mjs`
- Modify: `package.json` (add `"generate-audio"` script)

**Interfaces:**
- Consumes: `renderLine` (Task 5), `assembleItem` (Task 6), `assignVoices` (Task 4), `audioUrlFor`/`defaultAmbiente` (Task 2).
- Produces: MP3s in `public/audio/<examId>/` and `audioUrl` fields in `content/exams/<examId>/exam.json`.
- CLI: `node scripts/generate-audio.mjs <examId> [--only <teilKey>-<nr>]`.

- [ ] **Step 1: Implement the orchestrator**

Create `scripts/generate-audio.mjs`:
```js
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { renderLine } from "./audio/tts-edge.mjs";
import { assembleItem } from "./audio/assemble.mjs";
import { assignVoices } from "./audio/voice-map.mjs";
import { audioUrlFor, defaultAmbiente } from "../lib/hoeren-audio.ts";

const TEILE = ["teil1", "teil2", "teil3"];

function itemsOf(hoeren, teil) {
  const t = hoeren[teil];
  const list = [];
  if (t.beispiel) list.push(t.beispiel);
  for (const it of t.items) list.push(it);
  return list;
}

function linesOf(item) {
  if (Array.isArray(item.dialog) && item.dialog.length) {
    return item.dialog.map((d) => ({ sprecher: d.sprecher, text: d.text }));
  }
  const single = item.durchsage ?? item.nachricht ?? item.frage ?? "";
  return [{ sprecher: "Ansage", text: single }];
}

async function generateItem(examId, teil, item, tmpDir) {
  const lines = linesOf(item);
  const voices = assignVoices(lines.map((l) => l.sprecher));
  const lineFiles = [];
  for (let i = 0; i < lines.length; i++) {
    const out = `${tmpDir}/line-${i}.mp3`;
    await renderLine({ text: lines[i].text, voice: voices.get(lines[i].sprecher), out });
    lineFiles.push(out);
  }
  const ambiente = item.ambiente ?? defaultAmbiente(teil);
  const outUrl = audioUrlFor(examId, teil, item.nr);
  const outPath = `public${outUrl}`;
  mkdirSync(outPath.slice(0, outPath.lastIndexOf("/")), { recursive: true });
  await assembleItem({ lineFiles, ambienteTag: ambiente, out: outPath, gapSeconds: 0.4 });
  item.audioUrl = outUrl;
  console.log(`  ${teil} nr ${item.nr} -> ${outUrl} (${ambiente})`);
}

async function main() {
  const examId = process.argv[2];
  if (!examId) throw new Error("usage: node scripts/generate-audio.mjs <examId> [--only teilN-nr]");
  const onlyIdx = process.argv.indexOf("--only");
  const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

  const examPath = `content/exams/${examId}/exam.json`;
  const exam = JSON.parse(readFileSync(examPath, "utf-8"));
  const tmpDir = `scratch-audio/${examId}`;
  mkdirSync(tmpDir, { recursive: true });

  for (const teil of TEILE) {
    for (const item of itemsOf(exam.hoeren, teil)) {
      if (only && only !== `${teil}-${item.nr}`) continue;
      await generateItem(examId, teil, item, tmpDir);
    }
  }

  writeFileSync(examPath, JSON.stringify(exam, null, 2) + "\n", "utf-8");
  rmSync(tmpDir, { recursive: true, force: true });
  console.log(`Done: ${examId}${only ? " (only " + only + ")" : ""}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 2: Add the npm script**

Edit `package.json` `scripts` — add:
```json
    "generate-audio": "node scripts/generate-audio.mjs",
```

- [ ] **Step 3: Dry-run a single item end to end**

Run: `node scripts/generate-audio.mjs modellsatz --only teil1-1`
Expected: prints `teil1 nr 1 -> /audio/modellsatz/hoeren-teil1-1.mp3 (neutral)` and `Done`. File `public/audio/modellsatz/hoeren-teil1-1.mp3` exists; `content/exams/modellsatz/exam.json` now has `"audioUrl": "/audio/modellsatz/hoeren-teil1-1.mp3"` on Teil 1 item 1. Listen: two natural voices, subtle room tone, speech clear.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-audio.mjs package.json content/exams/modellsatz/exam.json public/audio/modellsatz
git commit -m "feat: add hoeren audio generation pipeline (edge-tts)"
```

---

### Task 8: Gemini TTS branch for the spike (optional engine comparison)

Produces the SAME one item via Gemini so it can be A/B compared with the Edge output from Task 7.

**Files:**
- Create: `scripts/gemini_tts.py`
- Create: `scripts/audio/README.md` addition (Gemini setup note — append)

**Interfaces:**
- Produces: a raw voice wav from Gemini for a given item's text, consumed by the same `assembleItem` ffmpeg step for ambience parity.

- [ ] **Step 1: Install the Gemini SDK + set the key**

Run: `python -m pip install google-genai`
Set a free AI Studio key: `export GEMINI_API_KEY=...` (get it at aistudio.google.com → API keys).

- [ ] **Step 2: Implement the Gemini renderer**

Create `scripts/gemini_tts.py`:
```python
import os, sys, wave
from google import genai
from google.genai import types

def render(text: str, out_path: str, voice: str = "Kore"):
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    resp = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                )
            ),
        ),
    )
    data = resp.candidates[0].content.parts[0].inline_data.data
    with wave.open(out_path, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(24000)
        wf.writeframes(data)

if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
```

- [ ] **Step 3: Render the same item's combined text via Gemini**

Run:
```bash
python scripts/gemini_tts.py "Kunde: Entschuldigung, was kostet dieser Pullover jetzt? Verkäuferin: Einen Moment bitte, neunzehnfünfundneunzig. Kunde: 19,95 Euro? Verkäuferin: Ja, Euro natürlich." scratch-audio/gemini-item.wav
ffmpeg -y -i scratch-audio/gemini-item.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" scratch-audio/gemini-item.mp3
```
Expected: `scratch-audio/gemini-item.mp3` exists (Gemini renders the multi-speaker text in one call).

- [ ] **Step 4: Commit**

```bash
git add scripts/gemini_tts.py scripts/audio/README.md
git commit -m "feat: add optional gemini tts branch for engine comparison"
```

---

### Task 9: Phase 0 spike — compare engines, pick one

**Files:** none (decision task; produces two mp3s already in `scratch-audio/`).

- [ ] **Step 1: Line up both renders of Modellsatz Teil 1 Nr 1**

Edge output: `public/audio/modellsatz/hoeren-teil1-1.mp3` (Task 7 Step 3).
Gemini output: `scratch-audio/gemini-item.mp3` (Task 8 Step 3).

- [ ] **Step 2: Listen and decide**

Judge: voice naturalness, distinct-speaker clarity, German pronunciation, and how the subtle ambience sits under each. Pick the engine for Phase 1. Record the decision in `scripts/audio/README.md` ("Engine chosen: … because …").

- [ ] **Step 3: If Gemini wins, wire it into the pipeline**

If Edge wins: no change (Task 7 already uses it). If Gemini wins: in `scripts/generate-audio.mjs`, replace the per-line `renderLine` loop with a single `python scripts/gemini_tts.py` call over the joined `"Sprecher: text"` transcript, then feed that one wav as the sole `lineFiles` entry into `assembleItem` (ambience step is unchanged). Keep Edge as fallback for any voice Gemini can't do.

- [ ] **Step 4: Commit (only if pipeline changed)**

```bash
git add scripts/generate-audio.mjs scripts/audio/README.md
git commit -m "chore: record TTS engine decision and wire chosen engine"
```

---

### Task 10: Annotate `ambiente` scene tags across all four exams

Set the scene tag on each Hören item so ambience matches the situation (defaults only cover Teil 2/3 generically). The scenes are known from each item's content.

**Files:**
- Modify: `content/exams/modellsatz/exam.json`
- Modify: `content/exams/uebungssatz-01/exam.json`
- Modify: `content/exams/uebungssatz-02/exam.json`
- Modify: `content/exams/uebungssatz-03/exam.json`

**Interfaces:**
- Consumes: the `ambiente` field (Task 2) and `KNOWN_AMBIENTE` tags (Task 3).

- [ ] **Step 1: Add `ambiente` to each Teil 1 item (dialog scenes)**

For every Teil 1 item (incl. Beispiel) in all four exams, add an `"ambiente"` key using ONLY these tags: `neutral`, `geschaeft`, `restaurant`, `buero`, `strasse`. Choose per scene, e.g. Modellsatz Teil 1: Nr 1 (Pullover kaufen) → `geschaeft`; Nr 2 (Uhrzeit auf der Straße) → `strasse`; Nr 3 (Restaurant) → `restaurant`; Nr 4 (Kollegen im Büro) → `buero`; Nr 5 (im Kaufhaus) → `geschaeft`; Nr 6 (Kollegen) → `buero`; Beispiel (Betriebsrat/Büro) → `buero`. Apply the same judgement to the other three exams' Teil 1 items.

- [ ] **Step 2: Set Teil 2 announcement scenes**

For each Teil 2 item, set `ambiente` to `durchsage_bahnhof` (train/platform), `durchsage_flughafen` (flight/airport), or `durchsage_allgemein` (store/bus/other PA) based on the durchsage content. Example (Modellsatz): Beispiel (Ankunftshalle/airport) → `durchsage_flughafen`; Nr 7 (Weihnachten, Stockwerk) → `durchsage_allgemein`; Nr 8 (Raststätte/Bus) → `durchsage_allgemein`; Nr 9 (Bahnhof Bonn) → `durchsage_bahnhof`; Nr 10 (Flug Warschau) → `durchsage_flughafen`.

- [ ] **Step 3: Leave Teil 3 as telefon (default) — no change needed**

Teil 3 items default to `telefon`; only add an explicit `ambiente` if a message is clearly not a phone recording (rare — leave as default otherwise).

- [ ] **Step 4: Validate all four JSONs still parse**

Run: `for e in modellsatz uebungssatz-01 uebungssatz-02 uebungssatz-03; do node -e "JSON.parse(require('fs').readFileSync('content/exams/'+process.argv[1]+'/exam.json','utf-8'));console.log(process.argv[1],'ok')" $e; done`
Expected: four `ok` lines.

- [ ] **Step 5: Commit**

```bash
git add content/exams/*/exam.json
git commit -m "content: annotate hoeren ambiente scene tags"
```

---

### Task 11: `HoerPlayer` component — exam-locked playback

**Files:**
- Create: `components/exam/HoerPlayer.tsx`

**Interfaces:**
- Consumes: `repeatCountFor` from `lib/hoeren-audio.ts` (Task 2), `HoerItem`/`DialogLine` from `lib/types.ts`, existing `TranscriptPlayer` (fallback).
- Produces: `HoerPlayer({ item, lines, label, revealed }: { item: HoerItem; lines: DialogLine[]; label: string; revealed: boolean })` — a client component.

- [ ] **Step 1: Implement the component**

Create `components/exam/HoerPlayer.tsx`:
```tsx
"use client";

import { useRef, useState } from "react";
import type { DialogLine, HoerItem } from "../../lib/types";
import { repeatCountFor } from "../../lib/hoeren-audio";
import { TranscriptPlayer } from "./TranscriptPlayer";

const GAP_MS = 2500;

export function HoerPlayer({ item, lines, label, revealed }: { item: HoerItem; lines: DialogLine[]; label: string; revealed: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playsLeft = useRef(0);
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");

  if (!item.audioUrl) {
    // graceful fallback: no generated audio yet
    return <TranscriptPlayer lines={lines} label={label} />;
  }

  function playOnce() {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play();
  }

  function start() {
    if (state === "playing") return;
    if (state === "done" && !revealed) return; // locked until resolved
    playsLeft.current = revealed ? 1 : repeatCountFor(item);
    setState("playing");
    playsLeft.current -= 1;
    playOnce();
  }

  function onEnded() {
    if (playsLeft.current > 0) {
      playsLeft.current -= 1;
      window.setTimeout(playOnce, GAP_MS);
    } else {
      setState("done");
    }
  }

  const locked = state === "done" && !revealed;
  const buttonLabel = state === "playing" ? "Wird abgespielt…" : locked ? "Gehört ✓" : revealed ? "Nochmal hören" : "Abspielen";

  return (
    <div className="hoer-player">
      <audio ref={audioRef} src={item.audioUrl} preload="auto" onEnded={onEnded} />
      <button type="button" className="small-button" onClick={start} disabled={state === "playing" || locked} aria-label={label}>
        {buttonLabel}
      </button>
      {!revealed ? <span className="muted"> {item.hoerdurchgaenge === 1 ? "1× hören" : "2× hören"}</span> : null}
      {revealed ? (
        <div className="transcript-reveal">
          {lines.map((line, i) => (
            <p key={`${line.sprecher}-${i}`}><strong>{line.sprecher}:</strong> {line.text}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck the component**

Run: `npx tsc --noEmit`
Expected: no errors (the app already type-checks; the new file must not introduce any).

- [ ] **Step 3: Commit**

```bash
git add components/exam/HoerPlayer.tsx
git commit -m "feat: add exam-locked HoerPlayer component"
```

---

### Task 12: Wire `HoerPlayer` into `ExamApp`

**Files:**
- Modify: `components/exam/ExamApp.tsx` (import at line 8; usage at line 387 inside `HoerItemCard`)

**Interfaces:**
- Consumes: `HoerPlayer` (Task 11). `HoerItemCard` already receives `item`, `grade`, `showAnswers`. "Resolved" = `grade !== null`.

- [ ] **Step 1: Replace the transcript player usage**

In `components/exam/ExamApp.tsx`, change the import line 8 from:
```tsx
import { TranscriptPlayer } from "./TranscriptPlayer";
```
to:
```tsx
import { HoerPlayer } from "./HoerPlayer";
```

Then in `HoerItemCard` replace line 387:
```tsx
      <TranscriptPlayer lines={transcript} label={`Transkript Aufgabe ${props.item.nr}`} />
```
with:
```tsx
      <HoerPlayer item={props.item} lines={transcript} label={`Audio Aufgabe ${props.item.nr}`} revealed={props.grade !== null} />
```

(Leave the existing `Hördurchgänge:` line and everything else in `HoerItemCard` unchanged. `TranscriptPlayer` stays in the repo — `HoerPlayer` falls back to it internally.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the running app**

Run: `npm run dev`, open the app, go to Hören. For a Teil 1 item that already has audio (Modellsatz Nr 1 from Task 7): press **Abspielen** → it plays twice with a gap, then shows **Gehört ✓** and is disabled; there is no seek bar or pause. Resolve the attempt → the transcript appears and **Nochmal hören** works with no limit. For an item WITHOUT audio yet, the old transcript player still shows. Use the `verify` skill to drive this end-to-end.

- [ ] **Step 4: Commit**

```bash
git add components/exam/ExamApp.tsx
git commit -m "feat: use HoerPlayer for exam-realistic hoeren playback"
```

---

### Task 13: Phase 1 — generate all of Modellsatz + end-to-end check

**Files:**
- Modify: `content/exams/modellsatz/exam.json` (audioUrl on all items)
- Create: `public/audio/modellsatz/*.mp3` (15 scored + Beispiele)

- [ ] **Step 1: Generate every Modellsatz Hören item**

Run: `npm run generate-audio modellsatz`
Expected: prints one line per item across teil1/teil2/teil3 (incl. Beispiele) and `Done: modellsatz`. All mp3s exist in `public/audio/modellsatz/`.

- [ ] **Step 2: Spot-listen one item per Teil and per ambience family**

Listen to: a Teil 1 restaurant item (Nr 3), a Teil 2 `durchsage_bahnhof` (Nr 9), a Teil 3 `telefon` (Nr 11). Confirm: correct voices, scene-appropriate subtle ambience, speech clearly intelligible, no clipping. If any ambience is too loud, lower that profile's `volume=`/`mixWeights` in `ambience-profiles.mjs` and re-run `--only <teil>-<nr>` for the affected item.

- [ ] **Step 3: Full app pass on Modellsatz**

Run `npm run dev`; play through all three Hören Teile: every item plays its exam-correct count (Teil 2 once, Teil 1 & 3 twice), locks after, no scrubbing; resolving reveals transcripts. Confirm `gradeExam` still scores 35/35 with correct answers (unchanged behavior).

- [ ] **Step 4: Commit**

```bash
git add content/exams/modellsatz/exam.json public/audio/modellsatz
git commit -m "content: generate natural hoeren audio for modellsatz"
```

---

### Task 14: Phase 2 — generate the remaining three exams

**Files:**
- Modify: `content/exams/uebungssatz-01/exam.json`, `content/exams/uebungssatz-02/exam.json`, `content/exams/uebungssatz-03/exam.json`
- Create: `public/audio/uebungssatz-01/*.mp3`, `public/audio/uebungssatz-02/*.mp3`, `public/audio/uebungssatz-03/*.mp3`

- [ ] **Step 1: Generate each remaining exam**

Run:
```bash
npm run generate-audio uebungssatz-01
npm run generate-audio uebungssatz-02
npm run generate-audio uebungssatz-03
```
Expected: `Done:` for each; mp3s present under each `public/audio/<id>/`.

- [ ] **Step 2: Spot-listen one item from each exam**

Confirm voices/ambience/intelligibility per exam (one Teil 2 and one Teil 3 each). Adjust profiles + regenerate the affected `--only` item if needed.

- [ ] **Step 3: Regression pass**

Run `npm run dev`; for each of the three exams (temporarily point `app/page.tsx`'s `getExamById("uebungssatz-03")` at each id, or just verify uebungssatz-03 which the app already loads) confirm playback rules and transcript reveal. Run the full test suite: `npm test` → all `node:test` suites pass.

- [ ] **Step 4: Commit**

```bash
git add content/exams/uebungssatz-0*/exam.json public/audio/uebungssatz-0*
git commit -m "content: generate natural hoeren audio for uebungssaetze 01-03"
```

---

## Self-Review notes

- **Spec coverage:** natural TTS (Tasks 5, 8, 9), pre-generated files (Task 7), scene-matched subtle ambience via ffmpeg (Tasks 3, 6, 10), exam-locked 2×/1× playback with no re-listen until resolved (Tasks 2, 11, 12), fallback to TranscriptPlayer (Task 11), phased scope spike→modellsatz→rest (Tasks 9, 13, 14), `audioUrl` in exam.json + `ambiente` field (Tasks 2, 7, 10), prerequisites (Task 1). All spec sections map to a task.
- **Type consistency:** `TeilKey`, `audioUrlFor`, `defaultAmbiente`, `repeatCountFor`, `ambienceProfile`, `assignVoices`, `buildEdgeArgs`, `buildAssembleArgs`, `HoerPlayer(props)` names are used identically across producing and consuming tasks.
- **Known risk to watch during execution:** the `-filter_complex` string in Task 6 is the fragile part — Step 5 there is an explicit render checkpoint; if ffmpeg rejects a fragment, fix the filtergraph while preserving the `[out]` label contract before moving on.
```
