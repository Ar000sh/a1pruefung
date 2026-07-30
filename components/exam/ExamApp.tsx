"use client";

import type { JSX } from "react";
import { useMemo, useState } from "react";
import { examPages, isSectionComplete, requiredObjectiveKeys, sectionObjectiveKeys } from "../../lib/exam-flow";
import { gradeSections, objectiveKey, sectionScore, type GradeResult } from "../../lib/grading";
import type {
  AttemptAnswers,
  DialogLine,
  Exam,
  ExamSectionId,
  HoerItem,
  LesenTeil3Item,
  ObjectiveStatus,
  Optionen,
  SectionFlags,
} from "../../lib/types";
import { SectionActions } from "./SectionActions";
import { TranscriptPlayer } from "./TranscriptPlayer";
import { Antwortbogen } from "../ui/antwortbogen";
import { RevealScript } from "../ui/reveal";
import {
  answerHint,
  btnSecondary,
  choiceItem,
  fieldRow,
  inputBase,
  nestedCard,
  questionCard,
  textAreaBase,
} from "../ui/styles";

const teilLabel = "font-mono mt-7 mb-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-coral";
const teilLabelInline = "font-mono mb-2 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-coral";
const questionTitle = "mb-3 font-semibold text-[1.02rem]";
const sectionHeading = "mb-1.5 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-medium";
const examSection = "pt-8 pb-2";

const emptyAnswers: AttemptAnswers = {
  objective: {},
  schreibenTeil2: "",
  sprechenNotes: "",
  sprechenPracticed: false,
};

function cloneEmptyAnswers(): AttemptAnswers {
  return { objective: {}, schreibenTeil2: "", sprechenNotes: "", sprechenPracticed: false };
}

function navButtonClass(active: boolean): string {
  const base =
    "inline-flex items-center gap-2 rounded-pill px-[18px] py-2.5 font-semibold transition-[background,color] duration-150";
  return active ? `${base} bg-coral text-white` : `${base} text-ink-2 hover:bg-surface-soft`;
}

function navCountClass(active: boolean, complete: boolean): string {
  const base = "font-mono rounded-pill px-2 py-0.5 text-[0.72rem] font-bold";
  if (active) return `${base} bg-white/24 text-white`;
  if (complete) return `${base} bg-[color-mix(in_srgb,var(--color-correct)_16%,transparent)] text-correct`;
  return `${base} bg-[color-mix(in_srgb,var(--color-ink)_8%,transparent)] text-muted`;
}

const noFlags: SectionFlags = { hoeren: false, lesen: false, schreiben: false, sprechen: false };

