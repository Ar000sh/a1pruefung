import { test } from "node:test";
import assert from "node:assert";
import { getExamById } from "../../lib/exams.ts";
import { requiredObjectiveKeys, sectionObjectiveKeys, isSectionComplete } from "../../lib/exam-flow.ts";
import { gradeSections, objectiveKey, sectionScore } from "../../lib/grading.ts";
import type { AttemptAnswers, SectionFlags } from "../../lib/types.ts";

const noSections: SectionFlags = { hoeren: false, lesen: false, schreiben: false, sprechen: false };

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

  // Fill every Hoeren item, then spoil exactly one and leave the last blank.
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
