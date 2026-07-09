import modellsatz from "../content/exams/modellsatz/exam.json" with { type: "json" };
import uebungssatz01 from "../content/exams/uebungssatz-01/exam.json" with { type: "json" };
import uebungssatz02 from "../content/exams/uebungssatz-02/exam.json" with { type: "json" };
import uebungssatz03 from "../content/exams/uebungssatz-03/exam.json" with { type: "json" };

import type { Exam } from "./types.ts";

export interface ExamChoice {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  accent: string;
  exam: Exam;
}

const exams: Record<string, Exam> = {
  "uebungssatz-03": uebungssatz03 as Exam,
  modellsatz: modellsatz as Exam,
  "uebungssatz-02": uebungssatz02 as Exam,
  "uebungssatz-01": uebungssatz01 as Exam,
};

const examChoices: ExamChoice[] = [
  {
    id: "modellsatz",
    title: "Modellsatz",
    subtitle: "Starte mit dem klassischen Prüfungssatz.",
    description: "Ein ausgewogener A1-Test mit allen vier Teilen.",
    imageSrc: "/illustrations/exam-city.svg",
    accent: "coral",
    exam: exams.modellsatz,
  },
  {
    id: "uebungssatz-01",
    title: "Übungssatz 01",
    subtitle: "Alltag, Freizeit und einfache Pläne.",
    description: "Übe typische Situationen in ruhigem Tempo.",
    imageSrc: "/illustrations/exam-cafe.svg",
    accent: "mint",
    exam: exams["uebungssatz-01"],
  },
  {
    id: "uebungssatz-02",
    title: "Übungssatz 02",
    subtitle: "Einkaufen, Essen und Termine.",
    description: "Bearbeite praktische Themen aus dem Alltag.",
    imageSrc: "/illustrations/exam-market.svg",
    accent: "gold",
    exam: exams["uebungssatz-02"],
  },
  {
    id: "uebungssatz-03",
    title: "Übungssatz 03",
    subtitle: "Reisen, Service und Nachrichten.",
    description: "Trainiere Durchsagen, Schilder und kurze Mitteilungen.",
    imageSrc: "/illustrations/exam-train.svg",
    accent: "violet",
    exam: exams["uebungssatz-03"],
  },
];

export function getExamById(id: string): Exam {
  const exam = exams[id];
  if (!exam) throw new Error(`Unknown exam id: ${id}`);
  return exam;
}

export function getExamChoices(): ExamChoice[] {
  return examChoices;
}
