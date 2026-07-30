# Per-Section Grading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of Hören, Lesen, Schreiben and Sprechen its own validation button, replacing the single global "Auswerten" that grades and locks the whole attempt at once.

**Architecture:** Two global booleans (`resolved`, `showAnswers`) become per-section flag maps. A new pure `gradeSections` filters the existing, already-tested `gradeExam` output down to the sections the learner has graded, so no scoring logic is rewritten. The card components stop inferring "locked" from `grade !== null` and take an explicit `locked` prop. A new `SectionActions` component owns the end-of-section state machine.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `node:test` + `node:assert` for tests.

## Global Constraints

- All UI strings in German. Existing vocabulary is fixed: `Auswerten`, `Lösungen zeigen`, `Neu starten`, `Richtige Antwort:`, `Musterlösung:`.
- Sprechen's button reads **`Beispiele zeigen`**, never "Auswerten" — it scores nothing.
- A section's grade button is enabled only when that section is complete.
- Grading a section locks that section's inputs and nothing else. Sprechen is never locked.
- Tests run with `npm test`; typecheck with `npx tsc --noEmit`. Both must pass before every commit.
- The five existing `gradeExam` tests must keep passing untouched — that is the signal the scoring logic was not disturbed.
- Imports of local modules use explicit `.ts` extensions (existing convention in `lib/` and `scripts/__tests__/`).

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/types.ts` | add `SectionFlags` type |
| `lib/exam-flow.ts` | add `sectionObjectiveKeys`, `isSectionComplete`; remove now-dead `isAttemptComplete` |
| `lib/grading.ts` | add `gradeSections`, `sectionScore`, `SectionScore` |
| `components/exam/SectionActions.tsx` | **new** — end-of-section state machine (hint / grade / result / reveal / reset) |
| `components/exam/ExamApp.tsx` | per-section state, explicit `locked` props, drop fixed bar, gate summary |
| `scripts/__tests__/section-grading.test.ts` | **new** — tests for the four pure functions |
| `scripts/__tests__/exam-data.test.ts` | drop the `isAttemptComplete` test |

---

### Task 1: Section key selection and completeness

**Files:**
- Modify: `lib/types.ts` (append `SectionFlags`)
- Modify: `lib/exam-flow.ts:30-34` (replace `isAttemptComplete`)
- Test: `scripts/__tests__/section-grading.test.ts` (create)

**Interfaces:**
- Consumes: `requiredObjectiveKeys(exam)`, `objectiveKey(section, part, nr)` — both already exported.
- Produces:
  - `type SectionFlags = Record<ExamSectionId, boolean>`
  - `sectionObjectiveKeys(exam: Exam, section: ExamSectionId): string[]`
  - `isSectionComplete(exam: Exam, answers: AttemptAnswers, section: ExamSectionId): boolean`

- [ ] **Step 1: Write the failing test**

Create `scripts/__tests__/section-grading.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert";
import { getExamById } from "../../lib/exams.ts";
import { requiredObjectiveKeys, sectionObjectiveKeys, isSectionComplete } from "../../lib/exam-flow.ts";
import type { AttemptAnswers } from "../../lib/types.ts";

const exam = getExamById("modellsatz");

function emptyAnswers(): AttemptAnswers {
  return { objective: {}, schreibenTeil2: "", sprechenNotes: "", sprechenPracticed: false };
}

function answerAll(keys: string[], answers: AttemptAnswers): AttemptAnswers {
  const objective = { ...answers.objective };
  for (const key of keys) objective[key] = "richtig";
  return { ...answers, objective };
}

test("sectionObjectiveKeys returns only that section's keys", () => {
  const hoeren = sectionObjectiveKeys(exam, "hoeren");

  assert.ok(hoeren.length > 0);
  assert.ok(hoeren.every((key) => key.startsWith("hoeren.")));
  assert.strictEqual(sectionObjectiveKeys(exam, "sprechen").length, 0);
});

test("the four sections partition requiredObjectiveKeys", () => {
  const union = [
    ...sectionObjectiveKeys(exam, "hoeren"),
    ...sectionObjectiveKeys(exam, "lesen"),
    ...sectionObjectiveKeys(exam, "schreiben"),
    ...sectionObjectiveKeys(exam, "sprechen"),
  ];

  assert.deepStrictEqual([...union].sort(), [...requiredObjectiveKeys(exam)].sort());
});

