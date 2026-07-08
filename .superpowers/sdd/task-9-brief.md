### Task 9: Author Sprechen content for `uebungssatz-03`

**Files:**
- Modify: `content/exams/uebungssatz-03/exam.json`

**Interfaces:**
- Produces: the `sprechen` key, completing the `Exam` shape from Task 5. After this task, `content/exams/uebungssatz-03/exam.json` is the full, final input for Tasks 10 and 11.

- [ ] **Step 1: Add the `sprechen` key**

Insert as a new top-level key (sibling of `"schreiben"`), completing the file:

```json
"sprechen": {
  "teil1": {
    "beschreibung": "Stellen Sie sich vor: Name, Herkunft, Wohnort, Sprachen, Hobby. Buchstabieren Sie Ihren Namen. Nennen Sie eine Nummer (Telefon, Handy oder Hausnummer).",
    "fragen": [
      "Wie heißen Sie?",
      "Woher kommen Sie?",
      "Wo wohnen Sie?",
      "Welche Sprachen sprechen Sie?",
      "Was ist Ihr Hobby?",
      "Können Sie Ihren Namen buchstabieren?",
      "Wie ist Ihre Telefonnummer?"
    ]
  },
  "teil2": {
    "themen": [
      { "thema": "Einkaufen", "karten": ["Obst", "Kleidung", "Supermarkt", "Geld", "Geschäft", "Lebensmittel"] },
      { "thema": "Wohnen", "karten": ["Miete", "Zimmer", "Möbel", "Adresse", "Nachbarn", "Wohnung"] }
    ]
  },
  "teil3": {
    "bildkarten": [
      { "beschreibung": "Ein Fenster ist offen, es ist kalt im Zimmer.", "beispielbitte": "Kannst du bitte das Fenster zumachen?" },
      { "beschreibung": "Eine Tasche ist sehr schwer.", "beispielbitte": "Kannst du mir bitte helfen, die Tasche zu tragen?" }
    ]
  }
}
```

- [ ] **Step 2: Validate the JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/exams/uebungssatz-03/exam.json','utf-8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Check against `PROJEKT.md` §3.4**

Confirm Teil 1 covers all required ritual elements (Name, Herkunft, Wohnort, Sprachen, Hobby, buchstabieren, Nummer), Teil 2 has 2 Themen with 6 Karten each, Teil 3 has 2 Bildkarten each pairing a situation with an example Bitte.

- [ ] **Step 4: Manual checkpoint**

No commit (no git repo configured).

---

