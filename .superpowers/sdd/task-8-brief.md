### Task 8: Author Schreiben content for `uebungssatz-03`

**Files:**
- Modify: `content/exams/uebungssatz-03/exam.json`

**Interfaces:**
- Produces: the `schreiben` key, added as a sibling of `hoeren`/`lesen`.

- [ ] **Step 1: Add the `schreiben` key**

Insert as a new top-level key (sibling of `"lesen"`):

```json
"schreiben": {
  "teil1": {
    "ausgangstext": "Das ist Frau Elena Rossi. Sie kommt aus Italien und ist Verkäuferin von Beruf. Sie ist am 3. Mai 1990 geboren.",
    "formularfelder": [
      { "feld": "Nachname", "loesung": "Rossi" },
      { "feld": "Vorname", "loesung": "Elena" },
      { "feld": "Herkunftsland", "loesung": "Italien" },
      { "feld": "Beruf", "loesung": "Verkäuferin" },
      { "feld": "Geburtsdatum", "loesung": "3.5.1990" }
    ]
  },
  "teil2": {
    "situation": "Sie können am Samstag nicht zur Geburtstagsfeier von Ihrer Freundin Julia kommen. Schreiben Sie Julia eine Nachricht.",
    "inhaltspunkte": [
      "Warum schreiben Sie?",
      "Sagen Sie, warum Sie nicht kommen können.",
      "Fragen Sie, ob Sie Julia am Sonntag besuchen können."
    ],
    "musterloesung": "Liebe Julia, ich schreibe dir, weil ich am Samstag leider nicht zu deiner Geburtstagsfeier kommen kann. Ich bin dieses Wochenende krank und muss zu Hause bleiben. Kann ich dich am Sonntag besuchen? Ich habe ein Geschenk für dich! Liebe Grüße, Elena"
  }
}
```

- [ ] **Step 2: Validate the JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/exams/uebungssatz-03/exam.json','utf-8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Check against `PROJEKT.md` §3.3**

Confirm Teil 1 has exactly 5 form fields, and Teil 2's situation contains exactly 3 Inhaltspunkte in the fixed order: (1) Grund, (2) Aussage/Info, (3) Frage.

- [ ] **Step 4: Manual checkpoint**

No commit (no git repo configured).

---

