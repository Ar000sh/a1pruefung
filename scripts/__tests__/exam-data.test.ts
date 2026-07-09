import { test } from "node:test";
import assert from "node:assert";
import { getExamById, getExamChoices } from "../../lib/exams.ts";

test("loads uebungssatz-03 with all four sections", () => {
  const exam = getExamById("uebungssatz-03");
  assert.strictEqual(exam.id, "uebungssatz-03");
  assert.ok(exam.hoeren);
  assert.ok(exam.lesen);
  assert.ok(exam.schreiben);
  assert.ok(exam.sprechen);
});

test("uebungssatz-03 has the expected objective item counts", () => {
  const exam = getExamById("uebungssatz-03");
  const hoerenCount =
    exam.hoeren.teil1.items.length + exam.hoeren.teil2.items.length + exam.hoeren.teil3.items.length;
  const lesenCount =
    exam.lesen.teil1.texte.flatMap((text) => text.aussagen).length +
    exam.lesen.teil2.items.length +
    exam.lesen.teil3.items.length;

  assert.strictEqual(hoerenCount, 15);
  assert.strictEqual(lesenCount, 15);
  assert.strictEqual(exam.schreiben.teil1.formularfelder.length, 5);
  assert.strictEqual(exam.schreiben.teil2.inhaltspunkte.length, 3);
  assert.strictEqual(exam.sprechen.teil2.themen.length, 2);
  assert.deepStrictEqual(
    exam.sprechen.teil2.themen.map((thema) => thema.karten.length),
    [6, 6],
  );
});

test("unknown exam id throws a clear error", () => {
  assert.throws(() => getExamById("missing"), /Unknown exam id: missing/);
});

test("exam choices expose selectable local exams", () => {
  const choices = getExamChoices();

  assert.deepStrictEqual(
    choices.map((choice) => choice.id),
    ["modellsatz", "uebungssatz-01", "uebungssatz-02", "uebungssatz-03"],
  );
  assert.ok(choices.every((choice) => choice.exam.id === choice.id));
  assert.ok(choices.every((choice) => choice.imageSrc.startsWith("/illustrations/")));
});
