import type { AttemptAnswers, Exam, ExamSectionId, ObjectiveStatus, SectionFlags } from "./types.ts";

export interface GradeItem {
  expected: string;
  actual?: string;
  status: ObjectiveStatus;
}

export interface GradeResult {
  items: Record<string, GradeItem>;
  objectiveCorrect: number;
  objectiveTotal: number;
  review: {
    schreibenTeil2: "empty" | "answered";
    sprechen: "not-practiced" | "practiced";
  };
}

export function objectiveKey(section: string, part: string, nr: number): string {
  return `${section}.${part}.${nr}`;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("de-DE");
}

export function gradeChoiceAnswer(answer: string | undefined, expected: string): ObjectiveStatus {
  if (!answer) return "unanswered";
  return answer === expected ? "correct" : "wrong";
}

export function gradeTextAnswer(answer: string | undefined, expected: string): ObjectiveStatus {
  if (!answer || normalizeAnswer(answer) === "") return "unanswered";
  return normalizeAnswer(answer) === normalizeAnswer(expected) ? "correct" : "wrong";
}

function addChoice(items: Record<string, GradeItem>, key: string, actual: string | undefined, expected: string) {
  items[key] = { expected, actual, status: gradeChoiceAnswer(actual, expected) };
}

function addText(items: Record<string, GradeItem>, key: string, actual: string | undefined, expected: string) {
  items[key] = { expected, actual, status: gradeTextAnswer(actual, expected) };
}

export function gradeExam(exam: Exam, answers: AttemptAnswers): GradeResult {
  const items: Record<string, GradeItem> = {};

  for (const item of exam.hoeren.teil1.items) {
    const key = objectiveKey("hoeren", "teil1", item.nr);
    addChoice(items, key, answers.objective[key], item.loesung);
  }
  for (const item of exam.hoeren.teil2.items) {
    const key = objectiveKey("hoeren", "teil2", item.nr);
    addChoice(items, key, answers.objective[key], item.loesung);
  }
  for (const item of exam.hoeren.teil3.items) {
    const key = objectiveKey("hoeren", "teil3", item.nr);
    addChoice(items, key, answers.objective[key], item.loesung);
  }

  for (const text of exam.lesen.teil1.texte) {
    for (const aussage of text.aussagen) {
      const key = objectiveKey("lesen", "teil1", aussage.nr);
      addChoice(items, key, answers.objective[key], aussage.loesung);
    }
  }
  for (const item of exam.lesen.teil2.items) {
    const key = objectiveKey("lesen", "teil2", item.nr);
    addChoice(items, key, answers.objective[key], item.loesung);
  }
  for (const item of exam.lesen.teil3.items) {
    const key = objectiveKey("lesen", "teil3", item.nr);
    addChoice(items, key, answers.objective[key], item.loesung);
  }

  exam.schreiben.teil1.formularfelder.forEach((field, index) => {
    const key = objectiveKey("schreiben", "teil1", index);
    addText(items, key, answers.objective[key], field.loesung);
  });

  const objectiveTotal = Object.keys(items).length;
  const objectiveCorrect = Object.values(items).filter((item) => item.status === "correct").length;

  return {
    items,
    objectiveCorrect,
    objectiveTotal,
    review: {
      schreibenTeil2: normalizeAnswer(answers.schreibenTeil2) ? "answered" : "empty",
      sprechen: answers.sprechenPracticed ? "practiced" : "not-practiced",
    },
  };
}

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
