import { objectiveKey } from "./grading.ts";
import type { AttemptAnswers, Exam, ExamSectionId } from "./types.ts";

export interface ExamPage {
  id: ExamSectionId;
  label: string;
}

export const examPages: ExamPage[] = [
  { id: "hoeren", label: "Hören" },
  { id: "lesen", label: "Lesen" },
  { id: "schreiben", label: "Schreiben" },
  { id: "sprechen", label: "Sprechen" },
];

export function requiredObjectiveKeys(exam: Exam): string[] {
  return [
    ...exam.hoeren.teil1.items.map((item) => objectiveKey("hoeren", "teil1", item.nr)),
    ...exam.hoeren.teil2.items.map((item) => objectiveKey("hoeren", "teil2", item.nr)),
    ...exam.hoeren.teil3.items.map((item) => objectiveKey("hoeren", "teil3", item.nr)),
    ...exam.lesen.teil1.texte.flatMap((text) =>
      text.aussagen.map((aussage) => objectiveKey("lesen", "teil1", aussage.nr)),
    ),
    ...exam.lesen.teil2.items.map((item) => objectiveKey("lesen", "teil2", item.nr)),
    ...exam.lesen.teil3.items.map((item) => objectiveKey("lesen", "teil3", item.nr)),
    ...exam.schreiben.teil1.formularfelder.map((_, index) => objectiveKey("schreiben", "teil1", index)),
  ];
}

export function isAttemptComplete(exam: Exam, answers: AttemptAnswers): boolean {
  const hasObjectiveAnswers = requiredObjectiveKeys(exam).every((key) => Boolean(answers.objective[key]?.trim()));
  const hasWriting = Boolean(answers.schreibenTeil2.trim());
  return hasObjectiveAnswers && hasWriting && answers.sprechenPracticed;
}
