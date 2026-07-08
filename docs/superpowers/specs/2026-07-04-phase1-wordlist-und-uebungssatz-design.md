# Phase 1: Strukturierte Wortliste + erster neuer Übungssatz – Design

Status: approved (2026-07-04)
Baut auf: `PROJEKT.md` (Analyse der Original-Prüfungen und Wortliste)

## 1. Ziel dieser Phase

Aus dem bestehenden `PROJEKT.md` (Analyse) den ersten konkreten, nutzbaren Schritt umsetzen:

1. Die offizielle Wortliste als sauberes, strukturiertes JSON verfügbar machen.
2. Einen kompletten neuen Übungssatz (Hören/Lesen/Schreiben/Sprechen) erstellen, exakt im Format der Originale, ausschließlich mit Vokabular aus der strukturierten Wortliste.
3. Alles als lesbares Markdown (Kandidatenblätter + Lösungen) rendern, damit sofort ohne UI geübt werden kann.

UI/Interaktivität, Auswertungs-Engine und TTS-Anbindung sind **nicht** Teil dieser Phase (siehe `PROJEKT.md` §9.4) – die JSON-Schemas hier sind aber bewusst so gebaut, dass eine spätere Engine `loesung`-Felder direkt auslesen kann.

## 2. Vorarbeit: Extraktionsproblem in `extracted/*.txt` (bereits verifiziert)

Die bestehende Extraktion (`pdftotext -layout`) hat zwei Probleme, beide am Original-PDF gegengetestet:

- **Encoding**: Datei ist Latin-1/CP1252 statt UTF-8 (`für` → `f�r`).
- **Wort/Beispiel-Verschiebung**: `-layout` reißt die zweispaltige Wortliste (Wort | Beispielsatz) teils komplett durcheinander (z. B. `beide`/`Bein`/`Beispiel`-Abschnitt vollständig verschachtelt, nicht nur off-by-one).

**Fix, bereits getestet und funktionsfähig**: `pdftotext -enc UTF-8 -raw examples/A1_SD1_Wortliste_02.pdf` liefert korrektes Encoding UND korrekte Wort/Beispiel-Zuordnung (verifiziert an `danken/der Dank/danke` und weiteren Stichproben). `extracted/` bleibt unverändert als Altbestand liegen; neue saubere Rohdaten kommen nach `data/wordlist/raw/`.

## 3. Pipeline

```
examples/A1_SD1_Wortliste_02.pdf
  │  pdftotext -enc UTF-8 -raw
  ▼
data/wordlist/raw/wortliste_raw.txt
  │  scripts/extract-wordlist.ts (Parser: Seitenumbrüche/Header filtern,
  │  Einträge + mehrzeilige Beispielsätze gruppieren)
  ▼
data/wordlist/wordlist.json
  │  (Referenz-Vokabular für Content-Autoring)
  ▼
content/exams/uebungssatz-03/exam.json   ← von mir (Claude) verfasst,
  │                                          Format nach PROJEKT.md §3,
  │                                          Vokabular nur aus wordlist.json
  │  scripts/check-vocab.ts (Heuristik-Diff gegen wordlist.json)
  │  scripts/render-exam.ts
  ▼
content/exams/uebungssatz-03/exam.md + loesungen.md
```

## 4. Datenschemas

### 4.1 `wordlist.json`

**Update nach Implementierungs-Recherche:** Die ursprünglich hier geplanten Felder `thema`, `wortgruppe` und eine `verwandte`-Verschachtelung für Nebeneinträge wurden getestet und als nicht zuverlässig automatisierbar verworfen (s. u.). Tatsächliches Schema: ein flaches Array, **jede** Zeile der alphabetischen Liste (Haupt- und Nebeneintrag) wird ein eigener Top-Level-Eintrag:

```json
{
  "word": "danken",
  "artikel": null,
  "plural": null,
  "wortart": "verb",
  "beispiele": ["Ich danke Ihnen für die Einladung."]
}
```

`der Dank` und `danke` (die Nebeneinträge derselben Wortfamilie) erscheinen im Array als eigene, unabhängige Einträge, nicht verschachtelt.

Warum die Änderung:
- **Keine Wortfamilien-Verschachtelung**: Zuverlässiges automatisches Gruppieren von Haupt- und Nebeneintrag (z. B. `danken`/`der Dank`/`danke`) erfordert Stamm-/Fuzzy-Matching, das in Stichproben zu viele Fehlklassifizierungen produziert hätte (z. B. `das Bein`/`das Beispiel` teilen ein Präfix, sind aber keine Wortfamilie). Die Spec erlaubte bereits, uneindeutige Fälle flach zu lassen – nach Recherche ist praktisch jeder Fall uneindeutig genug, um das generell zu tun.
- **Kein `thema`/`wortgruppe`**: Die Wortgruppenliste (13 Kategorien: Zahlen, Wochentage, Länder/Nationalitäten, Farben, …) hat pro Kategorie ein eigenes, uneinheitliches Tabellenlayout im PDF (z. B. Zahlen als drei parallele Spalten Zahl/„=„/Wort, die bei `pdftotext -raw` als drei aufeinanderfolgende Blöcke statt zeilenweise extrahiert werden; andere Kategorien wie Länder haben Dreier-Tupel Land/Bewohner/Nationalität). Das automatisiert zu parsen wäre ein eigenes, größeres Sub-Projekt und ist bewusst **nicht Teil dieser Phase**. Die alphabetische Liste selbst enthält ohnehin keine Thema-Zuordnung pro Wort.
- `artikel`/`plural`: aus dem Originaltext übernommen, wo angegeben (z. B. `das Dorf, -ö, er`).

