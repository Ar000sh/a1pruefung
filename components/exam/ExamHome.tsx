"use client";

import { useState } from "react";
import type { ExamChoice } from "../../lib/exams";
import { ExamApp } from "./ExamApp";
import { RevealScript } from "../ui/reveal";
import { btnSecondary } from "../ui/styles";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface ExamHomeProps {
  exams: ExamChoice[];
}

// Explicit per-skill chip classes (literal strings so Tailwind's scanner emits them)
const chip = {
  coral: "bg-[color-mix(in_srgb,var(--color-coral)_15%,var(--color-surface))] text-coral shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-coral)_22%,transparent)]",
  teal: "bg-[color-mix(in_srgb,var(--color-teal)_15%,var(--color-surface))] text-teal shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-teal)_22%,transparent)]",
  gold: "bg-[color-mix(in_srgb,var(--color-gold)_15%,var(--color-surface))] text-gold shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-gold)_22%,transparent)]",
  violet: "bg-[color-mix(in_srgb,var(--color-violet)_15%,var(--color-surface))] text-violet shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-violet)_22%,transparent)]",
};

const skillCards = [
  { title: "Lesen", text: "Kurze Texte lesen und Prüfungsfragen beantworten.", icon: "📖", chip: chip.coral },
  { title: "Hören", text: "Transkripte anhören und das Verstehen prüfen.", icon: "🎧", chip: chip.teal },
  { title: "Schreiben", text: "Formulare ausfüllen und kurze Nachrichten schreiben.", icon: "✍️", chip: chip.gold },
  { title: "Sprechen", text: "Aufgaben, Karten und mündliche Routinen üben.", icon: "🎙️", chip: chip.violet },
];

// Per-exam accent: bar fill + hover border, as literal utility classes
const accent: Record<string, { bar: string; hover: string }> = {
  coral: { bar: "bg-coral", hover: "hover:border-coral" },
  mint: { bar: "bg-mint", hover: "hover:border-mint" },
  gold: { bar: "bg-gold", hover: "hover:border-gold" },
  violet: { bar: "bg-violet", hover: "hover:border-violet" },
  sky: { bar: "bg-sky", hover: "hover:border-sky" },
  sage: { bar: "bg-sage", hover: "hover:border-sage" },
};

const eyebrow = "font-mono mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-coral";

