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