test("isSectionComplete needs every answer in that section", () => {
  const answers = emptyAnswers();
  assert.strictEqual(isSectionComplete(exam, answers, "hoeren"), false);

  const keys = sectionObjectiveKeys(exam, "hoeren");
  const allButOne = answerAll(keys.slice(0, -1), answers);
  assert.strictEqual(isSectionComplete(exam, allButOne, "hoeren"), false);

  assert.strictEqual(isSectionComplete(exam, answerAll(keys, answers), "hoeren"), true);
});

test("Schreiben additionally requires the Teil 2 text", () => {
  const filled = answerAll(sectionObjectiveKeys(exam, "schreiben"), emptyAnswers());
  assert.strictEqual(isSectionComplete(exam, filled, "schreiben"), false);

  const withText = { ...filled, schreibenTeil2: "Liebe Anna, ..." };
  assert.strictEqual(isSectionComplete(exam, withText, "schreiben"), true);

  const blankText = { ...filled, schreibenTeil2: "   " };
  assert.strictEqual(isSectionComplete(exam, blankText, "schreiben"), false);
});

test("Sprechen depends solely on the practised checkbox", () => {
  const answers = emptyAnswers();
  assert.strictEqual(isSectionComplete(exam, answers, "sprechen"), false);
  assert.strictEqual(isSectionComplete(exam, { ...answers, sprechenPracticed: true }, "sprechen"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `sectionObjectiveKeys` and `isSectionComplete` are not exported from `lib/exam-flow.ts`.

- [ ] **Step 3: Add `SectionFlags` to `lib/types.ts`**

Append after the `ExamSectionId` declaration at the top of the file:

```ts
/** One boolean per exam section, e.g. which sections have been graded. */
export type SectionFlags = Record<ExamSectionId, boolean>;
```

- [ ] **Step 4: Implement in `lib/exam-flow.ts`**

Replace `isAttemptComplete` (lines 30-34) entirely with:

```ts
export function sectionObjectiveKeys(exam: Exam, section: ExamSectionId): string[] {
  return requiredObjectiveKeys(exam).filter((key) => key.startsWith(`${section}.`));
}

/**
 * Whether a section is answered fully enough to be graded.
 * Sprechen is handled first: it has no objective keys, so the `every` below
 * would vacuously report it complete before the learner has done anything.
 */
export function isSectionComplete(exam: Exam, answers: AttemptAnswers, section: ExamSectionId): boolean {
  if (section === "sprechen") return answers.sprechenPracticed;

  const answered = sectionObjectiveKeys(exam, section).every((key) => Boolean(answers.objective[key]?.trim()));
  if (section === "schreiben") return answered && Boolean(answers.schreibenTeil2.trim());
  return answered;
}
```

- [ ] **Step 5: Remove the obsolete `isAttemptComplete` test**

In `scripts/__tests__/exam-data.test.ts`, delete the whole test named
`"isAttemptComplete requires objective answers, writing, and speaking practice"`
and drop `isAttemptComplete` from that file's import list. Nothing references the
function any more — the per-section gate replaces it.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass (5 new, the `isAttemptComplete` one gone), 0 type errors.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/exam-flow.ts scripts/__tests__/section-grading.test.ts scripts/__tests__/exam-data.test.ts
git commit -m "feat: add per-section key selection and completeness checks"
```

---

### Task 2: Per-section grading

**Files:**
- Modify: `lib/grading.ts` (append)
- Test: `scripts/__tests__/section-grading.test.ts` (append)

**Interfaces:**
- Consumes: `gradeExam(exam, answers): GradeResult`, `GradeItem`, `SectionFlags`, `sectionObjectiveKeys`.
- Produces:
  - `interface SectionScore { correct: number; wrong: number; unanswered: number; total: number }`
  - `gradeSections(exam: Exam, answers: AttemptAnswers, flags: SectionFlags): GradeResult`
  - `sectionScore(grade: GradeResult, section: ExamSectionId): SectionScore`

- [ ] **Step 1: Write the failing test**

Append to `scripts/__tests__/section-grading.test.ts`, and extend the existing import
from `lib/grading.ts` at the top of the file:

```ts
import { gradeSections, sectionScore, objectiveKey } from "../../lib/grading.ts";
import type { SectionFlags } from "../../lib/types.ts";

const noSections: SectionFlags = { hoeren: false, lesen: false, schreiben: false, sprechen: false };

test("gradeSections yields nothing while no section is graded", () => {
  const grade = gradeSections(exam, emptyAnswers(), noSections);

  assert.deepStrictEqual(grade.items, {});
  assert.strictEqual(grade.objectiveTotal, 0);
  assert.strictEqual(grade.objectiveCorrect, 0);
});

test("gradeSections counts only the graded sections", () => {
  const answers = answerAll(requiredObjectiveKeys(exam), emptyAnswers());
  const grade = gradeSections(exam, answers, { ...noSections, hoeren: true });

  assert.strictEqual(grade.objectiveTotal, sectionObjectiveKeys(exam, "hoeren").length);
  assert.ok(Object.keys(grade.items).every((key) => key.startsWith("hoeren.")));
});

test("gradeSections matches gradeExam once every section is graded", () => {
  const answers = answerAll(requiredObjectiveKeys(exam), emptyAnswers());
  const all: SectionFlags = { hoeren: true, lesen: true, schreiben: true, sprechen: true };
  const grade = gradeSections(exam, answers, all);

  assert.strictEqual(grade.objectiveTotal, requiredObjectiveKeys(exam).length);
});

test("sectionScore splits correct, wrong and unanswered", () => {
  const keys = sectionObjectiveKeys(exam, "hoeren");
  const first = exam.hoeren.teil1.items[0];
  const firstKey = objectiveKey("hoeren", "teil1", first.nr);

  // Answer every Hoeren item correctly, then spoil exactly one and leave one blank.
  const objective: Record<string, string> = {};
  for (const key of keys) objective[key] = "richtig";
  objective[firstKey] = first.loesung === "richtig" ? "falsch" : "richtig";
  delete objective[keys[keys.length - 1]];

  const grade = gradeSections(exam, { ...emptyAnswers(), objective }, { ...noSections, hoeren: true });
  const score = sectionScore(grade, "hoeren");

  assert.strictEqual(score.total, keys.length);
  assert.strictEqual(score.unanswered, 1);
  assert.ok(score.wrong >= 1);
  assert.strictEqual(score.correct + score.wrong + score.unanswered, score.total);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `gradeSections` and `sectionScore` are not exported from `lib/grading.ts`.

- [ ] **Step 3: Implement in `lib/grading.ts`**

Extend the type import on line 1 to include `ExamSectionId` and `SectionFlags`:

```ts
import type { AttemptAnswers, Exam, ExamSectionId, ObjectiveStatus, SectionFlags } from "./types.ts";
```

Append at the end of the file:

```ts
export interface SectionScore {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
}

/**
 * Grades the whole attempt, then keeps only the sections the learner has
 * actually submitted. Filtering the finished result — rather than grading each
 * section separately — leaves the per-item scoring logic above untouched.
 */
export function gradeSections(exam: Exam, answers: AttemptAnswers, flags: SectionFlags): GradeResult {
  const full = gradeExam(exam, answers);
  const items: Record<string, GradeItem> = {};

  for (const [key, item] of Object.entries(full.items)) {
    const section = key.split(".")[0] as ExamSectionId;
    if (flags[section]) items[key] = item;
  }

  const values = Object.values(items);
  return {
    items,
    objectiveCorrect: values.filter((item) => item.status === "correct").length,
    objectiveTotal: values.length,
    review: full.review,
  };
}

export function sectionScore(grade: GradeResult, section: ExamSectionId): SectionScore {
  const items = Object.entries(grade.items)
    .filter(([key]) => key.startsWith(`${section}.`))
    .map(([, item]) => item);

  return {
    correct: items.filter((item) => item.status === "correct").length,
    wrong: items.filter((item) => item.status === "wrong").length,
    unanswered: items.filter((item) => item.status === "unanswered").length,
    total: items.length,
  };
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all pass, including the five untouched `gradeExam` tests. 0 type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/grading.ts scripts/__tests__/section-grading.test.ts
git commit -m "feat: grade sections independently"
```

---

### Task 3: `SectionActions` component

**Files:**
- Create: `components/exam/SectionActions.tsx`

**Interfaces:**
- Consumes: `SectionScore` (Task 2), `btnPrimary` / `btnSecondary` from `components/ui/styles.ts`, `ExamSectionId`.
- Produces: `<SectionActions />` with the props block below. Task 4 renders it once per section.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import type { JSX } from "react";
import type { ExamSectionId } from "../../lib/types";
import type { SectionScore } from "../../lib/grading";
import { btnPrimary, btnSecondary } from "../ui/styles";

interface SectionActionsProps {
  section: ExamSectionId;
  label: string;
  complete: boolean;
  resolved: boolean;
  revealed: boolean;
  remaining: number;
  score: SectionScore | null;
  onResolve: () => void;
  onReveal: () => void;
  onReset: () => void;
}

const shell = "mt-8 rounded-md border border-line bg-surface-soft p-5 shadow-card";
const row = "flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch";
const hint = "mb-3 text-[0.92rem] text-muted";
const result = "mb-3 font-display text-[1.15rem] font-semibold text-ink";

function openHint(section: ExamSectionId, remaining: number): string {
  if (section === "sprechen") return "Kreuze „Sprechen geübt“ an, um die Beispiele freizuschalten.";
  if (section === "schreiben" && remaining === 0) return "Schreibe noch deinen Text zu Teil 2.";
  return remaining === 1 ? "Noch 1 Aufgabe offen." : `Noch ${remaining} Aufgaben offen.`;
}

export function SectionActions(props: SectionActionsProps): JSX.Element {
  // Sprechen carries no gradable items — the button only reveals the examples.
  if (props.section === "sprechen") {
    return (
      <section className={shell} aria-live="polite">
        {props.complete ? null : <p className={hint}>{openHint("sprechen", 0)}</p>}
        <div className={row}>
          <button
            type="button"
            className={btnPrimary}
            onClick={props.onReveal}
            disabled={!props.complete || props.revealed}
          >
            Beispiele zeigen
          </button>
          {props.revealed ? (
            <button type="button" className={btnSecondary} onClick={props.onReset}>
              Sektion zurücksetzen
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!props.resolved) {
    return (
      <section className={shell} aria-live="polite">
        {props.complete ? null : <p className={hint}>{openHint(props.section, props.remaining)}</p>}
        <div className={row}>
          <button type="button" className={btnPrimary} onClick={props.onResolve} disabled={!props.complete}>
            Auswerten
          </button>
        </div>
      </section>
    );
  }

  const score = props.score;
  return (
    <section className={shell} aria-live="polite">
      {score ? (
        <p className={result}>
          {props.label} — {score.correct} von {score.total} richtig
          {score.wrong > 0 ? ` · ${score.wrong} falsch` : ""}
          {score.unanswered > 0 ? ` · ${score.unanswered} offen` : ""}
        </p>
      ) : null}
      <div className={row}>
        <button type="button" className={btnSecondary} onClick={props.onReveal} disabled={props.revealed}>
          Lösungen zeigen
        </button>
        <button type="button" className={btnSecondary} onClick={props.onReset}>
          Sektion zurücksetzen
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. The component is not rendered yet — this only proves it compiles.

- [ ] **Step 3: Commit**

```bash
git add components/exam/SectionActions.tsx
git commit -m "feat: add per-section action panel"
```

---

### Task 4: Wire `ExamApp` to per-section state

**Files:**
- Modify: `components/exam/ExamApp.tsx`

**Interfaces:**
- Consumes: everything produced by Tasks 1-3.
- Produces: the finished feature. No later task depends on it.

- [ ] **Step 1: Replace the imports and state**

Update the imports at the top of `ExamApp.tsx`:

```ts
import { examPages, requiredObjectiveKeys, sectionObjectiveKeys, isSectionComplete } from "../../lib/exam-flow";
import { gradeSections, objectiveKey, sectionScore, type GradeResult } from "../../lib/grading";
import type { AttemptAnswers, DialogLine, Exam, ExamSectionId, HoerItem, LesenTeil3Item, ObjectiveStatus, Optionen, SectionFlags } from "../../lib/types";
import { SectionActions } from "./SectionActions";
```

Replace the `resolved` / `showAnswers` state (lines 55-56) and the `grade` memo (line 59) with:

```ts
const [sectionState, setSectionState] = useState<{ resolved: SectionFlags; revealed: SectionFlags }>(() => ({
  resolved: { hoeren: false, lesen: false, schreiben: false, sprechen: false },
  revealed: { hoeren: false, lesen: false, schreiben: false, sprechen: false },
}));

const grade = useMemo(
  () => gradeSections(exam, answers, sectionState.resolved),
  [exam, answers, sectionState.resolved],
);

const allResolved = examPages.every((page) => sectionState.resolved[page.id]);
```

Delete the `attemptComplete` line (line 72) — `isAttemptComplete` no longer exists.

- [ ] **Step 2: Replace `resolve` / `redo` with per-section handlers**

Replace the `resolve()` and `redo()` functions (lines 78-87) with:

```ts
function resolveSection(section: ExamSectionId) {
  setSectionState((current) => ({
    // Sprechen has nothing to score, so revealing its examples *is* finishing it.
    resolved: { ...current.resolved, [section]: true },
    revealed:
      section === "sprechen" ? { ...current.revealed, sprechen: true } : current.revealed,
  }));
}

function revealSection(section: ExamSectionId) {
  if (section === "sprechen") {
    resolveSection("sprechen");
    return;
  }
  setSectionState((current) => ({
    ...current,
    revealed: { ...current.revealed, [section]: true },
  }));
}

function resetSection(section: ExamSectionId) {
  setAnswers((current) => {
    const objective = { ...current.objective };
    for (const key of sectionObjectiveKeys(exam, section)) delete objective[key];
    return {
      objective,
      schreibenTeil2: section === "schreiben" ? "" : current.schreibenTeil2,
      sprechenNotes: section === "sprechen" ? "" : current.sprechenNotes,
      sprechenPracticed: section === "sprechen" ? false : current.sprechenPracticed,
    };
  });
  setSectionState((current) => ({
    resolved: { ...current.resolved, [section]: false },
    revealed: { ...current.revealed, [section]: false },
  }));
}

function redo() {
  setAnswers(cloneEmptyAnswers());
  setSectionState({
    resolved: { hoeren: false, lesen: false, schreiben: false, sprechen: false },
    revealed: { hoeren: false, lesen: false, schreiben: false, sprechen: false },
  });
}
```

- [ ] **Step 3: Add a helper that renders one section's actions**

Add inside the component, just before the `return`:

```ts
function actionsFor(section: ExamSectionId, label: string) {
  const keys = sectionObjectiveKeys(exam, section);
  const answered = keys.filter((key) => answers.objective[key]?.trim()).length;
  const resolved = sectionState.resolved[section];

  return (
    <SectionActions
      section={section}
      label={label}
      complete={isSectionComplete(exam, answers, section)}
      resolved={resolved}
      revealed={sectionState.revealed[section]}
      remaining={keys.length - answered}
      score={resolved ? sectionScore(grade, section) : null}
      onResolve={() => resolveSection(section)}
      onReveal={() => revealSection(section)}
      onReset={() => resetSection(section)}
    />
  );
}
```

- [ ] **Step 4: Gate the Antwortbogen**

Replace line 120 with:

```tsx
<Antwortbogen total={totalObjective} answered={answeredCount} correct={allResolved ? grade.objectiveCorrect : null} />
```

Showing `grade.objectiveCorrect` earlier would print a hit count drawn from one
section beside the question total of all four.

- [ ] **Step 5: Update every section body**

In the **Hören** section, pass `locked` and the section's `revealed` flag to each card, then append the actions:

```tsx
{exam.hoeren.teil1.items.map((item) => (
  <HoerItemCard key={item.nr} item={item} part="teil1" answers={answers} setObjective={setObjective} grade={grade} showAnswers={sectionState.revealed.hoeren} locked={sectionState.resolved.hoeren} />
))}
```

Apply the same two new props to the `teil2` and `teil3` maps, then add
`{actionsFor("hoeren", "Hören")}` as the last child of the `<section id="hoeren">`.

In **Lesen**, every `<ChoiceGroup ... disabled={resolved} />` becomes
`disabled={sectionState.resolved.lesen}`, every `<AnswerHint ... showAnswers={showAnswers} />`
becomes `showAnswers={sectionState.revealed.lesen}`, and each `LesenTeil3Card` gains
`locked={sectionState.resolved.lesen}` plus `showAnswers={sectionState.revealed.lesen}`.
Add `{actionsFor("lesen", "Lesen")}` as the last child of `<section id="lesen">`.

In **Schreiben**, the Teil 1 inputs and the Teil 2 `<textarea>` take
`disabled={sectionState.resolved.schreiben}`, the `AnswerHint`s take
`showAnswers={sectionState.revealed.schreiben}`, and the Musterlösung line becomes
`{sectionState.revealed.schreiben ? <p className={answerHint}>Musterlösung: …</p> : null}`.
Add `{actionsFor("schreiben", "Schreiben")}`.

In **Sprechen**, the Teil 3 example becomes
`{sectionState.revealed.sprechen ? <p className={answerHint}>Beispiel: …</p> : null}`.
The checkbox and the notes `<textarea>` lose their `disabled` attribute entirely —
Sprechen is never locked. Add `{actionsFor("sprechen", "Sprechen")}`.

- [ ] **Step 6: Replace the summary and delete the fixed bar**

Replace both trailing blocks (lines 309-334, the summary and the fixed action bar) with:

```tsx
{allResolved ? (
  <section className={examSection} aria-live="polite">
    <h2 className={sectionHeading}>Zusammenfassung</h2>
    <ul className="mt-4 grid gap-2">
      {examPages.map((page) => {
        const score = sectionScore(grade, page.id);
        return (
          <li className="flex justify-between border-b border-line py-2" key={page.id}>
            <span className="font-semibold">{page.label}</span>
            <span className="font-mono text-ink-2">
              {page.id === "sprechen"
                ? answers.sprechenPracticed ? "geübt" : "nicht geübt"
                : `${score.correct} / ${score.total}`}
            </span>
          </li>
        );
      })}
      <li className="flex justify-between py-2">
        <span className="font-display text-[1.15rem] font-semibold">Gesamt</span>
        <span className="font-mono text-[1.15rem] font-bold text-coral">
          {grade.objectiveCorrect} / {grade.objectiveTotal}
        </span>
      </li>
    </ul>
    <button type="button" className={`${btnSecondary} mt-5`} onClick={redo}>
      Neu starten
    </button>
  </section>
) : null}
```

Change the `<main>` class on line 107 from `pb-[140px]` to `pb-20` — the fixed bar that
reserve existed for is gone. Remove the now-unused `btnPrimary` import if nothing else
in the file uses it.

- [ ] **Step 7: Give the card components an explicit lock**

In `HoerItemCard` (line 384) and `LesenTeil3Card` (line 415), add `locked: boolean` to
the props type and replace `disabled={props.grade !== null}` with `disabled={props.locked}`.
Change both `grade: GradeResult | null` props to `grade: GradeResult`, and the same on
`AnswerHint` and `statusClass` — `gradeSections` always returns an object now, so the
null case is gone:

```ts
function statusClass(grade: GradeResult, key: string): ObjectiveStatus | "" {
  return grade.items[key]?.status ?? "";
}
```

- [ ] **Step 8: Typecheck and test**

Run: `npx tsc --noEmit && npm test`
Expected: 0 type errors, all tests pass.

- [ ] **Step 9: Verify in the running app**

Run: `npm run dev`, open http://localhost:3000, pick any Übungssatz.
Expected, in order:
1. Hören shows "Noch 15 Aufgaben offen" with **Auswerten** greyed out.
2. Answering all 15 enables it; pressing it locks only Hören's radios and prints
   "Hören — N von 15 richtig".
3. Switching to Lesen shows its own untouched, unlocked panel.
4. The Antwortbogen still reads "Fortschritt", not "Ergebnis".
5. Only after all four sections are finished does the summary with "Neu starten" appear.

- [ ] **Step 10: Commit**

```bash
git add components/exam/ExamApp.tsx
git commit -m "feat: validate each exam section on its own"
```

---

## Self-Review

**Spec coverage:** Sprechen button label and no-lock rule → Task 3 + Task 4 Step 5. Completeness gate → Task 1 + Task 3. Summary preserved behind `allResolved` → Task 4 Step 6. Antwortbogen gating → Task 4 Step 4. Inline placement / fixed bar removed → Task 4 Step 6. Lock decoupling → Task 4 Step 7. Tests for all four pure functions → Tasks 1-2.

**Type consistency:** `SectionFlags` defined in Task 1, consumed in Tasks 2 and 4. `SectionScore` defined in Task 2, consumed in Tasks 3 and 4. `sectionScore(grade, section)` and `gradeSections(exam, answers, flags)` keep the same signatures across all references. `grade` is non-nullable from Task 2 onward, and Task 4 Step 7 removes the last `| null` annotations.

**Known consequence:** `isAttemptComplete` is deleted in Task 1 along with its test, because the per-section gate replaces its only caller. Test count moves from 20 to 24.
