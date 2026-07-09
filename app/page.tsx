import { ExamHome } from "../components/exam/ExamHome";
import { getExamChoices } from "../lib/exams";

export default function HomePage() {
  return <ExamHome exams={getExamChoices()} />;
}
