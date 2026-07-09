import uebungssatz03 from "../content/exams/uebungssatz-03/exam.json" with { type: "json" };
import type { Exam } from "./types.ts";

const exams: Record<string, Exam> = {
  "uebungssatz-03": uebungssatz03 as Exam,
};

export function getExamById(id: string): Exam {
  const exam = exams[id];
  if (!exam) throw new Error(`Unknown exam id: ${id}`);
  return exam;
}
