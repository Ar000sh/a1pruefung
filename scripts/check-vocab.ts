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
    .filter((token) => token.length > 1);

  const unknown: string[] = [];
  for (const token of tokens) {
    if (STOPWORDS.has(token)) continue;
    if (known.has(token)) continue;
    unknown.push(token);
  }
  return [...new Set(unknown)];
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStringValues(item));
  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }
  return [];
}

function main() {
  const wordlist: WordlistEntry[] = JSON.parse(readFileSync("data/wordlist/wordlist.json", "utf-8"));
  const examPath = process.argv[2] ?? "content/exams/uebungssatz-03/exam.json";
  const exam = JSON.parse(readFileSync(examPath, "utf-8"));
  const { id: _id, ...examContent } = exam;
  const known = buildKnownWordSet(wordlist);
  const flatText = collectStringValues(examContent).join(" ");
  const unknown = findUnknownWords(flatText, known);
  console.log(`${unknown.length} unbekannte Wörter (zur manuellen Prüfung, keine Fehlergarantie):`);
  console.log(unknown.join(", "));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
