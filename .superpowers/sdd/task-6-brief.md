### Task 6: Author Hören content for `uebungssatz-03`

**Files:**
- Create: `content/exams/uebungssatz-03/exam.json`

**Interfaces:**
- Produces: the `hoeren` key of the `Exam` shape from Task 5. Tasks 7–9 add sibling keys (`lesen`, `schreiben`, `sprechen`) to this same file.

- [ ] **Step 1: Write the file**

Create `content/exams/uebungssatz-03/exam.json`:

```json
{
  "id": "uebungssatz-03",
  "hoeren": {
    "teil1": {
      "beispiel": {
        "nr": 0,
        "dialog": [
          { "sprecher": "Verkäuferin", "text": "Guten Tag, kann ich Ihnen helfen?" },
          { "sprecher": "Kundin", "text": "Ja, was kostet diese Tasche?" },
          { "sprecher": "Verkäuferin", "text": "Die Tasche kostet 55 Euro." },
          { "sprecher": "Kundin", "text": "Das ist aber teuer! Haben Sie auch eine kleinere?" },
          { "sprecher": "Verkäuferin", "text": "Ja, die kleine Tasche kostet nur 15 Euro." }
        ],
        "frage": "Wie viel kostet die große Tasche?",
        "optionen": { "a": "15 Euro", "b": "50 Euro", "c": "55 Euro" },
        "loesung": "c",
        "hoerdurchgaenge": 2
      },
      "items": [
        {
          "nr": 1,
          "dialog": [
            { "sprecher": "A", "text": "Hallo, wann beginnt der Film heute Abend?" },
            { "sprecher": "B", "text": "Der Film beginnt um 20 Uhr 30. Um 20 Uhr ist noch Werbung." },
            { "sprecher": "A", "text": "Gut, dann komme ich um 20 Uhr." }
          ],
          "frage": "Wann beginnt der Film?",
          "optionen": { "a": "um 19 Uhr", "b": "um 20 Uhr", "c": "um 20 Uhr 30" },
          "loesung": "c",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 2,
          "dialog": [
            { "sprecher": "Kellner", "text": "Was möchten Sie trinken?" },
            { "sprecher": "Gast", "text": "Haben Sie Kaffee?" },
            { "sprecher": "Kellner", "text": "Ja, Kaffee oder Tee." },
            { "sprecher": "Gast", "text": "Dann bitte einen Tee, aber ohne Zucker." }
          ],
          "frage": "Was trinkt der Gast?",
          "optionen": { "a": "Kaffee", "b": "Tee", "c": "Wasser" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 3,
          "dialog": [
            { "sprecher": "A", "text": "Hast du Kinder?" },
            { "sprecher": "B", "text": "Ja, ich habe drei Kinder. Zwei Söhne und eine Tochter." }
          ],
          "frage": "Wie viele Kinder hat die Frau?",
          "optionen": { "a": "zwei", "b": "drei", "c": "vier" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 4,
          "dialog": [
            { "sprecher": "A", "text": "Entschuldigung, wo ist das Büro von Herrn Klein?" },
            { "sprecher": "B", "text": "Das Büro ist im dritten Stock, Zimmer 305." },
            { "sprecher": "A", "text": "Im dritten Stock, danke!" }
          ],
          "frage": "In welchem Stock ist das Büro?",
          "optionen": { "a": "im zweiten Stock", "b": "im dritten Stock", "c": "im vierten Stock" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 5,
          "dialog": [
            { "sprecher": "A", "text": "Wann fährt der nächste Zug nach Hamburg?" },
            { "sprecher": "B", "text": "Um 9 Uhr 15 fährt ein Zug, aber der ist schon voll. Der nächste fährt um 10 Uhr 15." },
            { "sprecher": "A", "text": "Gut, dann nehme ich den Zug um 10 Uhr 15." }
          ],
          "frage": "Wann fährt der Zug, den der Mann nimmt?",
          "optionen": { "a": "um 9 Uhr 15", "b": "um 9 Uhr 50", "c": "um 10 Uhr 15" },
          "loesung": "c",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 6,
          "dialog": [
            { "sprecher": "A", "text": "Was kosten die Äpfel?" },
            { "sprecher": "B", "text": "Ein Kilo Äpfel kostet 2 Euro 50." },
            { "sprecher": "A", "text": "Dann nehme ich zwei Kilo, bitte." }
          ],
          "frage": "Wie viel kostet ein Kilo Äpfel?",
          "optionen": { "a": "1,50 Euro", "b": "2,50 Euro", "c": "3,00 Euro" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        }
      ]
    },
    "teil2": {
      "beispiel": {
        "nr": 0,
        "durchsage": "Achtung, eine Durchsage. Der Zug nach München, Abfahrt 14 Uhr 20, fährt heute von Gleis 7.",
        "aussage": "Der Zug nach München fährt von Gleis 7.",
        "loesung": "richtig"
      },
      "items": [
        {
          "nr": 7,
          "durchsage": "Achtung, liebe Fluggäste. Der Flug nach Berlin hat 30 Minuten Verspätung. Bitte warten Sie am Ausgang.",
          "aussage": "Der Flug nach Berlin hat keine Verspätung.",
          "loesung": "falsch",
          "hoerdurchgaenge": 1
        },
        {
          "nr": 8,
          "durchsage": "Der Bus Linie 12 nach Hauptbahnhof fällt heute wegen einer Baustelle aus. Bitte nehmen Sie die Linie 14.",
          "aussage": "Die Buslinie 12 fährt heute nicht.",
          "loesung": "richtig",
          "hoerdurchgaenge": 1
        },
        {
          "nr": 9,
          "durchsage": "Achtung, Achtung! Bitte verlassen Sie sofort ruhig das Gebäude durch den nächsten Notausgang. Benutzen Sie nicht den Aufzug.",
          "aussage": "Man soll den Aufzug benutzen.",
          "loesung": "falsch",
          "hoerdurchgaenge": 1
        },
        {
          "nr": 10,
          "durchsage": "Wir haben eine schwarze Tasche gefunden. Bitte melden Sie sich beim Fundbüro, Schalter 3.",
          "aussage": "Die gefundene Tasche ist schwarz.",
          "loesung": "richtig",
          "hoerdurchgaenge": 1
        }
      ]
    },
    "teil3": {
      "items": [
        {
          "nr": 11,
          "nachricht": "Hallo Lisa, hier ist Tom. Ich kann heute Abend leider nicht kommen, ich muss länger arbeiten. Können wir uns morgen treffen? Ruf mich zurück!",
          "frage": "Warum kann Tom heute Abend nicht kommen?",
          "optionen": { "a": "Er ist krank.", "b": "Er muss arbeiten.", "c": "Er hat keine Zeit für Lisa." },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 12,
          "nachricht": "Guten Tag, hier ist die Praxis Dr. Meyer. Ihr Termin am Montag ist leider abgesagt. Bitte rufen Sie uns an, wir machen einen neuen Termin für Mittwoch.",
          "frage": "Was soll die Person machen?",
          "optionen": { "a": "Zur Praxis kommen", "b": "Die Praxis anrufen", "c": "Am Montag zum Termin kommen" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 13,
          "nachricht": "Hallo Mama, hier ist Anna. Wir kommen am Samstag zum Geburtstag, aber wir bringen auch die Kinder mit. Ist das okay? Bis bald!",
          "frage": "Was möchte Anna wissen?",
          "optionen": { "a": "Ob die Kinder mitkommen dürfen", "b": "Wann der Geburtstag ist", "c": "Wer noch kommt" },
          "loesung": "a",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 14,
          "nachricht": "Hier ist Herr Wagner von der Firma Schmidt. Die Besprechung morgen beginnt nicht um 10 Uhr, sondern erst um 11 Uhr. Bitte informieren Sie die anderen Kollegen.",
          "frage": "Wann beginnt die Besprechung?",
          "optionen": { "a": "um 10 Uhr", "b": "um 11 Uhr", "c": "um 10 Uhr 30" },
          "loesung": "b",
          "hoerdurchgaenge": 2
        },
        {
          "nr": 15,
          "nachricht": "Hi, ich bin's, Paul. Mein Zug hat Verspätung, ich komme erst um 18 Uhr am Bahnhof an. Kannst du mich abholen?",
          "frage": "Was möchte Paul?",
          "optionen": { "a": "Dass jemand ihn abholt", "b": "Dass jemand ihm eine SMS schreibt", "c": "Dass jemand den Zug nimmt" },
          "loesung": "a",
          "hoerdurchgaenge": 2
        }
      ]
    }
  }
}
```

- [ ] **Step 2: Validate the JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/exams/uebungssatz-03/exam.json','utf-8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Check item counts match `PROJEKT.md` §3.1**

Confirm: Teil 1 has 1 Beispiel + 6 scored items, Teil 2 has 1 Beispiel + 4 scored items, Teil 3 has 5 scored items (no Beispiel) — 15 scored items total.

- [ ] **Step 4: Manual checkpoint**

No commit (no git repo configured).

---

