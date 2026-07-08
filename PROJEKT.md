# Goethe-Zertifikat A1 (Start Deutsch 1) – Trainingsmaterial-Projekt

## 1. Ziel

Ein Bekannter muss bald die Prüfung **Goethe-Zertifikat A1: Start Deutsch 1** ablegen.
Es gibt kaum frei verfügbares Übungsmaterial. Dieses Projekt soll:

1. die vorhandenen Original-Beispielprüfungen und die offizielle Wortliste **analysieren**,
2. daraus das genaue **Muster/Format** der Prüfung ableiten (Aufgabentypen, Anzahl, Schwierigkeitsgrad, Themen),
3. auf dieser Basis **neue, realistische Übungsprüfungen und Einzelübungen** generieren,
4. das Ganze später in ein **interaktives UI** überführen (Web-App zum Üben, ggf. mit Auswertung, Vokabeltrainer, Audio).

Aktueller Schritt: Nur Analyse + Konzept in Markdown. UI kommt später.

## 2. Vorhandenes Ausgangsmaterial

Ordner `examples/` (Originale des Goethe-Instituts, Februar 2024, 6./8. Auflage):

| Datei | Inhalt |
|---|---|
| `sd_1_modellsatz.pdf` | 1 komplette Modellprüfung (Hören, Lesen, Schreiben, Sprechen) inkl. Transkripten, Lösungen, Bewertungsraster |
| `sd_1_uebungssatz01.pdf` | 1 komplette Übungsprüfung, gleicher Aufbau |
| `sd_1_uebungssatz02.pdf` | 1 komplette Übungsprüfung, gleicher Aufbau |
| `A1_SD1_Wortliste_02.pdf` | Offizielle Wortliste: Themenbereiche, 13 Wortgruppen, ca. 650 Wörter alphabetisch mit Beispielsätzen |

Text wurde mit `pdftotext -layout` extrahiert nach `extracted/*.txt` (Rohtext, für Weiterverarbeitung/Suche nutzbar, Layout teilweise verzerrt bei Formularen/Karten).

