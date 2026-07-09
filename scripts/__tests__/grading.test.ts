import { test } from "node:test";
import assert from "node:assert";
import { getExamById } from "../../lib/exams.ts";
import {
  gradeChoiceAnswer,
  gradeExam,
  gradeTextAnswer,
  normalizeAnswer,
  objectiveKey,
} from "../../lib/grading.ts";

test("objectiveKey creates stable ids", () => {
  assert.strictEqual(objectiveKey("hoeren", "teil1", 6), "hoeren.teil1.6");
});

test("normalizeAnswer trims whitespace and ignores case", () => {
  assert.strictEqual(normalizeAnswer("  rOsSi "), "rossi");
});

test("gradeChoiceAnswer returns correct, wrong, and unanswered", () => {
  assert.strictEqual(gradeChoiceAnswer("b", "b"), "correct");
  assert.strictEqual(gradeChoiceAnswer("a", "b"), "wrong");
  assert.strictEqual(gradeChoiceAnswer(undefined, "b"), "unanswered");
});

test("gradeTextAnswer normalizes form-field answers", () => {
  assert.strictEqual(gradeTextAnswer(" rossi ", "Rossi"), "correct");
  assert.strictEqual(gradeTextAnswer("Rosso", "Rossi"), "wrong");
  assert.strictEqual(gradeTextAnswer("", "Rossi"), "unanswered");
});

test("gradeExam scores objective sections and separates review sections", () => {
  const exam = getExamById("uebungssatz-03");
  const answers = {
    objective: {
      [objectiveKey("hoeren", "teil1", 1)]: "c",
      [objectiveKey("hoeren", "teil1", 2)]: "a",
      [objectiveKey("lesen", "teil1", 1)]: "richtig",
      [objectiveKey("schreiben", "teil1", 0)]: "Rossi",
    },
    schreibenTeil2: "Liebe Julia, ich kann nicht kommen.",
    sprechenNotes: "Teil 1 geuebt.",
    sprechenPracticed: true,
  };

  const result = gradeExam(exam, answers);
  assert.strictEqual(result.objectiveTotal, 35);
  assert.strictEqual(result.objectiveCorrect, 3);
  assert.strictEqual(result.items[objectiveKey("hoeren", "teil1", 1)].status, "correct");
  assert.strictEqual(result.items[objectiveKey("hoeren", "teil1", 2)].status, "wrong");
  assert.strictEqual(result.review.schreibenTeil2, "answered");
  assert.strictEqual(result.review.sprechen, "practiced");
});
