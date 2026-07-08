### Task 11: Run the vocabulary checker and finalize

**Files:**
- Modify: `content/exams/uebungssatz-03/exam.json` (only if flagged words need fixing)

**Interfaces:**
- Consumes: `findUnknownWords`/`buildKnownWordSet` from Task 4, `wordlist.json` from Task 3, `exam.json` from Tasks 6–9.

- [ ] **Step 1: Run the checker**

Run: `npm run check-vocab`
Expected: prints a count and a comma-separated list of words not found in `wordlist.json` and not in the stopword list.

- [ ] **Step 2: Review each flagged word by hand**

For each flagged word, decide: (a) it's a proper noun/number/known-safe word the heuristic can't match (e.g. names like "Julia", "Rossi") — no action needed; (b) it's a real word missing from `wordlist.json` that should genuinely be there — check the PDF, and if it's a genuine A1 wordlist entry the parser missed, fix the parser or hand-add the entry in Task 3's output; (c) it's above-A1 vocabulary that shouldn't be in a new exam — rewrite that part of `exam.json` with simpler wording and re-run Step 1.

- [ ] **Step 3: Re-render after any content changes**

If `exam.json` changed in Step 2, run: `npm run render-exam` again and re-check the affected sections of `exam.md`/`loesungen.md`.

- [ ] **Step 4: Final manual checkpoint**

Confirm: `wordlist.json` exists with all alphabetical entries, `uebungssatz-03`'s `exam.json`/`exam.md`/`loesungen.md` are complete and internally consistent, and the vocabulary check has been reviewed (not necessarily zero flags — heuristic, not a gate, per spec §6). No commit (no git repo configured).
