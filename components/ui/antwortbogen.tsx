/**
 * Antwortbogen — the answer-sheet progress signature.
 * A grid of bubbles that fill as you answer, then resolve to correct/wrong
 * after grading, echoing the way you bubble a real Goethe answer sheet.
 */
interface AntwortbogenProps {
  total: number;
  answered: number;
  correct: number | null;
}

const bubbleState = {
  filled: "bg-coral border-coral",
  correct: "bg-correct border-correct",
  wrong: "border-wrong shadow-[inset_0_0_0_2px_var(--color-wrong-bg)]",
  empty: "border-line-2",
} as const;

const label = "font-mono text-[0.78rem] tracking-wide text-muted";

export function Antwortbogen({ total, answered, correct }: AntwortbogenProps) {
  const graded = correct !== null;
  const bubbles = Array.from({ length: total }, (_, index) => {
    if (graded) return index < (correct ?? 0) ? "correct" : "wrong";
    return index < answered ? "filled" : "empty";
  });

  return (
    <>
      <span className={label}>{graded ? "Ergebnis" : "Fortschritt"}</span>
      <span className="font-mono text-2xl font-bold text-ink" aria-hidden="true">
        <b className="text-coral">{graded ? correct : answered}</b> / {total}
      </span>
      <span className={label}>{graded ? "richtig" : "beantwortet"}</span>
      <div
        className="grid grid-cols-[repeat(auto-fill,12px)] gap-1.5"
        role="img"
        aria-label={
          graded
            ? `${correct} von ${total} objektiven Aufgaben richtig`
            : `${answered} von ${total} Aufgaben beantwortet`
        }
      >
        {bubbles.map((state, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full border-[1.5px] transition-[background,border-color] duration-200 ${bubbleState[state]}`}
          />
        ))}
      </div>
    </>
  );
}
