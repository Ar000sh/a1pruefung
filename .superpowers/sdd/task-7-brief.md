### Task 7: Author Lesen content for `uebungssatz-03`

**Files:**
- Modify: `content/exams/uebungssatz-03/exam.json`

**Interfaces:**
- Produces: the `lesen` key, added as a sibling of `hoeren` from Task 6.

- [ ] **Step 1: Add the `lesen` key**

Open `content/exams/uebungssatz-03/exam.json` and insert this as a new top-level key (a sibling of `"hoeren"`, added right after its closing brace, with a comma separating the two):

```json
"lesen": {
  "teil1": {
    "texte": [
      {
        "titel": "SMS von Marie",
        "text": "Liebe Sonja, ich habe leider keine Zeit für das Kino am Freitag, ich muss meiner Mutter im Garten helfen. Können wir am Samstag ins Kino gehen? Der Film beginnt um 19 Uhr. Ruf mich an! Deine Marie",
        "aussagen": [
          { "nr": 1, "aussage": "Marie hat am Freitag keine Zeit.", "loesung": "richtig" },
          { "nr": 2, "aussage": "Marie möchte am Samstag ins Kino gehen.", "loesung": "richtig" },
          { "nr": 3, "aussage": "Der Film beginnt um 20 Uhr.", "loesung": "falsch" }
        ]
      },
      {
        "titel": "E-Mail von Herrn Klein",
        "text": "Hallo Frau Bauer, das Meeting am Montag findet nicht im Büro statt, sondern im Café Sonne. Bitte bringen Sie Ihren Laptop mit. Wir beginnen um 9 Uhr. Viele Grüße, Herr Klein",
        "aussagen": [
          { "nr": 4, "aussage": "Das Meeting ist im Büro.", "loesung": "falsch" },
          { "nr": 5, "aussage": "Frau Bauer soll ihren Laptop mitbringen.", "loesung": "richtig" }
        ]
      }
    ]
  },
  "teil2": {
    "items": [
      { "nr": 6, "situation": "Herr Yilmaz sucht eine günstige Wohnung in der Stadtmitte, 2 Zimmer.", "anzeige_a": "2-Zimmer-Wohnung, Stadtmitte, 650 Euro warm, ab sofort frei.", "anzeige_b": "3-Zimmer-Wohnung, am Stadtrand, 900 Euro kalt.", "loesung": "a" },
      { "nr": 7, "situation": "Frau Kaya möchte am Wochenende Deutsch lernen, aber nur am Vormittag.", "anzeige_a": "Deutschkurs A1, Montag-Freitag, 9-11 Uhr.", "anzeige_b": "Deutschkurs A1, Samstag, 10-13 Uhr.", "loesung": "b" },
      { "nr": 8, "situation": "Herr Braun sucht einen Job als Koch in einem Restaurant.", "anzeige_a": "Restaurant Adria sucht Koch/Köchin, Vollzeit, ab sofort.", "anzeige_b": "Café Post sucht Kellner/Kellnerin für Wochenenden.", "loesung": "a" },
      { "nr": 9, "situation": "Familie Otto möchte ein gebrauchtes Auto kaufen, nicht zu teuer.", "anzeige_a": "VW Golf, 3 Jahre alt, 8.500 Euro.", "anzeige_b": "Neuer BMW, 35.000 Euro, sofort lieferbar.", "loesung": "a" },
      { "nr": 10, "situation": "Herr Fischer sucht einen Deutschkurs für Anfänger am Abend.", "anzeige_a": "Deutschkurs B2, Dienstag und Donnerstag, 18-20 Uhr.", "anzeige_b": "Deutschkurs A1, Montag und Mittwoch, 18-20 Uhr.", "loesung": "b" }
    ]
  },
  "teil3": {
    "beispiel": { "nr": 0, "schild": "Museum für Geschichte – Geöffnet: Dienstag bis Sonntag, 9-17 Uhr. Montag geschlossen.", "aussage": "Das Museum hat am Montag geöffnet.", "loesung": "falsch" },
    "items": [
      { "nr": 11, "schild": "Restaurant Zur Post – Warme Küche von 12 bis 14 Uhr und von 18 bis 22 Uhr.", "aussage": "Man kann um 15 Uhr warm essen.", "loesung": "falsch" },
      { "nr": 12, "schild": "Bushaltestelle Marktplatz – Bus Linie 5 fährt wegen Bauarbeiten bis 30. August von der Schillerstraße.", "aussage": "Der Bus 5 fährt zurzeit von der Schillerstraße.", "loesung": "richtig" },
      { "nr": 13, "schild": "Schwimmbad Amalienstraße – Kinder unter 8 Jahren nur in Begleitung eines Erwachsenen.", "aussage": "Kleine Kinder dürfen alleine schwimmen.", "loesung": "falsch" },
      { "nr": 14, "schild": "Apotheke am Markt – Notdienst am Wochenende: siehe Aushang an der Tür.", "aussage": "Am Wochenende gibt es einen Notdienst.", "loesung": "richtig" },
      { "nr": 15, "schild": "Parkhaus City – 1. Stunde kostenlos, jede weitere Stunde 2 Euro.", "aussage": "Parken kostet immer Geld.", "loesung": "falsch" }
    ]
  }
}
```

- [ ] **Step 2: Validate the JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/exams/uebungssatz-03/exam.json','utf-8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Check item counts match `PROJEKT.md` §3.2**

Confirm: Teil 1 has 5 scored items (no Beispiel), Teil 2 has 5 scored items (no Beispiel), Teil 3 has 1 Beispiel + 5 scored items — 15 scored items total.

- [ ] **Step 4: Manual checkpoint**

No commit (no git repo configured).

---

