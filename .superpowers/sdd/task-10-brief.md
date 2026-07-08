### Task 10: Render the finished exam to Markdown and review

**Files:**
- Create: `content/exams/uebungssatz-03/exam.md` (generated)
- Create: `content/exams/uebungssatz-03/loesungen.md` (generated)

**Interfaces:**
- Consumes: `renderExamMarkdown`/`renderLoesungenMarkdown` from Task 5, the completed `exam.json` from Tasks 6–9.

- [ ] **Step 1: Run the renderer**

Run: `npm run render-exam`
Expected: `Rendered content/exams/uebungssatz-03/exam.md and content/exams/uebungssatz-03/loesungen.md`

- [ ] **Step 2: Read `exam.md` end to end**

Confirm it reads naturally as a candidate-facing practice sheet: all 4 sections present (Hören, Lesen, Schreiben, Sprechen), no `loesung`/answer values leaking into it (other than the parts of the source texts that legitimately contain the answer, e.g. Schreiben Teil 1's Ausgangstext).

- [ ] **Step 3: Read `loesungen.md` end to end**

Confirm every scored item number (1–15 Hören, 1–15 Lesen, plus Beispiele) has a matching answer line, and Schreiben has both the 5 form-field answers and the Musterlösung text.

- [ ] **Step 4: Manual checkpoint**

No commit (no git repo configured).

---

