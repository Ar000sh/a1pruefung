# Phase 2: Original-Prüfungssätze digitalisieren + in die App einbinden – Design

Status: approved (2026-07-09)
Baut auf: `PROJEKT.md` (Analyse), Phase-1-Spec `2026-07-04-phase1-wordlist-und-uebungssatz-design.md`, bestehende App (`lib/`, `components/`, `app/`).

## 1. Ziel dieser Phase

Die drei **originalen** Goethe-A1-Beispielprüfungen aus `examples/` als strukturierte `exam.json`-Dateien im bestehenden `Exam`-Schema (`lib/types.ts`) verfügbar machen — inhaltsgetreu, damit der Lernende auf den echten Prüfungssätzen üben kann — und alle in die bestehende Trainer-App einbinden, sodass zwischen den Sätzen gewählt werden kann.

Bereits vorhanden: `uebungssatz-03` (neu generiert, Phase 1). Neu in dieser Phase:

| ID | Quelle-PDF | Rohtext |
|---|---|---|
| `modellsatz` | `examples/sd_1_modellsatz.pdf` | `data/exams-raw/sd_1_modellsatz.txt` |
| `uebungssatz-01` | `examples/sd_1_uebungssatz01.pdf` | `data/exams-raw/sd_1_uebungssatz01.txt` |
| `uebungssatz-02` | `examples/sd_1_uebungssatz02.pdf` | `data/exams-raw/sd_1_uebungssatz02.txt` |

**Rechtlicher Hinweis (aus `PROJEKT.md` §7):** Die Originaltexte sind Copyright Goethe-Institut/telc. Inhaltsgetreue Digitalisierung ist für **privates Üben** in Ordnung; die Inhalte werden nicht öffentlich 1:1 weiterverbreitet. Dies ist bewusst akzeptiert (Nutzerentscheidung 2026-07-09).

## 2. Kein Schema-Change

Das bestehende `Exam`-Interface (`lib/types.ts`) passt unverändert — die neuen Sätze nutzen exakt dieselbe Struktur wie `uebungssatz-03`. Keine Änderung an `types.ts`, `grading.ts`, `render-exam.ts`.

## 3. Datenquelle

Neue, saubere Extraktion (bereits ausgeführt):

```
pdftotext -enc UTF-8 -raw examples/sd_1_<satz>.pdf data/exams-raw/sd_1_<satz>.txt
```

Die alten `extracted/*.txt` (Latin-1-defekt, `für` → `f�r`) werden **nicht** verwendet und bleiben als Altbestand liegen. Die neue `data/exams-raw/` ist die alleinige Transkriptionsquelle.

## 4. Inhaltstreue-Regeln pro Prüfungsteil

Jede `exam.json` wird **von Hand** aus dem jeweiligen Rohtext transkribiert (kein automatischer Parser — die Prüfungs-PDFs haben pro Teil zu heterogenes Layout, ein Parser wäre unzuverlässiger als sorgfältige manuelle Übertragung).

