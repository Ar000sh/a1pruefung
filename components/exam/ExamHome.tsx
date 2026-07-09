"use client";

import { useState } from "react";
import type { ExamChoice } from "../../lib/exams";
import { ExamApp } from "./ExamApp";

interface ExamHomeProps {
  exams: ExamChoice[];
}

const skillCards = [
  { title: "Lesen", text: "Kurze Texte lesen und Prüfungsfragen beantworten.", imageSrc: "/illustrations/skill-reading.svg" },
  { title: "Hören", text: "Transkripte anhören und das Verstehen prüfen.", imageSrc: "/illustrations/skill-listening.svg" },
  { title: "Schreiben", text: "Formulare ausfüllen und kurze Nachrichten schreiben.", imageSrc: "/illustrations/skill-writing.svg" },
  { title: "Sprechen", text: "Aufgaben, Karten und mündliche Routinen üben.", imageSrc: "/illustrations/skill-speaking.svg" },
];

export function ExamHome({ exams }: ExamHomeProps) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

  if (selectedExam) {
    return (
      <>
        <div className="exam-return-bar">
          <button type="button" className="secondary-button" onClick={() => setSelectedExamId(null)}>
            Zurück zur Auswahl
          </button>
          <span>{selectedExam.title}</span>
        </div>
        <ExamApp key={selectedExam.id} exam={selectedExam.exam} />
      </>
    );
  }

  return (
    <main className="home-shell">
      <header className="home-topbar">
        <a className="brand-mark" href="#top" aria-label="Deutschstunde Startseite">
          <span className="brand-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <strong>Deutschstunde</strong>
        </a>
        <span className="level-pill">Niveau A1</span>
      </header>

      <section className="home-hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Willkommen</p>
          <h1>Deutsch lernen, wie es in der Prüfung vorkommt.</h1>
          <p>
            Wähle einen kompletten A1-Übungssatz und trainiere Lesen, Hören, Schreiben und Sprechen. Am Ende kannst du deine Antworten auswerten.
          </p>
          <a className="hero-cta" href="#practice-tests">
            Prüfung wählen
          </a>
        </div>
        <div className="hero-image-card">
          <img src="/illustrations/hero-study.svg" alt="Illustrierter Schreibtisch zum Deutschlernen" />
        </div>
      </section>

      <section className="skill-grid" aria-label="Prüfungsteile">
        {skillCards.map((card) => (
          <article className="skill-card" key={card.title}>
            <img src={card.imageSrc} alt="" />
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="test-section" id="practice-tests">
        <div>
          <p className="eyebrow">Übungssätze</p>
          <h2>Wähle deinen Prüfungssatz</h2>
          <p>Jeder Satz enthält alle vier Teile, damit dein Training zur echten Prüfungsstruktur passt.</p>
        </div>
        <div className="test-grid">
          {exams.map((exam) => (
            <button
              type="button"
              className={`test-card ${exam.accent}`}
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
            >
              <span className="test-level">A1</span>
              <img src={exam.imageSrc} alt="" />
              <span className="test-title">{exam.title}</span>
              <span className="test-subtitle">{exam.subtitle}</span>
              <span className="test-description">{exam.description}</span>
              <span className="test-meta" aria-hidden="true">
                Lesen 1&nbsp;&nbsp;Hören 1&nbsp;&nbsp;Schreiben 1&nbsp;&nbsp;Sprechen 1
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
