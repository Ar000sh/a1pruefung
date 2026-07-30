# Per-Section Grading — Auswertung pro Prüfungsteil

**Date:** 2026-07-30
**Status:** Approved direction, pending spec review

## Problem

Grading is all-or-nothing. The action bar only appears once the *entire* attempt is
complete (`ExamApp.tsx:320`: `activeSection === "sprechen" && attemptComplete`), and
pressing "Auswerten" grades and locks all four sections at once. A learner who has
finished Hören but not the rest cannot check their work, and cannot practise one
section in isolation — which is how this material is actually used.

The user wants each of Hören, Lesen, Schreiben and Sprechen to carry its own
validation button.

## The real obstacle

`grade !== null` currently does three jobs at once:

1. **"has been graded"** — drives the summary and the status tints
2. **"inputs are locked"** — `HoerItemCard` and `LesenTeil3Card` derive `disabled`
   from it directly (`ExamApp.tsx:408`, `ExamApp.tsx:435`)
3. **"answers may be revealed"** — gates `AnswerHint` together with `showAnswers`

Today these coincide, because grading is global. Once a single section can be graded
on its own, `grade` is non-null while three other sections are still open, and the
three meanings come apart. Separating them is the substance of this change; moving the
buttons is the trivial part.

## Decisions (locked)

- **Sprechen has no auto-gradable items** — only the "Sprechen geübt" checkbox and a
  free-text notes field. Its button is therefore labelled **"Beispiele zeigen"**, not
  "Auswerten", and reveals the `beispielbitte` examples from Teil 3. It never claims to
  score anything, and it does **not** lock the notes field.
- **A section's button unlocks only when that section is complete.** Incomplete
  sections show "Noch N Aufgaben offen" with the button disabled. This mirrors a real
  exam and prevents accidental early grading.
- **The overall result survives.** The Antwortbogen at the top keeps counting across
  the whole attempt; the summary section appears once all four sections are graded.
  Per-section grading leads up to the total rather than replacing it.
- **Buttons sit inline at the end of each section.** The fixed bottom bar is removed,
  along with the permanent `pb-[140px]` reserve it required. Only one section is
  visible at a time, so the button is never far from the last question.

## Architecture

### State (`ExamApp`)

```ts
type SectionFlags = Record<ExamSectionId, boolean>;

const [resolvedSections, setResolvedSections] = useState<SectionFlags>(noSections);
const [revealedSections, setRevealedSections] = useState<SectionFlags>(noSections);

const grade = useMemo(
  () => gradeSections(exam, answers, resolvedSections),
  [exam, answers, resolvedSections],
);
```

The global `resolved` and `showAnswers` booleans are removed. `grade` contains items
only for sections the learner has actually graded, so an ungraded section has no
result in state at all — not merely a hidden one.

**`resolvedSections` means "finished", not "scored".** Sprechen carries no objective
keys, so pressing "Beispiele zeigen" sets both `resolvedSections.sprechen` and
`revealedSections.sprechen`: it marks the section done — which is what the summary
gate below counts — while contributing no score and locking nothing. `gradeSections`
is unaffected by the flag either way, since Sprechen has no items to filter.

### New pure functions

All four are React-free and unit-testable.

| File | Function | Purpose |
|---|---|---|
| `lib/exam-flow.ts` | `sectionObjectiveKeys(exam, section)` | objective keys belonging to one section |
| `lib/exam-flow.ts` | `isSectionComplete(exam, answers, section)` | gates the button |
| `lib/grading.ts` | `gradeSections(exam, answers, flags)` | `gradeExam` filtered to graded sections |
| `lib/grading.ts` | `sectionScore(grade, section)` | `{ correct, wrong, total }` for one section |

`sectionObjectiveKeys` splits on the existing key format — `objectiveKey` already
produces `"hoeren.teil1.3"`, and `ExamApp`'s `sectionKeys` memo already relies on that
prefix. No new key scheme is introduced.

`gradeSections` reuses `gradeExam` unchanged and filters its `items` map, recomputing
`objectiveCorrect` / `objectiveTotal` over the surviving entries. The per-item grading
logic — covered by five existing tests — is not touched.

`isSectionComplete` per section:

- **hoeren**, **lesen** — every objective key answered
- **schreiben** — every objective key answered **and** `schreibenTeil2` non-empty
- **sprechen** — `sprechenPracticed` checked

### Decoupling the lock

`HoerItemCard` and `LesenTeil3Card` gain an explicit `locked: boolean` prop, replacing
`disabled={props.grade !== null}`. The inline Lesen/Schreiben markup switches from
`disabled={resolved}` to the same per-section flag. Grading a section now locks that
section and nothing else.

### `SectionActions` component

One new component in `components/exam/`, rendered at the end of every section. It owns
the whole end-of-section state machine so `ExamApp` does not grow four near-identical
blocks:

| State | Renders |
|---|---|
| incomplete | "Noch N Aufgaben offen", `[Auswerten]` disabled |
| complete, ungraded | `[Auswerten]` |
| graded | result line + `[Lösungen zeigen]` `[Sektion zurücksetzen]` |
| sprechen | `[Beispiele zeigen]` only — no grading, no lock |

"Sektion zurücksetzen" clears that section's answers and both of its flags, leaving the
other three untouched. For Schreiben that includes the Teil 2 text; for Sprechen, the
checkbox and the notes field.

### Overall result

The Antwortbogen keeps showing `beantwortet / gesamt` continuously, but passes
`correct={null}` until every entry in `resolvedSections` is true. Otherwise it would
print a hit count drawn from one section beside the question total of all four — e.g.
"10 richtig" against 32 questions. Once the last section is finished, the Antwortbogen
fills in and the summary appears together, listing the three scored sections plus
Sprechen's "geübt" state and the total, and carrying the global "Neu starten".

## Testing

New unit tests in `scripts/__tests__/` for the four pure functions:

- `sectionObjectiveKeys` returns only that section's keys, and their union equals
  `requiredObjectiveKeys`
- `isSectionComplete` — false while any answer is missing; Schreiben additionally
  requires Teil 2 text; Sprechen depends solely on the checkbox
- `gradeSections` — an ungraded section contributes no items, and `objectiveTotal`
  reflects only graded sections
- `sectionScore` — correct/wrong/total for a mixed section, including `unanswered`

The five existing `gradeExam` tests must keep passing untouched; that is the signal
that the grading logic itself was not disturbed.

## Out of scope

- Changing how answers are scored
- Persisting progress between reloads
- Any redesign of the question cards themselves
