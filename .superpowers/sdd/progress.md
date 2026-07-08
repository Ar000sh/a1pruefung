# Progress Ledger — Phase 1: Wordlist + uebungssatz-03

Plan: docs/superpowers/plans/2026-07-04-phase1-wordlist-und-uebungssatz.md
No git repository in this project (by user decision) — tasks are tracked here instead of via commits.

Task 1: complete (scaffold + raw extraction). Review: Approved. Note: raw file has CRLF line endings; Task 2's parser handles this via `split(/\r?\n/)` — confirmed already in plan, no fix needed. Plan's Task 1 Step 5 expected line numbers were wrong (217-219 -> corrected to 637-639, content/order were always correct); fixed in plan + brief.
Task 2: complete (extract-wordlist.ts + 6 tests). Review: Approved, byte-exact transcription confirmed via diff. Watch-items for Task 3 spot-check: (a) wortart classification untested by the suite, (b) missing-article detector only fires with an inline plural marker present -- a bare capitalized noun without one would silently merge into the previous entry's beispiele instead of warning. Not fixed (accepted heuristic tradeoff per spec's known-limitations), just flagged for the human spot-check step.