**Wichtige Einschränkung:** Die Original-Audiodateien (Tonträger für „Hören") liegen nicht vor – nur die **Transkripte** in den PDFs. Für eigene neue Hörprüfungen brauchen wir entweder TTS (Text-to-Speech) oder der Lernende nutzt die Dialoge als Lesetext/Rollenspiel-Vorlage, bis eine Audio-Lösung existiert.

## 3. Analyse: Prüfungsstruktur

Alle drei Beispielsätze folgen **exakt demselben Aufbau** – das ist unser verlässliches Grundgerüst für neue Prüfungen.

### 3.1 Hören (ca. 20 Minuten, 15 Punkte)

| Teil | Aufgabentyp | Items | Besonderheit |
|---|---|---|---|
| Teil 1 | Multiple Choice a/b/c | 1–6 (davon 1 Beispiel „0") | Kurze Alltagsdialoge (Verkauf, Uhrzeit, Restaurant, Familie, Gebäude/Stockwerk, Reise). Text wird **zweimal** gehört. |
| Teil 2 | Richtig/Falsch | 7–10 | Durchsagen/Ansagen (Bahnhof, Flughafen, Bus, Notfall). Text wird **einmal** gehört. |
| Teil 3 | Multiple Choice a/b/c | 11–15 | Anrufbeantworter-Nachrichten, kurze private Telefonate. Text wird **zweimal** gehört. |

Wiederkehrende Themen/Situationen (aus allen 3 Sätzen): Einkaufen/Preis, Uhrzeit/Termine, Restaurant/Essen bestellen, Reise/Bahn/Flug, Beruf/Arbeit, Wohnen/Adresse, Telefonnachrichten, öffentliche Durchsagen (Bahnhof, Flughafen, Feuer/Notfall), Verabredungen mit Freunden.

### 3.2 Lesen (ca. 25 Minuten, 15 Punkte)

| Teil | Aufgabentyp | Items | Besonderheit |
|---|---|---|---|
| Teil 1 | Richtig/Falsch | 1–5 | Zwei private Kurztexte (Brief/E-Mail/SMS), je 2–3 Aussagen dazu |
| Teil 2 | Auswahl a/b (welche Webseite/Anzeige passt?) | 6–10 | Je 2 kurze Werbe-/Infotexte (Websites, Kleinanzeigen), man muss die passende finden |
| Teil 3 | Richtig/Falsch | 11–15 | Öffentliche Hinweisschilder/Aushänge (Öffnungszeiten, Verbote, Restaurant, Haltestelle) + 1 Aussage |

### 3.3 Schreiben (ca. 20 Minuten, 15 Punkte)

| Teil | Aufgabe | Bewertung |
|---|---|---|
| Teil 1 | Formular ausfüllen: Ausgangstext beschreibt eine Person/Situation, 5 Informationen fehlen im Formular und müssen ergänzt werden | 1 Punkt pro korrekte Information (max. 5), in der Modellprüfung als „/10" gewichtet |
| Teil 2 | Kurze private Mitteilung (E-Mail/Brief, ca. 30 Wörter) zu 3 vorgegebenen Punkten (Grund, 2 Inhaltspunkte) | Bewertung: Erfüllung der Aufgabenstellung pro Inhaltspunkt (3/1,5/0 Punkte) + kommunikative Gestaltung (Anrede/Gruß etc., 1/0,5/0 Punkte); max. 10 Punkte |

Immer 3 Inhaltspunkte in Teil 2: **(1) Warum schreiben Sie? (2) Aussage/Info geben (3) Frage stellen.**

### 3.4 Sprechen (ca. 15 Minuten, Gruppenprüfung mit bis zu 4 Teilnehmenden)

| Teil | Aufgabe |
|---|---|
| Teil 1 | Sich vorstellen (Name, Herkunft, Wohnort, Sprachen, Hobby) + etwas buchstabieren + eine Nummer nennen (Telefon/Handy/Haus) |
| Teil 2 | Zu 2 Themen (z. B. Wochenende, Beruf, Sport, Schule, Einkaufen) auf Handlungskarten basierend Fragen stellen und beantworten (reihum) |
| Teil 3 | Bitte formulieren und darauf reagieren, basierend auf 2 Bildkarten (Alltagsgegenstände/Situationen) |

Bewertung: volle/halbe/0 Punkte je nach Aufgabenerfüllung und Verständlichkeit.

### 3.5 Gesamtbewertung

Hören + Lesen + Schreiben = max. 45 Punkte (schriftliche Einzelprüfung), plus separate mündliche Gruppenprüfung (Sprechen). Bestehensgrenze laut offiziellem Format: i. d. R. 60 % in jedem Prüfungsteil.

## 4. Analyse: Wortliste

### 4.1 Aufbau
- **Vorwort**: ca. 650 Wörter insgesamt, davon sollte ca. die Hälfte aktiv beherrscht werden, der Rest passiv (Verstehen reicht).
- **Themen** (Inventar, 10 große Themenbereiche): Person, Wohnen, Umwelt, Essen/Trinken, Dienstleistungen, Arbeit/Beruf, Reisen/Verkehr, Einkaufen/Gebrauchsartikel, Erziehung/Ausbildung/Lernen, Freizeit/Unterhaltung.
- **Wortgruppenliste** (13 geschlossene Kategorien, „Systemwortschatz"): Zahlen, Ordinalzahlen, Datum, Uhrzeit, Zeitmaße, Wochentage, Tageszeiten, Monate, Jahreszeiten, Währungen, Maße/Gewichte, Länder/Nationalitäten, Farben, Himmelsrichtungen.
- **Alphabetische Wortliste**: Haupteinträge + eingerückte Nebeneinträge (Wortbildung, z. B. *danken → der Dank, danke*), jeweils mit **einem Beispielsatz** zur Bedeutungsklärung. Pluralformen angegeben wo relevant. Weibliche Formen werden nicht separat gelistet, gelten aber als Teil des Wortschatzes.

### 4.2 Warum das wichtig ist
Die Wortliste ist die **verbindliche Grundlage** für alle Prüfungsteile – nichts, was außerhalb dieser ca. 650 Wörter + Wortgruppen liegt, sollte in eigenen Übungsprüfungen ungeklärt vorausgesetzt werden (sonst trainiert man am Bedarf vorbei).

## 5. Muster über alle 3 Prüfungen hinweg (Grundlage für Generierung)

- Immer **identisches Beispiel-Item ("0")** in Hören Teil 1, Teil 2 und Lesen Teil 3 (Zimmernummer Schneider / Frau Gundlach Halle C / Sprachschule Beethovenstraße) – das sind reine Formatbeispiele, keine Testinhalte. Neue Prüfungen sollten ebenfalls ein Beispiel pro Teil haben, aber es muss nicht das gleiche sein.
- Sprechen Teil 1 („Sich vorstellen") und die Prüferansagen sind **wortwörtlich identisch** in allen drei Sätzen → das ist ritualisiertes Prüfungsformat, kein variabler Inhalt.
- Sprechen Teil 2/3 nutzen **Themen-Cluster** (z. B. „Wochenende", „Beruf", „Sport", „Schule") mit je 6 Stichwort-Karten – gut kopierbares Muster für neue Kartensets.
- Die Schwierigkeitsprogression ist bewusst flach (A1) – Sätze sind kurz, Vokabular bleibt strikt im Rahmen der Wortliste, Situationen sind alltäglich und wiederholen sich thematisch (Bahnhof, Restaurant, Telefonnachricht, Behörde/Formular, Verabredung).

## 6. Einschränkungen / offene technische Punkte

- **Keine Audiodateien** vorhanden – nur Transkripte. Für neue Hörprüfungen: entweder TTS-Vertonung (später im UI) oder vorerst als Lese-/Hörverständnistext mit der Bitte, sich die Dialoge laut vorlesen zu lassen (z. B. von einer zweiten Person oder eigener TTS-Stimme).
- Sprechen-Karteninhalte (Teil 3, Bildkarten) waren im PDF-Layout teilweise nicht sauber extrahierbar (Grafiken/Symbole) – für eigene neue Kartensets müssen wir die Bildideen selbst neu beschreiben statt sie 1:1 zu kopieren.
- Rechtlich: Die Originalprüfungen sind Copyright Goethe-Institut/telc. Für eigene, **neu generierte** Übungen ist das unproblematisch (wir imitieren nur Format & Wortschatzniveau), aber wir sollten keine Original-Prüfungstexte 1:1 weiterverbreiten.

## 7. Ideen für abgeleitete Materialien (Diskussionsgrundlage, noch nicht entschieden)

- **Neue komplette Übungsprüfungen** (Hören/Lesen/Schreiben/Sprechen) im exakt gleichen Format, mit neuen, aber niveaugleichen Inhalten, ausschließlich basierend auf Wortliste-Vokabular.
- **Einzeltrainer pro Teil**, z. B. nur "Lesen Teil 2" (Kleinanzeigen-Zuordnung) in beliebiger Menge generieren, für gezieltes Training des schwächsten Prüfungsteils.
- **Vokabeltrainer** aus der alphabetischen Wortliste (Karteikarten/Spaced Repetition), gruppiert nach Themen oder Wortgruppen.
- **Schreiben-Teil-2-Generator**: zufällige Alltagssituationen (Einladung, Entschuldigung, Bitte) mit den 3 Pflicht-Inhaltspunkten, plus Musterlösung und Bewertungsraster zum Selbst-Checken.
- **Sprechen-Karten-Generator**: neue Themen-Sets für Teil 2 (Fragen/Antworten) und Teil 3 (Bitten) zum Ausdrucken oder für Partnerübung.
- **Formular-Ausfüll-Generator** (Schreiben Teil 1): neue Kurzbiografien mit 5 fehlenden Formularfeldern.
- **Fortschritts-Tracking**: welche Prüfungsteile/Wortgruppen schon geübt/beherrscht wurden.
- **Audio via TTS**: später Hörtexte vorlesen lassen (z. B. Browser-TTS oder eine TTS-API), um den Hörteil realistisch zu üben.

## 8. Entscheidungen (Stand: 2026-07-04)

1. **Erster Prototyp**: eine komplette neue Übungsprüfung (Hören/Lesen/Schreiben/Sprechen) im exakt gleichen Format wie die Originale, generisch nutzbar (nicht mit personenspezifischen Details fest verdrahtet).
2. **Hören**: TTS wird von Anfang an mitgedacht/angestrebt, nicht erst als Spätphase. D. h. Hörtexte werden von vornherein so geschrieben (klare Sprecherrollen, natürliche Dialoglänge), dass sie sich direkt per TTS vertonen lassen, sobald das UI steht. Bis dahin dienen sie als Transkript zum Vorlesen.
3. **Zielgruppe**: generisch für beliebige A1-Kandidaten gedacht, nicht nur für den einen Bekannten. Das beeinflusst die Architektur (siehe unten): Inhalte (neue Prüfungen, Vokabellisten) und Format/Logik (Auswertung, UI) sollten von Anfang an getrennt sein, damit man beliebig viele neue Prüfungssätze nachschieben kann.

### Konsequenzen für die Architektur

- **Content-Struktur**: neue Prüfungssätze sollten als strukturierte Daten (z. B. JSON/YAML pro Satz: Teile, Items, Lösungen, Audiotexte mit Sprecherkennzeichnung) angelegt werden, nicht nur als Fließtext – das macht spätere automatische Auswertung und TTS-Vertonung möglich.
- **Wortliste als Datenbasis**: die ~650 Wörter + 13 Wortgruppen sollten ebenfalls strukturiert vorliegen (Wort, Artikel/Plural, Beispielsatz, Thema/Kategorie), damit Prüfungsgenerierung und Vokabeltrainer dieselbe Quelle nutzen und sich Inhalte nicht widersprechen.
- **Trennung Content ↔️ Engine**: Prüfungsdaten (beliebig viele Sätze) getrennt von der Logik, die daraus eine spielbare/übbare Prüfung macht (Anzeige, Auswertung, TTS-Aufruf) – damit später zusätzliche Sätze einfach als neue Datendateien ergänzt werden können.

## 9. Nächste Schritte

1. **Wortliste strukturieren**: die ~650 Einträge aus `extracted/A1_SD1_Wortliste_02.txt` in ein strukturiertes Format (z. B. JSON: Wort, Artikel, Plural, Beispielsatz, Wortgruppe/Thema) überführen – Grundlage für alles Weitere.
2. **Ersten neuen Übungssatz erstellen**: komplette Prüfung (Hören/Lesen/Schreiben/Sprechen) nach dem analysierten Muster (Abschnitt 3), ausschließlich mit Vokabular aus der strukturierten Wortliste, als strukturierte Datei + lesbares Markdown/Lösungsblatt.
3. **Format für Hörtexte festlegen**: Dialogformat mit klaren Sprecherkennzeichnungen (Rolle: Text), damit spätere TTS-Vertonung ohne Umbau möglich ist.
4. Erst danach: UI/Interaktivität (Web-App) planen – Anzeige der Prüfungen, automatische Auswertung (MC/Richtig-Falsch sofort, Schreiben/Sprechen ggf. mit KI-Bewertung nach offiziellem Raster), TTS-Anbindung für Hören, Vokabeltrainer-Oberfläche.
