"use client";

import { useState } from "react";
import type { ExamChoice } from "../../lib/exams";
import { ExamApp } from "./ExamApp";

interface ExamHomeProps {
  exams: ExamChoice[];
}

const skillCards = [
  { title: "Lesen", text: "Read short texts and answer exam-style questions.", icon: "📖" },
  { title: "Hören", text: "Use transcript playback and check comprehension.", icon: "🎧" },
  { title: "Schreiben", text: "Complete forms and write short messages.", icon: "✍️" },
  { title: "Sprechen", text: "Practice prompts, cards, and spoken routines.", icon: "🎙️" },
];

export function ExamHome({ exams }: ExamHomeProps) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

  if (selectedExam) {
    return (
      <>
        <div className="exam-return-bar">
          <button type="button" className="secondary-button" onClick={() => setSelectedExamId(null)}>
            Back to tests
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
        <a className="brand-mark" href="#top" aria-label="Deutschstunde home">
          <span className="brand-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <strong>Deutschstunde</strong>
        </a>
        <span className="level-pill">Level A1</span>
      </header>

      <section className="home-hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Willkommen</p>
          <h1>Learn German the way exams test it.</h1>
          <p>
            Choose a full A1 practice test, work through reading, listening, writing, and speaking, then resolve your answers when everything is complete.
          </p>
          <a className="hero-cta" href="#practice-tests">
            Choose a test
          </a>
        </div>
        <div className="hero-image-card">
          <img src="/illustrations/hero-study.svg" alt="Illustrated German study desk" />
        </div>
      </section>

      <section className="skill-grid" aria-label="Practice skills">
        {skillCards.map((card) => (
          <article className="skill-card" key={card.title}>
            <span className="skill-icon" aria-hidden="true">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="test-section" id="practice-tests">
        <div>
          <p className="eyebrow">Practice tests</p>
          <h2>Pick your exam set</h2>
          <p>Each test keeps all four parts together so your practice feels like the real structure.</p>
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
              <span className="test-meta" aria-hidden="true">📖 1&nbsp;&nbsp;🎧 1&nbsp;&nbsp;✍️ 1&nbsp;&nbsp;🎙️ 1</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
