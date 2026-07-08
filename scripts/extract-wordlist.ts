import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export interface WordlistEntry {
  word: string;
  artikel: string | null;
  plural: string | null;
  wortart: "nomen" | "verb" | null;
  beispiele: string[];
}

export interface ExtractWarning {
  line: string;
  reason: string;
}

const JUNK_LINE_PATTERNS = [/^VS_\d+/, /^Seite \d+$/, /^Inventare$/, /^[A-ZÄÖÜ]$/];

function isJunkLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true;
  return JUNK_LINE_PATTERNS.some((re) => re.test(trimmed));
}

const ARTICLE_PREFIX = /^(der\/die|der|die|das)\s+/;
const PLURAL_MARKER = /^([-–][^\s,]*(?:,\s*[^\s,]+)?)\s+/;
const VERB_SUFFIX = /^(sich\s+)?[a-zäöüß]+(en|eln|ern)$/;
const MISSING_ARTICLE_NOUN = /^[A-ZÄÖÜ][a-zäöüß]+,\s*[-–]/;

function endsWithSentencePunctuation(text: string): boolean {
  return /[.!?]["')]?$/.test(text.trim());
}

function splitWordAndRest(line: string): {
  word: string;
  artikel: string | null;
  plural: string | null;
  rest: string;
} {
  const articleMatch = line.match(ARTICLE_PREFIX);
  const artikel = articleMatch ? articleMatch[1] : null;
  let remainder = articleMatch ? line.slice(articleMatch[0].length) : line;

  const wordMatch = remainder.match(/^([A-ZÄÖÜa-zäöüß.()/-]+)/);
  const word = wordMatch ? wordMatch[1] : remainder.split(" ")[0];
  remainder = remainder.slice(word.length);

  let plural: string | null = null;
  const commaMatch = remainder.match(/^,\s*/);
  if (commaMatch) {
    const afterComma = remainder.slice(commaMatch[0].length);
    const pluralMatch = afterComma.match(PLURAL_MARKER);
    if (pluralMatch) {
      plural = pluralMatch[1];
      remainder = afterComma.slice(pluralMatch[0].length);
    } else {
      remainder = afterComma;
    }
  }

  return { word, artikel, plural, rest: remainder.trim() };
}

function guessWortart(word: string, artikel: string | null): "nomen" | "verb" | null {
  if (artikel) return "nomen";
  if (VERB_SUFFIX.test(word)) return "verb";
  return null;
}

export function parseWordlist(rawText: string): { entries: WordlistEntry[]; warnings: ExtractWarning[] } {
  const allLines = rawText.split(/\r?\n/);
  const startIdx = allLines.findIndex((l) => l.trim() === "A");
  const endIdx = allLines.findIndex((l) => l.trim() === "Literatur");
  const sectionLines = allLines
    .slice(startIdx === -1 ? 0 : startIdx, endIdx === -1 ? undefined : endIdx)
    .filter((l) => !isJunkLine(l));

  const entries: WordlistEntry[] = [];
  const warnings: ExtractWarning[] = [];
  let lastLineEndedSentence = true;

  for (const rawLine of sectionLines) {
    const line = rawLine.trim();
    if (line === "") continue;

    const firstChar = line[0];
    const isLowercaseStart = firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
    const missingArticleNoun = MISSING_ARTICLE_NOUN.test(line);

    if (isLowercaseStart || missingArticleNoun) {
      if (missingArticleNoun) {
        warnings.push({
          line,
          reason: "Großgeschriebenes Wort ohne Artikel erkannt – vermutlich fehlendes der/die/das, bitte gegen PDF prüfen.",
        });
      }
      const { word, artikel, plural, rest } = splitWordAndRest(line);
      entries.push({ word, artikel, plural, wortart: guessWortart(word, artikel), beispiele: rest ? [rest] : [] });
      lastLineEndedSentence = endsWithSentencePunctuation(rest);
      continue;
    }

    const current = entries[entries.length - 1];
    if (!current) {
      warnings.push({ line, reason: "Zeile vor dem ersten erkannten Eintrag – ignoriert." });
      continue;
    }
    if (lastLineEndedSentence || current.beispiele.length === 0) {
      current.beispiele.push(line);
    } else {
      const lastIdx = current.beispiele.length - 1;
      current.beispiele[lastIdx] = `${current.beispiele[lastIdx]} ${line}`;
    }
    lastLineEndedSentence = endsWithSentencePunctuation(line);
  }

  return { entries, warnings };
}

function main() {
  const raw = readFileSync("data/wordlist/raw/wortliste_raw.txt", "utf-8");
  const { entries, warnings } = parseWordlist(raw);
  writeFileSync("data/wordlist/wordlist.json", JSON.stringify(entries, null, 2), "utf-8");
  writeFileSync("data/wordlist/warnings.json", JSON.stringify(warnings, null, 2), "utf-8");
  console.log(`Parsed ${entries.length} entries, ${warnings.length} warnings.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