### 4.2 Exam-JSON (`content/exams/<id>/exam.json`)

Ein File pro Übungssatz, Struktur folgt `PROJEKT.md` §3 (Teile, Item-Anzahl, Aufgabentypen):

```json
{
  "id": "uebungssatz-03",
  "hoeren": {
    "teil1": { "items": [
      { "nr": 0, "beispiel": true,
        "sprecher_dialog": [
          { "sprecher": "A", "text": "..." },
          { "sprecher": "B", "text": "..." }
        ],
        "frage": "...", "optionen": ["a", "b", "c"], "loesung": "b",
        "hoerdurchgaenge": 2 }
    ]}
  },
  "lesen": { "teil1": { "...": "analog Aufbau, Teil 1-3 nach PROJEKT.md §3.2" } },
  "schreiben": {
    "teil1": { "ausgangstext": "...", "formularfelder": [{ "feld": "...", "loesung": "..." }] },
    "teil2": { "situation": "...", "inhaltspunkte": ["...", "...", "..."] }
  },
  "sprechen": { "teil2_themen": [...], "teil3_bildkarten": [...] }
}
```

Lösungen bleiben inline (`loesung`-Felder) statt in separater Datei — es gibt in Phase 1 keine Auto-Grading-Engine, ein Mensch braucht Frage und Antwort nebeneinander. Kann später problemlos umsortiert werden, eine Korrektur-Engine würde `loesung` direkt aus demselben JSON lesen.

## 5. Verzeichnisstruktur

```
geothe/
├── PROJEKT.md
├── examples/                           # Original-PDFs (unverändert)
├── extracted/                          # alte, fehlerhafte Extraktion (Altbestand, unverändert)
├── data/
│   └── wordlist/
│       ├── raw/wortliste_raw.txt       # pdftotext -enc UTF-8 -raw
│       └── wordlist.json
├── content/
│   └── exams/
│       └── uebungssatz-03/
│           ├── exam.json
│           ├── exam.md
│           └── loesungen.md
├── scripts/                            # Node.js/TypeScript
│   ├── extract-wordlist.ts             # raw txt -> wordlist.json
│   ├── check-vocab.ts                  # exam.json Vokabular vs. wordlist.json
│   └── render-exam.ts                  # exam.json -> exam.md + loesungen.md
├── package.json
└── tsconfig.json
```

## 6. Validierung / "Tests"

Diese Phase hat überwiegend Prosa-Content, keine klassische Programmlogik – Validierung sieht entsprechend anders aus als Unit-Tests:

- **Parser-Stichprobe**: nach Lauf von `extract-wordlist.ts` mind. die bereits identifizierten Problemstellen (`danken/Dank/danke`, `beide/Bein/Beispiel`-Bereich) manuell gegen das Original-PDF gegenchecken.
- **`check-vocab.ts`**: heuristischer Diff, kein Pass/Fail-Gate. Deutsche Flexion (Kasus, Konjugation, Plural) macht einen naiven String-Vergleich zwangsläufig unpräzise (False Positives bei flektierten Formen). Ergebnis ist eine Liste zur manuellen Durchsicht, keine automatische Garantie.
- **Formatgleichheit**: `exam.json` muss in Teileanzahl/Itemanzahl exakt `PROJEKT.md` §3 entsprechen (z. B. Hören Teil 1 = Items 1–6 inkl. Beispiel „0").

## 7. Bekannte Grenzen (bewusst akzeptiert, keine Blocker)

- Haupt-/Nebeneintrag-Unterscheidung ist aus Plain-Text nicht zuverlässig rekonstruierbar (keine Fett/Einrückungs-Info mehr vorhanden) → alle Einträge bleiben flach, keine automatische Wortfamilien-Gruppierung, s. §4.1.
- `thema`/`wortgruppe` werden in dieser Phase gar nicht befüllt – die Wortgruppenliste wird nicht automatisiert geparst (uneinheitliches Tabellenlayout pro Kategorie, s. §4.1). Käme später als eigenes Sub-Projekt in Frage, falls gewünscht.
- Kein Audio – Hören-Inhalte sind Transkript/Skript, TTS-Anbindung ist spätere Phase (bereits in `PROJEKT.md` §8.2 so entschieden, hier nur die Konsequenz: Sprecherlabels von Anfang an sauber gesetzt).
- `check-vocab.ts` ersetzt keine menschliche Prüfung (s. §6).

## 8. Nicht Teil dieser Phase

- UI/Web-App, automatische Auswertung, TTS-Vertonung (siehe `PROJEKT.md` §9.4 – eigene, spätere Spec).
- Vokabeltrainer/Spaced-Repetition-Oberfläche.
- Weitere Übungssätze über `uebungssatz-03` hinaus (Architektur erlaubt das, aber kein Ziel dieser Phase).
