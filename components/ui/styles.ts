/**
 * Shared Tailwind utility strings for repeated widgets.
 * These are class strings (not CSS component classes) so the project stays
 * fully utility-driven while avoiding copy-paste drift across the exam UI.
 */
import type { ObjectiveStatus } from "../../lib/types";

export const btnPrimary =
  "rounded-pill border border-coral bg-coral px-6 py-3 font-semibold text-white shadow-cta transition duration-150 ease-soft hover:-translate-y-0.5 hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:bg-coral";

export const btnSecondary =
  "rounded-pill border border-line-2 bg-surface px-6 py-3 font-semibold text-ink shadow-card transition duration-150 ease-soft hover:-translate-y-px hover:border-ink-2 disabled:cursor-not-allowed disabled:opacity-55";

export const btnSmall =
  "rounded-pill border border-[color:color-mix(in_srgb,var(--color-teal)_45%,var(--color-line))] px-4 py-2 font-semibold text-teal transition duration-150 hover:bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-55";

export const inputBase =
  "w-full rounded-sm border border-line-2 bg-surface px-3.5 py-3 transition-[border-color,box-shadow] duration-150 focus:border-coral focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]";

export const textAreaBase = `${inputBase} min-h-[150px] resize-y leading-relaxed`;

export const choiceItem =
  "flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-surface px-3.5 py-3 transition-[border-color,background] duration-150 hover:border-line-2 hover:bg-surface-soft has-[:checked]:border-coral has-[:checked]:bg-[color-mix(in_srgb,var(--color-coral)_6%,var(--color-surface))]";

export const answerHint =
  "mt-3 rounded-sm bg-correct-bg px-3.5 py-2.5 text-[0.9rem] font-semibold text-correct";

const barBase =
  "before:absolute before:left-0 before:top-3.5 before:bottom-3.5 before:w-1 before:rounded-r before:content-['']";

/** Background + border tint for a graded answer (no accent bar). */
export function statusTint(status: ObjectiveStatus | "" | undefined): string {
  switch (status) {
    case "correct":
      return "border-[color:color-mix(in_srgb,var(--color-correct)_35%,var(--color-line))] bg-correct-bg";
    case "wrong":
      return "border-[color:color-mix(in_srgb,var(--color-wrong)_35%,var(--color-line))] bg-wrong-bg";
    case "unanswered":
      return "border-[color:color-mix(in_srgb,var(--color-pending)_35%,var(--color-line))] bg-pending-bg";
    default:
      return "";
  }
}

/** Full question-card status treatment: tint + a colored left accent bar. */
function statusCard(status: ObjectiveStatus | "" | undefined): string {
  const tint = statusTint(status);
  if (!tint) return "";
  const bar =
    status === "correct"
      ? "before:bg-correct"
      : status === "wrong"
        ? "before:bg-wrong"
        : "before:bg-pending";
  return `${tint} ${barBase} ${bar}`;
}

/**
 * A question card. Border-color and background come from exactly one source
 * (status or the neutral default) so there is no same-property utility clash.
 */
export function questionCard(status: ObjectiveStatus | "" | undefined): string {
  const skin = statusCard(status) || "border-line bg-surface";
  return `relative my-3.5 rounded-md border p-5 shadow-card ${skin}`;
}

/** A nested statement card (e.g. Lesen Teil 1) — flatter, no shadow. */
export function nestedCard(status: ObjectiveStatus | "" | undefined): string {
  const skin = statusCard(status) || "border-line bg-surface-soft";
  return `relative my-3 rounded-md border p-4 ${skin}`;
}

/** A form-field row with optional graded tint (no accent bar). */
export function fieldRow(status: ObjectiveStatus | "" | undefined): string {
  const skin = statusTint(status) || "border-line bg-surface-soft";
  return `mt-3 grid gap-2 rounded-sm border p-3.5 ${skin}`;
}
