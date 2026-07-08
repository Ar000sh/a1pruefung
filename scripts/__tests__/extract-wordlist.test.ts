import { test } from "node:test";
import assert from "node:assert";
import { parseWordlist } from "../extract-wordlist.ts";

test("parses a simple noun entry with a plural marker", () => {
  const raw = [
    "A",
    "der Aufzug, -ü, e In diesem Haus gibt es keinen Aufzug.",
    "das Auge, -n Er hat blaue Augen.",
    "Literatur",
  ].join("\n");
  const { entries } = parseWordlist(raw);
  assert.strictEqual(entries.length, 2);
  assert.deepStrictEqual(entries[0], {
    word: "Aufzug",
    artikel: "der",
    plural: "-ü, e",
    wortart: "nomen",
    beispiele: ["In diesem Haus gibt es keinen Aufzug."],
  });
});

test("filters page-break junk lines", () => {
  const raw = [
    "A",
    "VS_02_280312",
    "Seite 11",
    "Inventare",
    "B",
    "bald Ich komme bald.",
    "Literatur",
  ].join("\n");
  const { entries } = parseWordlist(raw);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].word, "bald");
});

test("keeps danken, der Dank and danke as separate flat entries", () => {
  const raw = [
    "A",
    "danken Ich danke Ihnen für die Einladung.",
    "der Dank Vielen Dank!",
    "Herzlichen Dank!",
    "danke Soll ich Ihnen helfen? - Nein, danke!",
    "Literatur",
  ].join("\n");
  const { entries } = parseWordlist(raw);
  assert.strictEqual(entries.length, 3);
  assert.strictEqual(entries[0].word, "danken");
  assert.deepStrictEqual(entries[1].beispiele, ["Vielen Dank!", "Herzlichen Dank!"]);
  assert.strictEqual(entries[2].word, "danke");
});

test("keeps two independent example sentences as separate array items", () => {
  const raw = [
    "A",
    "die Bahn Wir fahren lieber mit der Bahn.",
    "Ich nehme die nächste Bahn.",
    "Literatur",
  ].join("\n");
  const { entries } = parseWordlist(raw);
  assert.strictEqual(entries.length, 1);
  assert.deepStrictEqual(entries[0].beispiele, [
    "Wir fahren lieber mit der Bahn.",
    "Ich nehme die nächste Bahn.",
  ]);
});

test("joins a line-wrapped example that has no terminating punctuation yet", () => {
  const raw = [
    "A",
    "das Beispiel, -e Kannst du mir ein Beispiel sagen?",
    "zum Beispiel/z. B. Viele meiner Verwandten, z. B. meine beiden",
    "Brüder, arbeiten auch hier.",
    "Literatur",
  ].join("\n");
  const { entries } = parseWordlist(raw);
  assert.strictEqual(entries.length, 2);
  assert.deepStrictEqual(entries[1].beispiele, [
    "Beispiel/z. B. Viele meiner Verwandten, z. B. meine beiden Brüder, arbeiten auch hier.",
  ]);
});

test("flags a capitalized noun line missing its article as a warning", () => {
  const raw = [
    "A",
    "das Salz Herr Ober, kann ich bitte Salz haben?",
    "Satz, -ä, e Dieser Satz ist sehr einfach.",
    "die S-Bahn Ich nehme lieber die S-Bahn.",
    "Literatur",
  ].join("\n");
  const { entries, warnings } = parseWordlist(raw);
  assert.strictEqual(entries.length, 3);
  assert.strictEqual(entries[1].word, "Satz");
  assert.strictEqual(entries[1].artikel, null);
  assert.strictEqual(warnings.length, 1);
});
