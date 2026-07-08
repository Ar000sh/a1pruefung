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
