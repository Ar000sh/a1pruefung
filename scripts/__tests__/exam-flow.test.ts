import { test } from "node:test";
import assert from "node:assert";
import { getExamById } from "../../lib/exams.ts";
import { requiredObjectiveKeys } from "../../lib/exam-flow.ts";
import { objectiveKey } from "../../lib/grading.ts";

test("requiredObjectiveKeys includes every auto-graded answer", () => {
  const exam = getExamById("uebungssatz-03");
  const keys = requiredObjectiveKeys(exam);

  assert.strictEqual(keys.length, 35);
  assert.ok(keys.includes(objectiveKey("hoeren", "teil1", 1)));
  assert.ok(keys.includes(objectiveKey("lesen", "teil3", 15)));
  assert.ok(keys.includes(objectiveKey("schreiben", "teil1", 4)));
});


