# Visual Redesign — Deutschstunde A1 Prüfungstrainer

**Date:** 2026-07-11
**Status:** Approved direction, pending spec review

## Problem

The current UI (home + exam-taking screens) uses the right warm palette but reads as
a flat static document, not a product: hairline 1px borders, near-invisible shadows,
system fonts (Georgia headlines / Arial body), no texture, and no motion. The user
wants it to feel visually appealing and alive while **keeping the existing warm cream
palette** shown in the reference (`lib/image.png`).

## Decisions (locked)

- **Mood:** Refined editorial — calm, premium, warm; depth and subtle motion, not busy.
- **Scope:** Whole app — home (`ExamHome`) *and* exam-taking screens (`ExamApp`).
- **Typefaces:** **Fraunces** (display/headlines) + **Inter** (body/UI), via `next/font/google`
  (self-hosted at build, no runtime external requests, no new npm dependency).
- **Language:** Localize all remaining English UI strings to German
  (`Resolve` → `Auswerten`, `Show answers` → `Lösungen zeigen`, `Redo exam` → `Neu starten`,
  `Correct answer:` → `Richtige Antwort:`, and any other stray English).

## Design system (tokens)

All defined as CSS custom properties in `app/globals.css`, extending the existing `:root`.

### Typography
- `--font-display` → Fraunces (variable, optical sizing on; used for h1/h2, brand,
  exam titles, card titles). Weights ~400–600, slight negative tracking on large sizes.
- `--font-body` → Inter (variable; body, UI, buttons, meta).
- Wire both in `app/layout.tsx` with `next/font/google`, expose as CSS vars on `<body>`.
- Replace hardcoded `Georgia, "Times New Roman", serif` and `Arial, Helvetica` references.

### Color (same hues, layered)
Keep existing accent hues; formalize and warm the neutrals:
- `--paper` deepened slightly to a warm base; `--surface` (cards) floats lighter on top.
- `--ink` warmed from `#202124` → `#2a2320` (warm near-black); `--muted` warmed to match.
- Accent tokens formalized: `--coral #e03a26`, `--gold #d99718`, `--teal #2f9d8f`,
  `--terracotta #ff7a45`, plus the per-exam accents already used
  (coral / mint / gold / violet / sky / sage) mapped to these.
- Status: `--correct` (green), `--wrong` (coral-red), `--pending` (amber) — used as a
  left accent bar + gentle tint, not a full border swap.

### Depth & texture
- `--radius-card` ~16px (up from 8), `--radius-pill` 999px.
- Layered shadow tokens: `--shadow-ambient` (soft, wide, low-opacity warm) +
  `--shadow-key` (tighter). Cards use ambient at rest, ambient+key on hover.
- `--grain`: an inline SVG `feTurbulence` noise, applied as a fixed, ~3% opacity
  overlay on the page background for tactility (pointer-events: none).
- Hero: a soft warm radial-gradient "aura" behind the illustration card.

### Motion (all gated behind `prefers-reduced-motion: reduce`)
- Scroll-in: sections/cards fade + translateY(8–12px) into place via IntersectionObserver
  (a small `useReveal` hook or a shared `Reveal` wrapper) or CSS `@starting-style` where viable.
- Hover: cards lift (`translateY(-3px)`) with an accent-tinted glow; refined easing
  (`cubic-bezier(.2,.7,.2,1)`), ~180ms.
- Exam section switch: gentle cross-fade of the active section.

## Screens

### Home (`components/exam/ExamHome.tsx`)
- **Topbar:** unchanged structure; refined type (Fraunces brand), Inter level pill.
- **Hero:** larger Fraunces headline with tighter leading; warm gradient aura behind the
  illustration card; refined spacing; coral pill CTA with a softer, layered shadow.
- **Skill cards (4-up):** each gets a colored icon chip keyed to an accent
  (Lesen=coral, Hören=teal, Schreiben=gold, Sprechen=violet); soft card, hover lift.
- **Practice-test cards:** accent top-edge/border keyed per exam, A1 badge, exam
  illustration, Fraunces title, subtitle, and a small skill-count meta row
  (Lesen / Hören / Schreiben / Sprechen). Keep the existing carousel behavior.

### Exam view (`components/exam/ExamApp.tsx`)
- **Header:** Fraunces exam title; the plain `12/35` progress becomes the **Antwortbogen**
  — an answer-sheet bubble grid in the score panel that fills coral as you answer and
  resolves to green (correct) / red-outline (wrong) after grading, with a mono readout
  and an accessible text label. (This is the page's signature element.)
- **Section nav:** sticky **segmented control** (Hören / Lesen / Schreiben / Sprechen);
  active segment filled in accent; each segment shows a small per-section progress
  indicator (dot/fraction). Keeps existing `selectSection` scroll behavior.
- **Question cards:** soft card + left accent status bar + gentle tint for
  correct/wrong/unanswered (replaces full-border swap). Choice items refined
  (larger hit area, clearer selected state). Transcript block restyled.
- **Action bar:** German labels (`Auswerten` / `Lösungen zeigen` / `Neu starten`),
  primary in coral with layered shadow; sits in the existing fixed bar.
- **Summary/results:** refined results card reusing the Antwortbogen + a per-part breakdown.
- **Return bar** (from home into an exam): restyled to match, keep `Zurück zur Auswahl`.

## Accessibility
- Maintain existing focus-visible outlines; ensure new accent-on-cream combos meet
  contrast (coral text on cream, ink on surface — verify AA for body text).
- All motion gated behind `prefers-reduced-motion`.
- Progress ring and status states retain text equivalents (not color-only);
  `aria-live` regions on score/summary preserved.
- Fonts loaded with `display: swap` and a sensible fallback stack to avoid layout shift/FOIT.

## Files touched
- `app/layout.tsx` — wire Fraunces + Inter, expose CSS vars on `<body>`.
- `app/globals.css` — new tokens, texture, motion, and restyled component classes
  (the bulk of the work; existing class names largely reused so JSX churn stays small).
- `components/exam/ExamHome.tsx` — skill icon chips, hero aura markup, card meta.
- `components/exam/ExamApp.tsx` — progress ring, segmented nav, German labels,
  status-bar cards, summary card. New small helper components as needed
  (`ProgressRing`, `Reveal`/`useReveal`).
- Possibly `components/ui/` for shared bits (progress ring, reveal wrapper).

## Testing / verification
- `npm run test` (existing `scripts/__tests__/exam-data.test.ts`) must still pass —
  this redesign is presentational and must not change exam data or grading.
- `npm run dev` and drive both screens: home renders, an exam opens, answering →
  `Auswerten` → `Lösungen zeigen` → `Neu starten` all work; progress ring updates;
  section nav switches; reduced-motion honored.
- Visual check against the warm palette; no horizontal overflow at mobile/desktop widths.

## Non-goals
- No changes to exam content, grading logic, routing, or data shape.
- No new runtime dependencies (fonts via built-in `next/font`).
- Exam *content authoring* and audio work (separate specs) are untouched.