export function ExamHome({ exams }: ExamHomeProps) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

  if (selectedExam) {
    return (
      <>
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-[color-mix(in_srgb,var(--color-paper)_88%,transparent)] px-[max(20px,calc((100%-1200px)/2))] py-3 backdrop-blur-[8px]">
          <button type="button" className={btnSecondary} onClick={() => setSelectedExamId(null)}>
            Zurück zur Auswahl
          </button>
          <span className="font-display font-semibold">{selectedExam.title}</span>
        </div>
        <ExamApp key={selectedExam.id} exam={selectedExam.exam} />
      </>
    );
  }

  return (
    <main className="mx-auto w-[min(1240px,calc(100%-40px))] pb-20">
      <RevealScript />
      <header className="flex h-16 items-center justify-between border-b border-line">
        <a className="inline-flex items-center gap-3 text-ink no-underline" href="#top" aria-label="Deutschstunde Startseite">
          <span className="inline-flex items-center gap-[5px]" aria-hidden="true">
            <span className="h-[9px] w-[9px] rounded-full bg-coral" />
            <span className="h-[9px] w-[9px] rounded-full bg-ink" />
          </span>
          <strong className="font-display text-xl font-semibold">Deutschstunde</strong>
        </a>
        <span className="font-mono rounded-pill border border-line-2 bg-surface px-3 py-1.5 text-[0.72rem] font-bold tracking-[0.04em] text-ink-2 shadow-card">
          Niveau A1
        </span>
      </header>

      <section className="relative grid gap-10 pt-10 pb-14 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.78fr)] md:items-center md:pt-[72px]" id="top">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[10%] right-[-6%] -z-10 h-[130%] w-3/5 blur-[6px] bg-[radial-gradient(60%_55%_at_62%_40%,rgba(224,57,42,0.14),rgba(211,137,31,0.1)_45%,transparent_72%)]"
        />
        <div data-reveal>
          <p className={eyebrow}>Willkommen</p>
          <h1 className="mb-5 max-w-[12ch] font-display text-[clamp(2.6rem,5.6vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.02em]">
            Deutsch lernen, <em className="italic text-coral">wie es in der Prüfung vorkommt.</em>
          </h1>
          <p className="max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-2">
            Wähle einen kompletten A1-Übungssatz und trainiere Lesen, Hören, Schreiben und Sprechen. Am Ende kannst du deine Antworten auswerten.
          </p>
          <a
            className="group mt-[30px] inline-flex items-center gap-2.5 rounded-pill bg-coral px-[26px] py-3.5 font-semibold text-white no-underline shadow-cta transition-[transform,box-shadow,background] duration-200 ease-soft hover:-translate-y-0.5 hover:bg-coral-deep"
            href="#practice-tests"
          >
            Prüfung wählen
            <span aria-hidden="true" className="transition-transform duration-200 ease-soft group-hover:translate-x-1">→</span>
          </a>
        </div>
        <div
          className="w-full rounded-lg border border-line bg-surface p-4 shadow-raised md:w-[min(100%,460px)] md:justify-self-end"
          data-reveal
        >
          <img className="block h-auto w-full rounded-md" src="/illustrations/hero-study.svg" alt="Illustrierter Schreibtisch zum Deutschlernen" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 pt-2 pb-16 sm:grid-cols-2 lg:grid-cols-4" aria-label="Prüfungsteile">
        {skillCards.map((card) => (
          <article
            className="grid gap-3.5 rounded-md border border-line bg-surface p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-soft hover:-translate-y-1 hover:border-line-2 hover:shadow-lift"
            key={card.title}
            data-reveal
          >
            <span
              className={`grid h-[46px] w-[46px] place-items-center rounded-[13px] text-[1.35rem] leading-none ${card.chip}`}
              aria-hidden="true"
            >
              {card.icon}
            </span>
            <h2 className="font-display text-[1.2rem] font-semibold">{card.title}</h2>
            <p className="text-[0.9rem] leading-relaxed text-muted">{card.text}</p>
          </article>
        ))}
      </section>

      <section className="pb-6" id="practice-tests" data-reveal>
        <Carousel>
          <div className="mb-[26px] flex items-end justify-between gap-4 max-md:flex-col max-md:items-stretch">
            <div>
              <p className={eyebrow}>Übungssätze</p>
              <h2 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] font-medium">Wähle deinen Prüfungssatz</h2>
              <p className="mt-2 text-base text-muted">Jeder Satz enthält alle vier Teile, damit dein Training zur echten Prüfungsstruktur passt.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 max-md:justify-start" aria-label="Prüfungssätze steuern">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
          <CarouselContent>
            {exams.map((exam) => {
              const tone = accent[exam.accent] ?? accent.coral;
              return (
              <CarouselItem key={exam.id}>
                <button
                  type="button"
                  className={`group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-md border border-line bg-surface text-left shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-soft hover:-translate-y-[5px] hover:shadow-lift ${tone.hover}`}
                  onClick={() => setSelectedExamId(exam.id)}
                >
                  <span className={`h-[5px] w-full shrink-0 ${tone.bar}`} />
                  <span className="relative block w-full shrink-0 overflow-hidden bg-surface-soft">
                    {/* 16:10 matches the illustrations' own proportions, so every
                        cover crops the same amount instead of one per artwork. */}
                    <img className="block aspect-[16/10] w-full object-cover" src={exam.imageSrc} alt="" />
                    <span className="font-mono absolute right-3 top-3 rounded-pill bg-ink px-2.5 py-1 text-[0.66rem] font-bold tracking-wide text-paper">
                      A1
                    </span>
                  </span>
                  {/* Fixed line counts keep the title, subtitle, blurb and rule at
                      the same height in every card, however long the copy runs. */}
                  <span className="flex flex-1 flex-col px-5 pb-5 pt-4">
                    <span className="line-clamp-1 font-display text-[1.3rem] font-semibold leading-tight">{exam.title}</span>
                    <span className="mt-1.5 line-clamp-1 text-[0.92rem] font-medium text-ink-2">{exam.subtitle}</span>
                    <span className="mt-1.5 mb-4 line-clamp-2 min-h-[2.8rem] text-[0.86rem] leading-relaxed text-muted">
                      {exam.description}
                    </span>
                    <span className="font-mono mt-auto border-t border-line pt-3 text-[0.7rem] tracking-wide text-muted" aria-hidden="true">
                      Lesen · Hören · Schreiben · Sprechen
                    </span>
                  </span>
                </button>
              </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </section>
    </main>
  );
}
