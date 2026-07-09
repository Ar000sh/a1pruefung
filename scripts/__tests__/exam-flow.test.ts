import { test } from "node:test";
import assert from "node:assert";
import { getExamById } from "../../lib/exams.ts";
import { isAttemptComplete, requiredObjectiveKeys } from "../../lib/exam-flow.ts";
import { objectiveKey } from "../../lib/grading.ts";
import type { AttemptAnswers } from "../../lib/types.ts";

function emptyAttempt(): AttemptAnswers {
  return {
    objective: {},
    schreibenTeil2: "",
    sprechenNotes: "",
    sprechenPracticed: false,
  };
}

test("requiredObjectiveKeys includes every auto-graded answer", () => {
  const exam = getExamById("uebungssatz-03");
  const keys = requiredObjectiveKeys(exam);

  assert.strictEqual(keys.length, 35);
  assert.ok(keys.includes(objectiveKey("hoeren", "teil1", 1)));
  assert.ok(keys.includes(objectiveKey("lesen", "teil3", 15)));
  assert.ok(keys.includes(objectiveKey("schreiben", "teil1", 4)));
});

test("isAttemptComplete requires objective answers, writing, and speaking practice", () => {
  const exam = getExamById("uebungssatz-03");
  const attempt = emptyAttempt();

  for (const key of requiredObjectiveKeys(exam)) {
    attempt.objective[key] = "x";
  }
  attempt.schreibenTeil2 = "Liebe Julia, ich kann am Samstag nicht kommen.";
  attempt.sprechenPracticed = true;

  assert.strictEqual(isAttemptComplete(exam, attempt), true);

  attempt.objective[objectiveKey("hoeren", "teil1", 1)] = "";
  assert.strictEqual(isAttemptComplete(exam, attempt), false);

  attempt.objective[objectiveKey("hoeren", "teil1", 1)] = "c";
  attempt.schreibenTeil2 = "   ";
  assert.strictEqual(isAttemptComplete(exam, attempt), false);

  attempt.schreibenTeil2 = "Liebe Julia...";
  attempt.sprechenPracticed = false;
  assert.strictEqual(isAttemptComplete(exam, attempt), false);
});