- **Hören Teil 1–3:** Dialoge/Durchsagen/Nachrichten wörtlich aus dem Transkriptionsteil des PDFs (Abschnitt „Transkriptionen zum Tonträger"). Fragen + Optionen aus den Kandidatenblättern. `hoerdurchgaenge` gemäß `PROJEKT.md` §3.1 (Teil 1 = 2×, Teil 2 = 1×, Teil 3 = 2×).
- **Lesen Teil 1–3:** Texte, Anzeigen, Schilder + Aussagen wörtlich aus den Kandidatenblättern.
- **Lösungen (Hören/Lesen):** primär **aus den Transkripten/Texten selbst abgeleitet** und gegen die gedruckte Lösungsübersicht gegengeprüft. Grund: die Lösungsübersicht wird durch das mehrspaltige PDF-Layout bei `-raw`-Extraktion spaltenverschränkt ausgegeben und ist allein nicht verlässlich zuzuordnen; der Transkript-Inhalt ist die verlässlichere Quelle, das Raster dient als Kontrolle.
- **Schreiben Teil 1:** `ausgangstext` + 5 `formularfelder` (Feld + korrekte Lösung) wörtlich; Feldlösungen aus der Lösungsübersicht.
- **Schreiben Teil 2:** `situation` + genau 3 `inhaltspunkte` (Grund / Info / Frage) wörtlich. `musterloesung` = das in den Prüferblättern abgedruckte Muster-/Beispielkandidatentext (bestes vorhandenes Beispiel, leicht bereinigt von OCR-Artefakten).
- **Sprechen Teil 1:** fester „Sich vorstellen"-Ritualtext + Standardfragen (laut `PROJEKT.md` §5 in allen Sätzen wortgleich).
- **Sprechen Teil 2:** `themen` mit den jeweiligen Stichwort-`karten` wörtlich aus den Kartensets.
- **Sprechen Teil 3:** die `bildkarten` liegen im PDF **nur als Bilder** vor. Vorgehen: den abgebildeten Gegenstand aus den Prüferblättern (die die Objekte benennen) als `beschreibung` rekonstruieren und eine plausible `beispielbitte` formulieren. **Diese Teile sind rekonstruiert, nicht 1:1 aus dem Original** — jede betroffene `exam.json` erhält dazu einen `_hinweis`-Kommentar bzw. die Rekonstruktion wird im begleitenden `loesungen.md` vermerkt.

## 5. Gerenderte Studienblätter

Nach dem Schreiben jeder `exam.json` wird der bestehende Renderer ausgeführt:

```
node scripts/render-exam.ts content/exams/<id>/exam.json
```

→ erzeugt `content/exams/<id>/exam.md` (Kandidatenblatt) + `loesungen.md` (Lösungsschlüssel), analog zu `uebungssatz-03`. Kein Umbau des Renderers nötig.

## 6. App-Einbindung

Aktuell lädt `app/page.tsx` fest `getExamById("uebungssatz-03")`; es gibt keine Auswahl. Änderungen:

- **`lib/exams.ts`:** alle vier Sätze registrieren (`modellsatz`, `uebungssatz-01`, `uebungssatz-02`, `uebungssatz-03`). Zusätzlich eine Metadaten-Liste exportieren:
  ```ts
  export interface ExamMeta { id: string; titel: string; }
  export function listExams(): ExamMeta[];
  ```
  Reihenfolge: Modellsatz, Übungssatz 01, 02, 03.
- **Auswahl-UI:** ein leichter Wechsler. `app/page.tsx` wird zu einer dünnen Server-Komponente, die die Exam-Liste an einen neuen Client-Wrapper `components/exam/ExamPicker.tsx` übergibt. Der Wrapper hält den ausgewählten `id`-State, holt das passende `Exam` und rendert `<ExamApp exam={...} />`. Beim Wechsel wird `ExamApp` über `key={exam.id}` neu gemountet → Antwort-State setzt sauber zurück.
- **`ExamApp` selbst bleibt unverändert** (nimmt weiterhin nur `exam` als Prop). Die Auswahl liegt außerhalb.

## 7. Verzeichnisstruktur (Ergänzung)

```
data/exams-raw/                      # NEU: saubere UTF-8-Extraktion der 3 Original-PDFs
content/exams/
├── modellsatz/{exam.json,exam.md,loesungen.md}          # NEU
├── uebungssatz-01/{exam.json,exam.md,loesungen.md}      # NEU
├── uebungssatz-02/{exam.json,exam.md,loesungen.md}      # NEU
└── uebungssatz-03/…                                      # bestehend
lib/exams.ts                         # erweitert: 4 Sätze + listExams()
components/exam/ExamPicker.tsx        # NEU: Client-Wrapper mit Auswahl
app/page.tsx                         # angepasst: rendert ExamPicker
```

## 8. Validierung / „Tests"

Content-lastige Phase, entsprechend Validierung statt klassischer Unit-Tests (analog Phase 1 §6):

- **JSON-Wohlgeformtheit:** jede `exam.json` mit `JSON.parse` prüfen.
- **Item-Anzahl:** exakt `PROJEKT.md` §3 — Hören 15 gewertete Items (Teil 1: 1 Beispiel + 6, Teil 2: 1 Beispiel + 4, Teil 3: 5), Lesen 15 (5/5/5, Teil 3 mit Beispiel), Schreiben 2 Teile (5 Formularfelder + 3 Inhaltspunkte), Sprechen 3 Teile.
- **Lösungs-Gegenprüfung:** stichprobenartig jede Hören-/Lesen-`loesung` gegen den Transkript-/Textinhalt prüfen (nicht nur gegen das Raster).
- **Renderer-Lauf:** `render-exam.ts` läuft ohne Fehler für alle drei; `exam.md` enthält keine durchgesickerten Lösungswerte (außer legitim im Ausgangstext).
- **Build/Typecheck:** `npm run build` (bzw. `next build`) und TypeScript ohne Fehler; App startet, alle vier Sätze im Wechsler wählbar, `gradeExam` funktioniert für jeden.

## 9. Bekannte Grenzen (bewusst akzeptiert)

- **Sprechen Teil 3 (Bildkarten)** ist rekonstruiert, nicht originalgetreu (Bilder nicht als Text extrahierbar), siehe §4.
- **OCR-/Layout-Artefakte:** der Muster-Schreibtext (Schreiben Teil 2) und einzelne Transkriptzeilen können im Rohtext kleine Extraktionsfehler enthalten; diese werden bei der Transkription von Hand bereinigt, aber vollständige Fehlerfreiheit ist nicht garantiert.
- **Kein Audio** — Hören bleibt Transkript/Skript (wie in Phase 1, `PROJEKT.md` §8.2). Die App nutzt bereits `TranscriptPlayer` dafür.
- **Copyright:** nur privates Üben, keine öffentliche 1:1-Weiterverbreitung (§1).

## 10. Nicht Teil dieser Phase

- Automatischer Prüfungs-PDF-Parser (bewusst manuelle Transkription, §4).
- TTS-Vertonung, Vokabeltrainer, KI-Bewertung von Schreiben/Sprechen.
- Weitere neue generierte Sätze über die 3 Originale hinaus.
