### Task 5: `render-exam.ts` Markdown renderer (TDD)

**Files:**
- Create: `scripts/render-exam.ts`
- Test: `scripts/__tests__/render-exam.test.ts`

**Interfaces:**
- Produces: `Exam` type (full shape below), `renderExamMarkdown(exam: Exam): string`, `renderLoesungenMarkdown(exam: Exam): string` — consumed by Task 10 (CLI run against the finished `exam.json`). This same `Exam` shape is the one Tasks 6–9 must write into `content/exams/uebungssatz-03/exam.json`.

- [ ] **Step 1: Write the failing tests**

Create `scripts/__tests__/render-exam.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test "scripts/__tests__/render-exam.test.ts"`
Expected: FAIL — `Cannot find module '../render-exam.ts'`

- [ ] **Step 3: Implement the renderer**

Create `scripts/render-exam.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export interface Optionen {
  a: string;
  b: string;
  c?: string;
}

export interface HoerItem {
  nr: number;
  dialog?: { sprecher: string; text: string }[];
  durchsage?: string;
  nachricht?: string;
  frage?: string;
  aussage?: string;
  optionen?: Optionen;
  loesung: string;
  hoerdurchgaenge?: number;
}

export interface HoerTeil {
  beispiel?: HoerItem;
  items: HoerItem[];
}

export interface LesenAussage {
  nr: number;
  aussage: string;
  loesung: string;
}

export interface LesenText {
  titel: string;
  text: string;
  aussagen: LesenAussage[];
}

export interface LesenTeil2Item {
  nr: number;
  situation: string;
  anzeige_a: string;
  anzeige_b: string;
  loesung: string;
}

export interface LesenTeil3Item {
  nr: number;
  schild: string;
  aussage: string;
  loesung: string;
}

export interface Exam {
  id: string;
  hoeren: { teil1: HoerTeil; teil2: HoerTeil; teil3: HoerTeil };
  lesen: {
    teil1: { texte: LesenText[] };
    teil2: { items: LesenTeil2Item[] };
    teil3: { beispiel?: LesenTeil3Item; items: LesenTeil3Item[] };
  };
  schreiben: {
    teil1: { ausgangstext: string; formularfelder: { feld: string; loesung: string }[] };
    teil2: { situation: string; inhaltspunkte: string[]; musterloesung: string };
  };
  sprechen: {
    teil1: { beschreibung: string; fragen: string[] };
    teil2: { themen: { thema: string; karten: string[] }[] };
    teil3: { bildkarten: { beschreibung: string; beispielbitte: string }[] };
  };
}

function renderHoerItem(item: HoerItem): string {
  const lines: string[] = [];
  lines.push(`**Item ${item.nr}${item.hoerdurchgaenge ? ` (${item.hoerdurchgaenge}x hören)` : ""}**`);
  if (item.dialog) {
    for (const zeile of item.dialog) lines.push(`- ${zeile.sprecher}: ${zeile.text}`);
  }
  if (item.durchsage) lines.push(`Durchsage: ${item.durchsage}`);
  if (item.nachricht) lines.push(`Nachricht: ${item.nachricht}`);
  if (item.frage) lines.push(`\nFrage: ${item.frage}`);
  if (item.optionen) {
    lines.push(`a) ${item.optionen.a}`);
    lines.push(`b) ${item.optionen.b}`);
    if (item.optionen.c) lines.push(`c) ${item.optionen.c}`);
  }
  if (item.aussage) lines.push(`\nAussage: ${item.aussage}`);
  return lines.join("\n");
}

export function renderExamMarkdown(exam: Exam): string {
  const out: string[] = [`# Übungssatz ${exam.id}`, ""];

  out.push("## Hören", "", "### Teil 1", "");
  if (exam.hoeren.teil1.beispiel) out.push(renderHoerItem(exam.hoeren.teil1.beispiel), "");
  for (const item of exam.hoeren.teil1.items) out.push(renderHoerItem(item), "");

  out.push("### Teil 2", "");
  if (exam.hoeren.teil2.beispiel) out.push(renderHoerItem(exam.hoeren.teil2.beispiel), "");
  for (const item of exam.hoeren.teil2.items) out.push(renderHoerItem(item), "");

  out.push("### Teil 3", "");
  for (const item of exam.hoeren.teil3.items) out.push(renderHoerItem(item), "");

  out.push("## Lesen", "", "### Teil 1", "");
  for (const text of exam.lesen.teil1.texte) {
    out.push(`**${text.titel}**`, "", text.text, "");
    for (const a of text.aussagen) out.push(`${a.nr}. ${a.aussage}`);
    out.push("");
  }

  out.push("### Teil 2", "");
  for (const item of exam.lesen.teil2.items) {
    out.push(`**Item ${item.nr}**: ${item.situation}`, "", `a) ${item.anzeige_a}`, `b) ${item.anzeige_b}`, "");
  }

  out.push("### Teil 3", "");
  if (exam.lesen.teil3.beispiel) {
    const b = exam.lesen.teil3.beispiel;
    out.push(`**Beispiel 0**: ${b.schild}`, "", `Aussage: ${b.aussage}`, "");
  }
  for (const item of exam.lesen.teil3.items) {
    out.push(`**Item ${item.nr}**: ${item.schild}`, "", `Aussage: ${item.aussage}`, "");
  }

  out.push("## Schreiben", "", "### Teil 1", "", exam.schreiben.teil1.ausgangstext, "");
  for (const feld of exam.schreiben.teil1.formularfelder) out.push(`- ${feld.feld}: ______`);
  out.push("", "### Teil 2", "", exam.schreiben.teil2.situation, "");
  for (const punkt of exam.schreiben.teil2.inhaltspunkte) out.push(`- ${punkt}`);

  out.push("", "## Sprechen", "", "### Teil 1", "", exam.sprechen.teil1.beschreibung, "");
  for (const frage of exam.sprechen.teil1.fragen) out.push(`- ${frage}`);
  out.push("", "### Teil 2", "");
  for (const thema of exam.sprechen.teil2.themen) {
    out.push(`**${thema.thema}**: ${thema.karten.join(", ")}`, "");
  }
  out.push("### Teil 3", "");
  for (const karte of exam.sprechen.teil3.bildkarten) out.push(`- ${karte.beschreibung}`);

  return out.join("\n");
}

