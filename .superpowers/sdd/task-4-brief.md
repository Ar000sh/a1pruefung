### Task 4: `check-vocab.ts` heuristic vocabulary checker (TDD)

**Files:**
- Create: `scripts/check-vocab.ts`
- Test: `scripts/__tests__/check-vocab.test.ts`

**Interfaces:**
- Consumes: `WordlistEntry` type from `scripts/extract-wordlist.ts` (Task 2).
- Produces: `buildKnownWordSet(entries: WordlistEntry[]): Set<string>` and `findUnknownWords(text: string, known: Set<string>): string[]` — consumed by Task 11 (CLI run against the finished exam).

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/check-vocab.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert";
import { buildKnownWordSet, findUnknownWords } from "../check-vocab.ts";
import type { WordlistEntry } from "../extract-wordlist.ts";

const sampleWordlist: WordlistEntry[] = [
  { word: "danken", artikel: null, plural: null, wortart: "verb", beispiele: [] },
  { word: "Bahnhof", artikel: "der", plural: null, wortart: "nomen", beispiele: [] },
];

test("known words and stopwords are not flagged", () => {
  const known = buildKnownWordSet(sampleWordlist);
  const unknown = findUnknownWords("Ich bin am Bahnhof.", known);
  assert.deepStrictEqual(unknown, []);
});

test("flags a word that is neither in the wordlist nor a stopword", () => {
  const known = buildKnownWordSet(sampleWordlist);
  const unknown = findUnknownWords("Der Dinosaurier ist am Bahnhof.", known);
  assert.deepStrictEqual(unknown, ["dinosaurier"]);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/check-vocab.test.ts"`
Expected: FAIL — `Cannot find module '../check-vocab.ts'`

- [ ] **Step 3: Implement the checker**

Create `scripts/check-vocab.ts`:

```ts
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { WordlistEntry } from "./extract-wordlist.ts";

const STOPWORDS = new Set([
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines",
  "und", "oder", "aber", "nicht", "kein", "keine", "ist", "sind", "war", "waren", "bin", "bist",
  "sein", "hat", "haben", "hatte", "hatten", "wird", "werden", "wurde",
  "ich", "du", "er", "sie", "es", "wir", "ihr", "mich", "dich", "ihn", "uns", "euch",
  "mein", "meine", "dein", "deine", "ihre", "unser", "euer",
  "zu", "zum", "zur", "in", "im", "an", "am", "auf", "aus", "bei", "mit", "nach", "von", "vor",
  "für", "um", "durch", "ohne", "über", "unter",
]);

function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/^\(sich\)\s*/, "")
    .replace(/[-–].*/, "")
    .trim();
}

export function buildKnownWordSet(entries: WordlistEntry[]): Set<string> {
  const known = new Set<string>();
  for (const entry of entries) {
    known.add(normalize(entry.word));
  }
  return known;
}

export function findUnknownWords(text: string, known: Set<string>): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[.,!?;:„"()0-9]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const unknown: string[] = [];
  for (const token of tokens) {
    if (STOPWORDS.has(token)) continue;
    if (known.has(token)) continue;
    unknown.push(token);
  }
  return [...new Set(unknown)];
}

function main() {
  const wordlist: WordlistEntry[] = JSON.parse(readFileSync("data/wordlist/wordlist.json", "utf-8"));
  const examPath = process.argv[2] ?? "content/exams/uebungssatz-03/exam.json";
  const exam = JSON.parse(readFileSync(examPath, "utf-8"));
  const known = buildKnownWordSet(wordlist);
  const flatText = JSON.stringify(exam).replace(/["{}[\]:,]/g, " ");
  const unknown = findUnknownWords(flatText, known);
  console.log(`${unknown.length} unbekannte Wörter (zur manuellen Prüfung, keine Fehlergarantie):`);
  console.log(unknown.join(", "));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/check-vocab.test.ts"`
Expected: `pass 2`, `fail 0`

- [ ] **Step 5: Manual checkpoint**

No commit (no git repo configured).

---

