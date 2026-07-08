import { test } from "node:test";
import assert from "node:assert";
import { renderExamMarkdown, renderLoesungenMarkdown } from "../render-exam.ts";
import type { Exam } from "../render-exam.ts";

const fixture: Exam = {
  id: "test-01",
  hoeren: {
    teil1: {
      beispiel: {
        nr: 0,
        dialog: [{ sprecher: "A", text: "Hallo." }],
        frage: "Wer spricht?",
        optionen: { a: "Anna", b: "Ben" },
        loesung: "a",
      },
      items: [],
    },
    teil2: { items: [] },
    teil3: { items: [] },
  },
  lesen: {
    teil1: { texte: [] },
    teil2: { items: [] },
    teil3: { items: [] },
  },
  schreiben: {
    teil1: {
      ausgangstext: "Das ist Frau Musterfrau.",
      formularfelder: [{ feld: "Name", loesung: "Musterfrau" }],
    },
    teil2: {
      situation: "Schreiben Sie eine Nachricht.",
      inhaltspunkte: ["Grund nennen"],
      musterloesung: "Liebe/r ...",
    },
  },
  sprechen: {
    teil1: { beschreibung: "Stellen Sie sich vor.", fragen: ["Wie heißen Sie?"] },
    teil2: { themen: [{ thema: "Wochenende", karten: ["Sport", "Kino"] }] },
    teil3: { bildkarten: [{ beschreibung: "Ein Fenster ist offen.", beispielbitte: "Kannst du das Fenster zumachen?" }] },
  },
};

test("renders candidate markdown with questions but no solutions section", () => {
  const md = renderExamMarkdown(fixture);
  assert.match(md, /Hallo\./);
  assert.match(md, /Wer spricht\?/);
  assert.ok(!md.includes("Lösungen"));
});

test("renders solutions markdown with the answer key", () => {
  const md = renderLoesungenMarkdown(fixture);
  assert.match(md, /0: a/);
  assert.match(md, /Name: Musterfrau/);
});
