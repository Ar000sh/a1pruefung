# Next.js Exam App Design

## Goal

Build a Next.js web application for the generated Goethe A1 practice exam so a learner can complete the whole exam in the browser, resolve the attempt, review correct answers, and redo the exam. The first version uses the local `uebungssatz-03` JSON exam data, while keeping the app structure ready for later Supabase-backed exam storage, generated audio assets, and speaking-agent practice.

## Scope

### In Scope for v1

- A Next.js application inside this repository.
- One full-exam experience for `content/exams/uebungssatz-03/exam.json`.
- Sections for `Hören`, `Lesen`, `Schreiben`, and `Sprechen`.
- Objective grading for:
  - Hören multiple-choice and richtig/falsch items.
  - Lesen richtig/falsch and a/b selection items.
  - Schreiben Teil 1 form fields.
- Self-review handling for:
  - Schreiben Teil 2 free writing.
  - Sprechen prompts and cards.
- A `Resolve` button that grades the complete attempt.
- A `Show answers` button, available after resolving, that reveals correct answers, transcripts, model answer, and speaking prompt examples.
- A `Redo exam` button that clears all user answers and grading state.
- Transcript-based Hören playback controls using browser text-to-speech where available.
- A data-access boundary that reads from local JSON now and can later be replaced by Supabase reads.

### Out of Scope for v1

- Supabase database schema, auth, RLS policies, migrations, or package integration.
- Persistent user accounts or saved attempts.
- Real generated MP3 audio files.
- Live voice agents.
- Automatic grading for free-writing or speaking answers.
- Generated image assets, because the current `uebungssatz-03` speaking cards use text descriptions rather than image prompts.

## Architecture

Use a standard Next.js app with a small set of focused modules:

- `app/page.tsx`: main exam page and layout composition.
- `components/exam/*`: UI components for section navigation, Hören, Lesen, Schreiben, Sprechen, grading summary, and action buttons.
- `lib/exams.ts`: exam-loading boundary. In v1 this imports/reads local JSON. Later this can call Supabase without changing the UI components.
- `lib/grading.ts`: pure grading functions for objective items and score summaries.
- `lib/types.ts`: shared TypeScript types that mirror the exam JSON shape and future-proof optional media/agent fields.
- `content/exams/uebungssatz-03/exam.json`: source content for v1.

The UI should not read JSON directly. Components receive typed exam data and attempt state. This keeps later Supabase integration contained to `lib/exams.ts` and future server/client data-fetching code.

## Data Model Direction

The existing JSON remains the source of truth for v1. Types should preserve current fields and allow optional future fields:

- `audioUrl?: string` for generated Hören audio files.
- `imageUrl?: string` for future image-card prompts.
- `roleplayPrompt?: string` for future speaking partner-agent setup.
- `partnerRole?: string` for future speaking partner-agent behavior.
- `teacherRubric?: string` for future teacher-agent feedback.
- `recordingUrl?: string` for future saved speaking attempts.
- `agentFeedback?: string` for future speaking/writing assessment output.

Future Supabase tables can map naturally from these concepts:

- `exams`
- `exam_sections`
- `exam_items`
- `exam_attempts`
- `exam_answers`
- Supabase Storage buckets for generated audio and images.

No Supabase-specific code is added in v1. When Supabase work begins, current Supabase documentation must be checked before choosing packages, SSR helpers, auth behavior, and RLS policies.

## User Experience

The first screen is the usable exam, not a marketing page. The layout should feel like a serious exam trainer:

- A persistent section navigator shows `Hören`, `Lesen`, `Schreiben`, and `Sprechen`.
- The main panel displays one section at a time or scrolls through all sections with anchor navigation.
- A compact progress/score area shows answered counts before resolving and scores after resolving.
- `Resolve` stays available near the bottom and should also be reachable from a sticky action area on desktop/mobile.
- After resolving:
  - correct objective responses are marked green.
  - wrong objective responses are marked red.
  - unanswered objective responses are marked amber/neutral.
  - correct answers remain hidden until `Show answers` is clicked.
- `Show answers` reveals answer keys and model responses.
- `Redo exam` clears local state and returns the page to an unresolved attempt.

The design should be dense enough for repeated study but not cramped. Avoid a decorative landing-page style. Cards are acceptable for individual questions, not nested page sections.

## Hören Audio Strategy

V1 uses transcript-first playback:

- Each Hören item renders the transcript in speaker order.
- A `Play transcript` control uses browser `speechSynthesis` if available.
- If browser TTS is unavailable, the transcript remains visible and the UI shows that playback is unavailable.
- The number of intended listening passes (`hoerdurchgaenge`) remains visible.

Later generated human-like audio can be added by generating item-level audio files and attaching `audioUrl` to Hören items. The UI should prefer `audioUrl` when present and fall back to transcript TTS.

## Sprechen Agent Strategy

V1 treats Sprechen as guided practice, not auto-graded speaking:

- Teil 1 renders introduction prompts.
- Teil 2 renders topic cards.
- Teil 3 renders request/reaction cards and example requests.
- The learner can mark Sprechen as practiced or enter short notes.
- After `Show answers`, examples and guidance are visible.

Future agent layer:

- **Partner agent:** acts as a second exam participant for roleplay/card exercises, asking and answering at A1 level.
- **Teacher agent:** reviews after the speaking attempt, grades with a Goethe-style rubric, explains corrections, and gives an improved sample answer.
- **Modes:** exam mode does not interrupt; practice mode uses the partner agent; review mode uses the teacher agent after the attempt.

The v1 speaking component should be named and shaped so this future integration can replace or extend its inner panel without changing the rest of the exam app.

## Grading Rules

Objective items are graded exactly against the `loesung` value in JSON:

- Radio selections compare selected option string to `loesung`.
- Richtig/falsch selections compare selected value to `loesung`.
- Schreiben Teil 1 text inputs compare normalized user input to the expected field value.

Normalization for form fields:

- trim whitespace.
- compare case-insensitively.
- accept exact punctuation/date formatting from the expected value for v1.

Schreiben Teil 2 and Sprechen are completion/review sections:

- They do not count as correct/incorrect objective points in v1.
- They appear in the summary as review-required or practiced.
- Their model answers/examples appear only after `Show answers`.

## Testing Requirements

Use test-first implementation for behavior modules:

- `lib/grading.ts` must have Node tests for correct, wrong, unanswered, and normalized form-field cases.
- Exam data adaptation/loading should have a test that confirms the v1 exam contains all four sections and expected item counts.
- UI-level verification should include at least one browser/manual run where:
  - answers can be selected/entered.
  - `Resolve` marks correct/wrong states.
  - `Show answers` reveals correct answers.
  - `Redo exam` clears state.

If a browser automation tool is available during implementation, verify the Next.js page with a screenshot or DOM check. If not, document the manual verification performed.

## Constraints

- Keep the app Supabase-ready but do not add Supabase dependencies in v1.
- Do not introduce generated audio or image assets unless the current exam data requires them.
- Keep local exam content separate from UI logic.
- Preserve UTF-8 for German text.
- Avoid copying original Goethe exam content; this app displays the newly generated `uebungssatz-03` content.
- Work in `main` per user instruction.

