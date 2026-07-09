import { ExamApp } from "../components/exam/ExamApp";
import { getExamById } from "../lib/exams";

export default function HomePage() {
  const exam = getExamById("uebungssatz-03");
  return <ExamApp exam={exam} />;
}
