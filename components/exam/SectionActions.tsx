"use client";

import type { JSX } from "react";
import type { ExamSectionId } from "../../lib/types";
import type { SectionScore } from "../../lib/grading";
import { btnPrimary, btnSecondary } from "../ui/styles";

interface SectionActionsProps {
  section: ExamSectionId;
  label: string;
  complete: boolean;
  resolved: boolean;
  revealed: boolean;
  remaining: number;
  score: SectionScore | null;
  onResolve: () => void;
  onReveal: () => void;
  onReset: () => void;
}

const shell = "mt-8 rounded-md border border-line bg-surface-soft p-5 shadow-card";
const row = "flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch";
const hint = "mb-3 text-[0.92rem] text-muted";
const result = "mb-3 font-display text-[1.15rem] font-semibold text-ink";

function openHint(section: ExamSectionId, remaining: number): string {
  if (section === "sprechen") return "Kreuze „Sprechen geübt“ an, um die Beispiele freizuschalten.";
  if (section === "schreiben" && remaining === 0) return "Schreibe noch deinen Text zu Teil 2.";
  return remaining === 1 ? "Noch 1 Aufgabe offen." : `Noch ${remaining} Aufgaben offen.`;
}

export function SectionActions(props: SectionActionsProps): JSX.Element {
  // Sprechen carries no gradable items — the button only reveals the examples.
  if (props.section === "sprechen") {
    return (
      <section className={shell} aria-live="polite">
        {props.complete ? null : <p className={hint}>{openHint("sprechen", 0)}</p>}
        <div className={row}>
          <button
            type="button"
            className={btnPrimary}
            onClick={props.onReveal}
            disabled={!props.complete || props.revealed}
          >
            Beispiele zeigen
          </button>
          {props.revealed ? (
            <button type="button" className={btnSecondary} onClick={props.onReset}>
              Sektion zurücksetzen
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!props.resolved) {
    return (
      <section className={shell} aria-live="polite">
        {props.complete ? null : <p className={hint}>{openHint(props.section, props.remaining)}</p>}
        <div className={row}>
          <button type="button" className={btnPrimary} onClick={props.onResolve} disabled={!props.complete}>
            Auswerten
          </button>
        </div>
      </section>
    );
  }

  const score = props.score;
  return (
    <section className={shell} aria-live="polite">
      {score ? (
        <p className={result}>
          {props.label} — {score.correct} von {score.total} richtig
          {score.wrong > 0 ? ` · ${score.wrong} falsch` : ""}
          {score.unanswered > 0 ? ` · ${score.unanswered} offen` : ""}
        </p>
      ) : null}
      <div className={row}>
        <button type="button" className={btnSecondary} onClick={props.onReveal} disabled={props.revealed}>
          Lösungen zeigen
        </button>
        <button type="button" className={btnSecondary} onClick={props.onReset}>
          Sektion zurücksetzen
        </button>
      </div>
    </section>
  );
}