export function renderLoesungenMarkdown(exam: Exam): string {
  const out: string[] = [`# Lösungen – Übungssatz ${exam.id}`, "", "## Hören", ""];
  const hoerAll: HoerItem[] = [
    ...(exam.hoeren.teil1.beispiel ? [exam.hoeren.teil1.beispiel] : []),
    ...exam.hoeren.teil1.items,
    ...(exam.hoeren.teil2.beispiel ? [exam.hoeren.teil2.beispiel] : []),
    ...exam.hoeren.teil2.items,
    ...exam.hoeren.teil3.items,
  ];
  for (const item of hoerAll) out.push(`${item.nr}: ${item.loesung}`);

  out.push("", "## Lesen", "");
  for (const text of exam.lesen.teil1.texte) {
    for (const a of text.aussagen) out.push(`${a.nr}: ${a.loesung}`);
  }
  for (const item of exam.lesen.teil2.items) out.push(`${item.nr}: ${item.loesung}`);
  if (exam.lesen.teil3.beispiel) out.push(`0: ${exam.lesen.teil3.beispiel.loesung}`);
  for (const item of exam.lesen.teil3.items) out.push(`${item.nr}: ${item.loesung}`);

  out.push("", "## Schreiben", "", "### Teil 1");
  for (const feld of exam.schreiben.teil1.formularfelder) out.push(`- ${feld.feld}: ${feld.loesung}`);
  out.push("", "### Teil 2 (Musterlösung)", "", exam.schreiben.teil2.musterloesung);

  return out.join("\n");
}

function main() {
  const examPath = process.argv[2] ?? "content/exams/uebungssatz-03/exam.json";
  const exam: Exam = JSON.parse(readFileSync(examPath, "utf-8"));
  const dir = examPath.replace(/\/exam\.json$/, "");
  writeFileSync(`${dir}/exam.md`, renderExamMarkdown(exam), "utf-8");
  writeFileSync(`${dir}/loesungen.md`, renderLoesungenMarkdown(exam), "utf-8");
  console.log(`Rendered ${dir}/exam.md and ${dir}/loesungen.md`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test "scripts/__tests__/render-exam.test.ts"`
Expected: `pass 2`, `fail 0`

- [ ] **Step 5: Manual checkpoint**

No commit (no git repo configured).

---

