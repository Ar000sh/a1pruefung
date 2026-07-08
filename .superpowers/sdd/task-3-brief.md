### Task 3: Run the parser on the real PDF text and spot-check the output

**Files:**
- Create: `data/wordlist/wordlist.json` (generated)
- Create: `data/wordlist/warnings.json` (generated)

**Interfaces:**
- Consumes: `parseWordlist` from Task 2, `data/wordlist/raw/wortliste_raw.txt` from Task 1.
- Produces: `data/wordlist/wordlist.json` — consumed by Task 4 (`check-vocab.ts`) and by content authoring in Tasks 6–9.

- [ ] **Step 1: Run the extractor**

Run: `npm run extract-wordlist`
Expected: prints `Parsed <N> entries, <M> warnings.` with N in the hundreds (roughly 650–750, since Nebeneinträge are now flat top-level entries instead of nested).

- [ ] **Step 2: Inspect the warnings file**

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('data/wordlist/warnings.json','utf-8')).length)"`

Read through `data/wordlist/warnings.json` by hand. Each entry flags a line the parser wasn't fully sure about (e.g. the `Satz, -ä, e` missing-article case from Task 2's test). For each warning, check the original PDF (`examples/A1_SD1_Wortliste_02.pdf`) and, if the parsed entry is wrong, hand-correct the corresponding object directly in `data/wordlist/wordlist.json`.

- [ ] **Step 3: Spot-check known tricky sections**

Run:
```bash
grep -A6 '"word": "danken"' data/wordlist/wordlist.json
grep -A6 '"word": "Beispiel"' data/wordlist/wordlist.json
```

Confirm against the PDF that `danken` has example `"Ich danke Ihnen für die Einladung."`, that a separate `der Dank` entry has two examples (`Vielen Dank!`, `Herzlichen Dank!`), and that the Beispiel-related entries read sensibly (per Task 2's wrap-join test).

- [ ] **Step 4: Manual checkpoint**

Confirm entry count and spot-checks look right. No commit (no git repo configured).

---