export function ExamApp({ exam }: { exam: Exam }) {
  const [answers, setAnswers] = useState<AttemptAnswers>(emptyAnswers);
  const [sectionState, setSectionState] = useState<{ resolved: SectionFlags; revealed: SectionFlags }>({
    resolved: noFlags,
    revealed: noFlags,
  });
  const [activeSection, setActiveSection] = useState<ExamSectionId>("hoeren");

  const grade = useMemo(
    () => gradeSections(exam, answers, sectionState.resolved),
    [exam, answers, sectionState.resolved],
  );

  const sectionKeys = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const key of requiredObjectiveKeys(exam)) {
      const section = key.split(".")[0];
      (groups[section] ??= []).push(key);
    }
    return groups;
  }, [exam]);

  const totalObjective = requiredObjectiveKeys(exam).length;
  const answeredCount = requiredObjectiveKeys(exam).filter((key) => answers.objective[key]?.trim()).length;
  const allResolved = examPages.every((page) => sectionState.resolved[page.id]);

  function setObjective(key: string, value: string) {
    setAnswers((current) => ({ ...current, objective: { ...current.objective, [key]: value } }));
  }

  function resolveSection(section: ExamSectionId) {
    setSectionState((current) => ({
      // Sprechen has nothing to score, so revealing its examples *is* finishing it.
      resolved: { ...current.resolved, [section]: true },
      revealed: section === "sprechen" ? { ...current.revealed, sprechen: true } : current.revealed,
    }));
  }

  function revealSection(section: ExamSectionId) {
    if (section === "sprechen") {
      resolveSection("sprechen");
      return;
    }
    setSectionState((current) => ({
      ...current,
      revealed: { ...current.revealed, [section]: true },
    }));
  }

  function resetSection(section: ExamSectionId) {
    setAnswers((current) => {
      const objective = { ...current.objective };
      for (const key of sectionObjectiveKeys(exam, section)) delete objective[key];
      return {
        objective,
        schreibenTeil2: section === "schreiben" ? "" : current.schreibenTeil2,
        sprechenNotes: section === "sprechen" ? "" : current.sprechenNotes,
        sprechenPracticed: section === "sprechen" ? false : current.sprechenPracticed,
      };
    });
    setSectionState((current) => ({
      resolved: { ...current.resolved, [section]: false },
      revealed: { ...current.revealed, [section]: false },
    }));
  }

  function redo() {
    setAnswers(cloneEmptyAnswers());
    setSectionState({ resolved: noFlags, revealed: noFlags });
  }

  function actionsFor(section: ExamSectionId, label: string) {
    const keys = sectionObjectiveKeys(exam, section);
    const answered = keys.filter((key) => answers.objective[key]?.trim()).length;
    const resolved = sectionState.resolved[section];

    return (
      <SectionActions
        section={section}
        label={label}
        complete={isSectionComplete(exam, answers, section)}
        resolved={resolved}
        revealed={sectionState.revealed[section]}
        remaining={keys.length - answered}
        score={resolved ? sectionScore(grade, section) : null}
        onResolve={() => resolveSection(section)}
        onReveal={() => revealSection(section)}
        onReset={() => resetSection(section)}
      />
    );
  }

  function selectSection(sectionId: ExamSectionId) {
    setActiveSection(sectionId);
    requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      document.getElementById(sectionId)?.scrollIntoView({ behavior, block: "start" });
    });
  }

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] pt-8 pb-20">
      <RevealScript />
      <header className="grid gap-7 pb-7 pt-5 md:grid-cols-[1fr_auto] md:items-center">
        <div data-reveal>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-none">A1 Prüfungstrainer</h1>
          <p className="mt-3.5 max-w-[62ch] text-base leading-relaxed text-muted">
            Vollständiger Übungssatz mit Hören, Lesen, Schreiben und Sprechen. Antworte zuerst, werte dann deinen Versuch aus.
          </p>
        </div>
        <aside
          className="grid min-w-[240px] gap-3 rounded-md border border-line bg-surface p-[18px] shadow-card max-md:min-w-0"
          aria-live="polite"
        >
          {/* Held back until every section is in: a hit count from one section
              beside the question total of all four would read as a bad score. */}
          <Antwortbogen
            total={totalObjective}
            answered={answeredCount}
            correct={allResolved ? grade.objectiveCorrect : null}
          />
        </aside>
      </header>

      <nav
        className="sticky top-3 z-10 mb-2 flex flex-wrap gap-1 rounded-pill border border-line bg-[color-mix(in_srgb,var(--color-surface)_78%,transparent)] p-1.5 shadow-card backdrop-blur-[10px] max-md:rounded-md"
        aria-label="Prüfungsteile"
      >
        {examPages.map((page) => {
          const keys = sectionKeys[page.id] ?? [];
          const answered = keys.filter((key) => answers.objective[key]?.trim()).length;
          const complete = keys.length > 0 && answered === keys.length;
          const active = activeSection === page.id;
          return (
            <button type="button" className={navButtonClass(active)} key={page.id} onClick={() => selectSection(page.id)}>
              {page.label}
              {keys.length > 0 ? (
                <span className={navCountClass(active, complete)}>
                  {answered}/{keys.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {activeSection === "hoeren" ? (
        <section id="hoeren" className={examSection} data-reveal>
          <h2 className={sectionHeading}>Hören</h2>
          <h3 className={teilLabel}>Teil 1</h3>
          {exam.hoeren.teil1.items.map((item) => (
            <HoerItemCard key={item.nr} item={item} part="teil1" answers={answers} setObjective={setObjective} grade={grade} showAnswers={sectionState.revealed.hoeren} locked={sectionState.resolved.hoeren} />
          ))}
          <h3 className={teilLabel}>Teil 2</h3>
          {exam.hoeren.teil2.items.map((item) => (
            <HoerItemCard key={item.nr} item={item} part="teil2" answers={answers} setObjective={setObjective} grade={grade} showAnswers={sectionState.revealed.hoeren} locked={sectionState.resolved.hoeren} />
          ))}
          <h3 className={teilLabel}>Teil 3</h3>
          {exam.hoeren.teil3.items.map((item) => (
            <HoerItemCard key={item.nr} item={item} part="teil3" answers={answers} setObjective={setObjective} grade={grade} showAnswers={sectionState.revealed.hoeren} locked={sectionState.resolved.hoeren} />
          ))}
          {actionsFor("hoeren", "Hören")}
        </section>
      ) : null}

      {activeSection === "lesen" ? (
        <section id="lesen" className={examSection} data-reveal>
          <h2 className={sectionHeading}>Lesen</h2>
          <h3 className={teilLabel}>Teil 1</h3>
          {exam.lesen.teil1.texte.map((text) => (
            <article className={questionCard("")} key={text.titel}>
              <p className={questionTitle}>{text.titel}</p>
              <p>{text.text}</p>
              {text.aussagen.map((aussage) => {
                const key = objectiveKey("lesen", "teil1", aussage.nr);
                return (
                  <div className={nestedCard(statusClass(grade, key))} key={key}>
                    <p className={questionTitle}>
                      {aussage.nr}. {aussage.aussage}
                    </p>
                    <ChoiceGroup name={key} options={binaryOptions()} selected={answers.objective[key]} onChange={(value) => setObjective(key, value)} disabled={sectionState.resolved.lesen} />
                    <AnswerHint grade={grade} itemKey={key} showAnswers={sectionState.revealed.lesen} />
                  </div>
                );
              })}
            </article>
          ))}

          <h3 className={teilLabel}>Teil 2</h3>
          {exam.lesen.teil2.items.map((item) => {
            const key = objectiveKey("lesen", "teil2", item.nr);
            return (
              <article className={questionCard(statusClass(grade, key))} key={key}>
                <p className={questionTitle}>
                  {item.nr}. {item.situation}
                </p>
                <p>
                  <strong>A:</strong> {item.anzeige_a}
                </p>
                <p>
                  <strong>B:</strong> {item.anzeige_b}
                </p>
                <ChoiceGroup name={key} options={choiceOptions(["a", "b"])} selected={answers.objective[key]} onChange={(value) => setObjective(key, value)} disabled={sectionState.resolved.lesen} />
                <AnswerHint grade={grade} itemKey={key} showAnswers={sectionState.revealed.lesen} />
              </article>
            );
          })}

          <h3 className={teilLabel}>Teil 3</h3>
          {exam.lesen.teil3.items.map((item) => (
            <LesenTeil3Card key={item.nr} item={item} part="teil3" answers={answers} setObjective={setObjective} grade={grade} showAnswers={sectionState.revealed.lesen} locked={sectionState.resolved.lesen} />
          ))}
          {actionsFor("lesen", "Lesen")}
        </section>
      ) : null}

      {activeSection === "schreiben" ? (
        <section id="schreiben" className={examSection} data-reveal>
          <h2 className={sectionHeading}>Schreiben</h2>
          <h3 className={teilLabel}>Teil 1</h3>
          <article className={questionCard("")}>
            <p>{exam.schreiben.teil1.ausgangstext}</p>
            {exam.schreiben.teil1.formularfelder.map((field, index) => {
              const key = objectiveKey("schreiben", "teil1", index);
              return (
                <label className={fieldRow(statusClass(grade, key))} key={key}>
                  <span className="font-semibold text-[0.9rem]">{field.feld}</span>
                  <input className={inputBase} value={answers.objective[key] ?? ""} onChange={(event) => setObjective(key, event.target.value)} disabled={sectionState.resolved.schreiben} />
                  <AnswerHint grade={grade} itemKey={key} showAnswers={sectionState.revealed.schreiben} />
                </label>
              );
            })}
          </article>

          <h3 className={teilLabel}>Teil 2</h3>
          <article className={questionCard("")}>
            <p className={questionTitle}>{exam.schreiben.teil2.situation}</p>
            <ul className="mb-3 list-disc space-y-1 pl-5">
              {exam.schreiben.teil2.inhaltspunkte.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <textarea
              className={textAreaBase}
              value={answers.schreibenTeil2}
              onChange={(event) => setAnswers((current) => ({ ...current, schreibenTeil2: event.target.value }))}
              disabled={sectionState.resolved.schreiben}
            />
            {sectionState.revealed.schreiben ? (
              <p className={answerHint}>Musterlösung: {exam.schreiben.teil2.musterloesung}</p>
            ) : null}
          </article>
          {actionsFor("schreiben", "Schreiben")}
        </section>
      ) : null}

      {activeSection === "sprechen" ? (
        <section id="sprechen" className={examSection} data-reveal>
          <h2 className={sectionHeading}>Sprechen</h2>
          <article className={questionCard("")}>
            <h3 className={teilLabelInline}>Teil 1</h3>
            <p>{exam.sprechen.teil1.beschreibung}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {exam.sprechen.teil1.fragen.map((frage) => (
                <li key={frage}>{frage}</li>
              ))}
            </ul>
          </article>
          <article className={questionCard("")}>
            <h3 className={teilLabelInline}>Teil 2</h3>
            {exam.sprechen.teil2.themen.map((thema) => (
              <div key={thema.thema}>
                <p className={questionTitle}>{thema.thema}</p>
                <div className="my-2.5 mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
                  {thema.karten.map((karte) => (
                    <span className="rounded-sm border border-line bg-surface-soft px-3.5 py-3 font-medium" key={karte}>
                      {karte}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </article>
          <article className={questionCard("")}>
            <h3 className={teilLabelInline}>Teil 3</h3>
            {exam.sprechen.teil3.bildkarten.map((karte) => (
              <div className="my-2.5 rounded-sm border border-line bg-surface px-3.5 py-3" key={karte.beschreibung}>
                <p>{karte.beschreibung}</p>
                {sectionState.revealed.sprechen ? (
                  <p className={answerHint}>Beispiel: {karte.beispielbitte}</p>
                ) : null}
              </div>
            ))}
          </article>
          <article className={questionCard("")}>
            <label className={`${choiceItem} mb-3`}>
              <input
                type="checkbox"
                className="mt-0.5 accent-coral"
                checked={answers.sprechenPracticed}
                onChange={(event) => setAnswers((current) => ({ ...current, sprechenPracticed: event.target.checked }))}
              />
              <span>Sprechen geübt</span>
            </label>
            {/* Never locked: Sprechen is not scored, so notes stay editable. */}
            <textarea
              className={textAreaBase}
              value={answers.sprechenNotes}
              onChange={(event) => setAnswers((current) => ({ ...current, sprechenNotes: event.target.value }))}
              placeholder="Notizen zur eigenen Antwort"
            />
          </article>
          {actionsFor("sprechen", "Sprechen")}
        </section>
      ) : null}

      {allResolved ? (
        <section className={examSection} aria-live="polite">
          <h2 className={sectionHeading}>Zusammenfassung</h2>
          <ul className="mt-4 grid gap-2">
            {examPages.map((page) => {
              const score = sectionScore(grade, page.id);
              return (
                <li className="flex justify-between border-b border-line py-2" key={page.id}>
                  <span className="font-semibold">{page.label}</span>
                  <span className="font-mono text-ink-2">
                    {page.id === "sprechen"
                      ? answers.sprechenPracticed
                        ? "geübt"
                        : "nicht geübt"
                      : `${score.correct} / ${score.total}`}
                  </span>
                </li>
              );
            })}
            <li className="flex justify-between py-2">
              <span className="font-display text-[1.15rem] font-semibold">Gesamt</span>
              <span className="font-mono text-[1.15rem] font-bold text-coral">
                {grade.objectiveCorrect} / {grade.objectiveTotal}
              </span>
            </li>
          </ul>
          <button type="button" className={`${btnSecondary} mt-5`} onClick={redo}>
            Neu starten
          </button>
        </section>
      ) : null}
    </main>
  );
}

// An ungraded section simply has no entry here, so a missing key means
// "not graded yet" and renders neutral.
function statusClass(grade: GradeResult, key: string): ObjectiveStatus | "" {
  return grade.items[key]?.status ?? "";
}

function AnswerHint({
  grade,
  itemKey,
  showAnswers,
}: {
  grade: GradeResult;
  itemKey: string;
  showAnswers: boolean;
}): JSX.Element | null {
  if (!showAnswers || !grade.items[itemKey]) return null;
  return <p className={answerHint}>Richtige Antwort: {grade.items[itemKey].expected}</p>;
}

function ChoiceGroup(props: {
  name: string;
  options: { value: string; label: string }[];
  selected?: string;
  onChange: (value: string) => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <div className="mt-3 grid gap-2.5">
      {props.options.map((option) => (
        <label className={choiceItem} key={option.value}>
          <input
            type="radio"
            className="mt-0.5 accent-coral"
            name={props.name}
            value={option.value}
            checked={props.selected === option.value}
            onChange={() => props.onChange(option.value)}
            disabled={props.disabled}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function HoerItemCard(props: {
  item: HoerItem;
  part: string;
  answers: AttemptAnswers;
  setObjective: (key: string, value: string) => void;
  grade: GradeResult;
  showAnswers: boolean;
  locked: boolean;
}): JSX.Element {
  const key = objectiveKey("hoeren", props.part, props.item.nr);
  const transcript = transcriptLines(props.item);
  const options = props.part === "teil2" ? binaryOptions() : optionTextChoices(props.item.optionen);

  return (
    <article className={questionCard(statusClass(props.grade, key))}>
      <p className={questionTitle}>
        {props.item.nr}. {props.item.frage ?? props.item.aussage}
      </p>
      {props.item.hoerdurchgaenge ? <p className="text-muted">Hördurchgänge: {props.item.hoerdurchgaenge}</p> : null}
      <TranscriptPlayer lines={transcript} label={`Transkript Aufgabe ${props.item.nr}`} />
      <ChoiceGroup
        name={key}
        options={options}
        selected={props.answers.objective[key]}
        onChange={(value) => props.setObjective(key, value)}
        disabled={props.locked}
      />
      <AnswerHint grade={props.grade} itemKey={key} showAnswers={props.showAnswers} />
    </article>
  );
}

function LesenTeil3Card(props: {
  item: LesenTeil3Item;
  part: string;
  answers: AttemptAnswers;
  setObjective: (key: string, value: string) => void;
  grade: GradeResult;
  showAnswers: boolean;
  locked: boolean;
}): JSX.Element {
  const key = objectiveKey("lesen", props.part, props.item.nr);
  return (
    <article className={questionCard(statusClass(props.grade, key))}>
      <p className={questionTitle}>
        {props.item.nr}. {props.item.aussage}
      </p>
      <p>{props.item.schild}</p>
      <ChoiceGroup
        name={key}
        options={binaryOptions()}
        selected={props.answers.objective[key]}
        onChange={(value) => props.setObjective(key, value)}
        disabled={props.locked}
      />
      <AnswerHint grade={props.grade} itemKey={key} showAnswers={props.showAnswers} />
    </article>
  );
}

function binaryOptions() {
  return [
    { value: "richtig", label: "richtig" },
    { value: "falsch", label: "falsch" },
  ];
}

function choiceOptions(values: string[]) {
  return values.map((value) => ({ value, label: value.toUpperCase() }));
}

function optionTextChoices(optionen: Optionen | undefined) {
  if (!optionen) return choiceOptions(["a", "b", "c"]);
  return Object.entries(optionen).map(([value, label]) => ({ value, label: `${value.toUpperCase()}: ${label}` }));
}

function transcriptLines(item: HoerItem): DialogLine[] {
  if (item.dialog?.length) return item.dialog;
  const text = item.durchsage ?? item.nachricht ?? "";
  return [{ sprecher: "Transkript", text }];
}
