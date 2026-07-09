"use client";

import type { JSX } from "react";
import { useMemo, useState } from "react";
import { gradeExam, objectiveKey, type GradeResult } from "../../lib/grading";
import type { AttemptAnswers, DialogLine, Exam, HoerItem, LesenTeil3Item } from "../../lib/types";
import { TranscriptPlayer } from "./TranscriptPlayer";

const emptyAnswers: AttemptAnswers = {
  objective: {},
  schreibenTeil2: "",
  sprechenNotes: "",
  sprechenPracticed: false,
};

function cloneEmptyAnswers(): AttemptAnswers {
  return { objective: {}, schreibenTeil2: "", sprechenNotes: "", sprechenPracticed: false };
}

export function ExamApp({ exam }: { exam: Exam }) {
  const [answers, setAnswers] = useState<AttemptAnswers>(emptyAnswers);
  const [resolved, setResolved] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const grade = useMemo(() => (resolved ? gradeExam(exam, answers) : null), [exam, answers, resolved]);
  const answeredCount = Object.values(answers.objective).filter(Boolean).length;
  const totalObjective = grade?.objectiveTotal ?? 35;

  function setObjective(key: string, value: string) {
    setAnswers((current) => ({ ...current, objective: { ...current.objective, [key]: value } }));
  }

  function resolve() {
    setResolved(true);
    setShowAnswers(false);
  }

  function redo() {
    setAnswers(cloneEmptyAnswers());
    setResolved(false);
    setShowAnswers(false);
  }

  return (
    <main className="exam-shell">
      <header className="exam-header">
        <div>
          <h1 className="exam-title">A1 Prüfungstrainer</h1>
          <p className="exam-subtitle">
            Vollständiger Übungssatz mit Hören, Lesen, Schreiben und Sprechen. Antworten Sie zuerst, lösen Sie dann den Versuch auf.
          </p>
        </div>
        <aside className="score-panel" aria-live="polite">
          <span className="muted">{resolved ? "Ergebnis" : "Fortschritt"}</span>
          <span className="score-value">
            {resolved && grade ? `${grade.objectiveCorrect}/${grade.objectiveTotal}` : `${answeredCount}/${totalObjective}`}
          </span>
          <span className="muted">objektive Aufgaben</span>
        </aside>
      </header>

      <nav className="section-nav" aria-label="Prüfungsteile">
        <a href="#hoeren">Hören</a>
        <a href="#lesen">Lesen</a>
        <a href="#schreiben">Schreiben</a>
        <a href="#sprechen">Sprechen</a>
      </nav>

      <section id="hoeren" className="exam-section">
        <h2 className="section-heading">Hören</h2>
        <h3>Teil 1</h3>
        {exam.hoeren.teil1.items.map((item) => (
          <HoerItemCard
            key={item.nr}
            item={item}
            part="teil1"
            answers={answers}
            setObjective={setObjective}
            grade={grade}
            showAnswers={showAnswers}
          />
        ))}
        <h3>Teil 2</h3>
        {exam.hoeren.teil2.items.map((item) => (
          <HoerItemCard
            key={item.nr}
            item={item}
            part="teil2"
            answers={answers}
            setObjective={setObjective}
            grade={grade}
            showAnswers={showAnswers}
          />
        ))}
        <h3>Teil 3</h3>
        {exam.hoeren.teil3.items.map((item) => (
          <HoerItemCard
            key={item.nr}
            item={item}
            part="teil3"
            answers={answers}
            setObjective={setObjective}
            grade={grade}
            showAnswers={showAnswers}
          />
        ))}
      </section>

      <section id="lesen" className="exam-section">
        <h2 className="section-heading">Lesen</h2>
        <h3>Teil 1</h3>
        {exam.lesen.teil1.texte.map((text) => (
          <article className="question-card" key={text.titel}>
            <p className="question-title">{text.titel}</p>
            <p>{text.text}</p>
            {text.aussagen.map((aussage) => {
              const key = objectiveKey("lesen", "teil1", aussage.nr);
              return (
                <div className={`question-card ${statusClass(grade, key)}`} key={key}>
                  <p className="question-title">
                    {aussage.nr}. {aussage.aussage}
                  </p>
                  <ChoiceGroup
                    name={key}
                    options={binaryOptions()}
                    selected={answers.objective[key]}
                    onChange={(value) => setObjective(key, value)}
                    disabled={resolved}
                  />
                  <AnswerHint grade={grade} itemKey={key} showAnswers={showAnswers} />
                </div>
              );
            })}
          </article>
        ))}

        <h3>Teil 2</h3>
        {exam.lesen.teil2.items.map((item) => {
          const key = objectiveKey("lesen", "teil2", item.nr);
          return (
            <article className={`question-card ${statusClass(grade, key)}`} key={key}>
              <p className="question-title">
                {item.nr}. {item.situation}
              </p>
              <p>
                <strong>A:</strong> {item.anzeige_a}
              </p>
              <p>
                <strong>B:</strong> {item.anzeige_b}
              </p>
              <ChoiceGroup
                name={key}
                options={choiceOptions(["a", "b"])}
                selected={answers.objective[key]}
                onChange={(value) => setObjective(key, value)}
                disabled={resolved}
              />
              <AnswerHint grade={grade} itemKey={key} showAnswers={showAnswers} />
            </article>
          );
        })}

        <h3>Teil 3</h3>
        {exam.lesen.teil3.items.map((item) => (
          <LesenTeil3Card
            key={item.nr}
            item={item}
            part="teil3"
            answers={answers}
            setObjective={setObjective}
            grade={grade}
            showAnswers={showAnswers}
          />
        ))}
      </section>

      <section id="schreiben" className="exam-section">
        <h2 className="section-heading">Schreiben</h2>
        <h3>Teil 1</h3>
        <article className="question-card">
          <p>{exam.schreiben.teil1.ausgangstext}</p>
          {exam.schreiben.teil1.formularfelder.map((field, index) => {
            const key = objectiveKey("schreiben", "teil1", index);
            return (
              <label className={`field-row ${statusClass(grade, key)}`} key={key}>
                <span>{field.feld}</span>
                <input
                  className="text-input"
                  value={answers.objective[key] ?? ""}
                  onChange={(event) => setObjective(key, event.target.value)}
                  disabled={resolved}
                />
                <AnswerHint grade={grade} itemKey={key} showAnswers={showAnswers} />
              </label>
            );
          })}
        </article>

        <h3>Teil 2</h3>
        <article className="question-card">
          <p className="question-title">{exam.schreiben.teil2.situation}</p>
          <ul>
            {exam.schreiben.teil2.inhaltspunkte.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <textarea
            className="text-area"
            value={answers.schreibenTeil2}
            onChange={(event) => setAnswers((current) => ({ ...current, schreibenTeil2: event.target.value }))}
            disabled={resolved}
          />
          {showAnswers ? <p className="answer-hint">Musterlösung: {exam.schreiben.teil2.musterloesung}</p> : null}
        </article>
      </section>

      <section id="sprechen" className="exam-section">
        <h2 className="section-heading">Sprechen</h2>
        <article className="question-card">
          <h3>Teil 1</h3>
          <p>{exam.sprechen.teil1.beschreibung}</p>
          <ul>
            {exam.sprechen.teil1.fragen.map((frage) => (
              <li key={frage}>{frage}</li>
            ))}
          </ul>
        </article>
        <article className="question-card">
          <h3>Teil 2</h3>
          {exam.sprechen.teil2.themen.map((thema) => (
            <div key={thema.thema}>
              <p className="question-title">{thema.thema}</p>
              <div className="card-grid">
                {thema.karten.map((karte) => (
                  <span className="prompt-card" key={karte}>
                    {karte}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </article>
        <article className="question-card">
          <h3>Teil 3</h3>
          {exam.sprechen.teil3.bildkarten.map((karte) => (
            <div className="speaking-card" key={karte.beschreibung}>
              <p>{karte.beschreibung}</p>
              {showAnswers ? <p className="answer-hint">Beispiel: {karte.beispielbitte}</p> : null}
            </div>
          ))}
        </article>
        <article className="question-card">
          <label className="choice-item">
            <input
              type="checkbox"
              checked={answers.sprechenPracticed}
              onChange={(event) => setAnswers((current) => ({ ...current, sprechenPracticed: event.target.checked }))}
              disabled={resolved}
            />
            <span>Sprechen geübt</span>
          </label>
          <textarea
            className="text-area"
            value={answers.sprechenNotes}
            onChange={(event) => setAnswers((current) => ({ ...current, sprechenNotes: event.target.value }))}
            disabled={resolved}
            placeholder="Notizen zur eigenen Antwort"
          />
        </article>
      </section>

      {grade ? (
        <section className="exam-section" aria-live="polite">
          <h2 className="section-heading">Zusammenfassung</h2>
          <p>
            {grade.objectiveCorrect} von {grade.objectiveTotal} objektiven Aufgaben richtig. Schreiben Teil 2:{" "}
            {grade.review.schreibenTeil2 === "answered" ? "beantwortet" : "leer"}. Sprechen:{" "}
            {grade.review.sprechen === "practiced" ? "geübt" : "nicht geübt"}.
          </p>
        </section>
      ) : null}

      <div className="action-bar">
        <div className="action-bar-inner">
          <button type="button" className="primary-button" onClick={resolve} disabled={resolved}>
            Resolve
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowAnswers(true)}
            disabled={!resolved || showAnswers}
          >
            Show answers
          </button>
          <button type="button" className="secondary-button" onClick={redo}>
            Redo exam
          </button>
        </div>
      </div>
    </main>
  );
}

function statusClass(grade: GradeResult | null, key: string): string {
  if (!grade) return "";
  return grade.items[key]?.status ?? "";
}

function AnswerHint({
  grade,
  itemKey,
  showAnswers,
}: {
  grade: GradeResult | null;
  itemKey: string;
  showAnswers: boolean;
}): JSX.Element | null {
  if (!showAnswers || !grade?.items[itemKey]) return null;
  return <p className="answer-hint">Correct answer: {grade.items[itemKey].expected}</p>;
}

function ChoiceGroup(props: {
  name: string;
  options: { value: string; label: string }[];
  selected?: string;
  onChange: (value: string) => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <div className="choice-list">
      {props.options.map((option) => (
        <label className="choice-item" key={option.value}>
          <input
            type="radio"
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
  grade: GradeResult | null;
  showAnswers: boolean;
}): JSX.Element {
  const key = objectiveKey("hoeren", props.part, props.item.nr);
  const transcript = transcriptLines(props.item);
  const options =
    props.part === "teil2"
      ? binaryOptions()
      : choiceOptions(Object.keys(props.item.optionen ?? { a: "a", b: "b", c: "c" }));

  return (
    <article className={`question-card ${statusClass(props.grade, key)}`}>
      <p className="question-title">
        {props.item.nr}. {props.item.frage ?? props.item.aussage}
      </p>
      {props.item.hoerdurchgaenge ? <p className="muted">Hördurchgänge: {props.item.hoerdurchgaenge}</p> : null}
      <TranscriptPlayer lines={transcript} label={`Transkript Aufgabe ${props.item.nr}`} />
      <ChoiceGroup
        name={key}
        options={options}
        selected={props.answers.objective[key]}
        onChange={(value) => props.setObjective(key, value)}
        disabled={props.grade !== null}
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
  grade: GradeResult | null;
  showAnswers: boolean;
}): JSX.Element {
  const key = objectiveKey("lesen", props.part, props.item.nr);
  return (
    <article className={`question-card ${statusClass(props.grade, key)}`}>
      <p className="question-title">
        {props.item.nr}. {props.item.aussage}
      </p>
      <p>{props.item.schild}</p>
      <ChoiceGroup
        name={key}
        options={binaryOptions()}
        selected={props.answers.objective[key]}
        onChange={(value) => props.setObjective(key, value)}
        disabled={props.grade !== null}
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

function transcriptLines(item: HoerItem): DialogLine[] {
  if (item.dialog?.length) return item.dialog;
  const text = item.durchsage ?? item.nachricht ?? "";
  return [{ sprecher: "Transkript", text }];
}
