# Phase 3: Natürliches Hören-Audio (TTS + Ambiente + prüfungsrealistische Wiedergabe) – Design

Status: approved (2026-07-09)
Baut auf: `PROJEKT.md`, den Exam-JSONs (`content/exams/*/exam.json`), der bestehenden App (`lib/`, `components/exam/`), insbesondere `components/exam/TranscriptPlayer.tsx`.

## 1. Ziel

Die Hören-Teile sollen sich wie die echte Prüfung anhören statt nur als vorgelesenes Transkript:

1. **Natürliche Stimmen** (echte neuronale TTS-Stimmen, mehrere Sprecher pro Dialog) statt der robotischen Browser-`speechSynthesis`.
2. **Prüfungsrealistische Wiedergabe**: jedes Item wird genau so oft abgespielt wie in der echten Prüfung (Teil 1 & 3 = 2×, Teil 2 = 1×), danach **gesperrt** – kein Pausieren, kein Spulen, kein erneutes Hören, bis der Versuch aufgelöst ist.
3. **Szenengerechtes, dezentes Hintergrundgeräusch** (Bahnhofs-/Flughafendurchsage mit PA-Hall, Restaurant-/Geschäftsgeräusch, Anrufbeantworter-Ton für Teil 3), leise genug, dass jedes Wort klar bleibt – wie bei den echten (bewusst sauberen) Goethe-Aufnahmen.

Audio wird **offline vorgeneriert** und als MP3 in `public/audio/` abgelegt; die App spielt nur ab. Keine Laufzeit-TTS, keine API-Keys in der App.

## 2. Entscheidungen (2026-07-09)

- **Vorgeneriert**, nicht Laufzeit. Beste **kostenlose** Stimmen. (ChatGPT Pro/Claude Pro liefern keinen TTS-API-Zugang; Gemini hat einen kostenlosen TTS-Tier.)
- **Voice-Engine: erst vergleichen** (Spike), dann festlegen. Kandidaten: **Microsoft Edge TTS** (`edge-tts`, kostenlos, kein Key, sehr natürliche DE-Stimmen) vs. **Google Gemini 2.5 TTS** (nativer Mehrsprecher-Dialog, kostenloser Tier via AI Studio, Key nötig).
- **Ambiente: szenengerecht, dezent**, mit ffmpeg **synthetisiert** (keine externen Sounddateien, keine Lizenzfragen).
- **Wiedergabe: per-Item gesperrtes Abspielen** – ein „Abspielen"-Button pro Item, spielt die prüfungsrichtige Anzahl (`hoerdurchgaenge`) mit Pause dazwischen, dann gesperrt; Transkript + freies Nachhören erst nach Auflösen des Versuchs.
- **Scope: phasenweise** – Spike (1 Item, beide Engines) → Modellsatz komplett (15 Items) → restliche 3 Sätze (45 Items).
- **`audioUrl` wird in `exam.json` geschrieben** (Feld existiert bereits in `FutureMediaFields`), kein separates Manifest.

## 3. Voraussetzungen (einmalig, lokal)

- **ffmpeg** auf PATH (aktuell nicht installiert) – `winget install Gyan.FFmpeg` oder `choco install ffmpeg`. Trägt die gesamte Ambiente-Mischung.
- **edge-tts** – `python -m pip install edge-tts` (Python 3.10 vorhanden).
- Nur für den Gemini-Zweig des Spikes: `python -m pip install google-genai` + kostenloser API-Key aus AI Studio in `GEMINI_API_KEY`.

Diese Tools braucht **nur die Generierung**, nicht die App. Die App hat keine neuen Abhängigkeiten (spielt nur MP3s).

## 4. Datenmodell (kleine Erweiterung)

`lib/types.ts`:

- Neues optionales Feld an `HoerItem`: `ambiente?: string` – Szenen-Tag. Werte (Registry-Schlüssel, s. §6):
  `neutral`, `geschaeft`, `restaurant`, `buero`, `strasse`, `durchsage_bahnhof`, `durchsage_flughafen`, `durchsage_allgemein`, `telefon`.
  Fehlt das Feld, greift ein Default nach Teil: Teil 1 → `neutral`, Teil 2 → `durchsage_allgemein`, Teil 3 → `telefon`.
- `audioUrl` (bereits vorhanden in `FutureMediaFields`) wird von der Pipeline gefüllt: `"/audio/<examId>/hoeren-<teil>-<nr>.mp3"`.
- `hoerdurchgaenge` (bereits vorhanden) ist die Wiederholungszahl für die Wiedergabe.

Die `ambiente`-Tags werden **von Hand** (von Claude) pro Item gesetzt – die Szene ist aus dem Dialoginhalt bekannt (z. B. Modellsatz Teil 1 Nr 3 = Restaurant). Kein automatisches Raten.

## 5. Voice-Zuordnung

- Stimmen-Pool (Edge): je zwei natürliche DE-Stimmen pro Geschlecht (z. B. weiblich `de-DE-KatjaNeural`, `de-DE-SeraphinaMultilingualNeural`; männlich `de-DE-ConradNeural`, `de-DE-FlorianMultilingualNeural`). Exakte Auswahl wird im Spike bestätigt.
- Zuordnung pro Item: Geschlecht aus dem `sprecher`-Label raten – weiblich bei `Frau`, `Kundin`, `Verkäuferin`, `Dame`, `Kollegin`, `Passantin`, `Mama` und weiblichen Vornamen; männlich bei `Herr`, `Mann`, `Kellner`, `Ober`, `Kunde`, `Kollege`, `Passant`; generische `A`/`B` wechseln sich ab. Innerhalb eines Items bleibt jede Rolle bei derselben Stimme; Durchsagen/Nachrichten (ein Sprecher) bekommen eine feste Stimme.
- Gemini-Zweig: nutzt native Mehrsprecher-Konfiguration (2 Stimmen) statt Einzelaufrufen.

## 6. Generierungs-Pipeline (neu)

Neues Skript `scripts/generate-audio.mjs` (Node-Orchestrator, ruft `edge-tts`/ffmpeg als Subprozesse; für Gemini optional `scripts/gemini_tts.py`). Ablauf pro Hören-Item:

1. Text je Sprecherzeile bestimmen (`dialog[]`, sonst `durchsage`/`nachricht`).
2. Jede Zeile mit der Rollen-Stimme via `edge-tts` rendern → Einzel-Audio.
3. Zeilen mit kurzen, natürlichen Pausen zusammenfügen (ffmpeg `concat`) → saubere Sprachaufnahme.
4. **Ambiente-Profil** nach `ambiente`-Tag anwenden (ffmpeg-Filtergraph, alles synthetisch):
   - `neutral`: leiser tiefpassgefilterter Raumton unter der Stimme, sanfte Kompression.
   - `geschaeft`/`restaurant`: Raumton + tiefes Gemurmel (stark tiefpassgefiltertes Rauschen) + vereinzelte leise Transienten.
   - `durchsage_*` (PA): „Tannoy"-Bandpass + `aecho`-Hall auf der Stimme + leiser Hallenton; optional kurzer Gong davor.
   - `telefon` (Anrufbeantworter, Teil 3): Bandpass 300–3400 Hz + leises Leitungsrauschen + Piepton am Anfang.
5. Lautheit normalisieren (`loudnorm`), als MP3 nach `public/audio/<examId>/hoeren-<teil>-<nr>.mp3` exportieren.
6. `audioUrl` in `content/exams/<examId>/exam.json` beim jeweiligen Item eintragen (idempotent – erneuter Lauf überschreibt dieselben Felder/Dateien).

Die Ambiente-Profile liegen als kleine Registry (Tag → ffmpeg-Filterkette) im Skript, damit neue Szenen leicht ergänzbar sind. Sprachpegel bleibt dominant (Ambiente ca. −18 bis −24 dB darunter), damit A1-Verständlichkeit erhalten bleibt.

## 7. App: prüfungsrealistischer Hören-Player

Neue Client-Komponente `components/exam/HoerPlayer.tsx`, ersetzt für Items **mit** `audioUrl` den `TranscriptPlayer`:

- Ein `<audio>`-Element mit `src=audioUrl`, **ohne** native Controls (kein Spulen), **kein** Pause-Knopf.
- Ein Button **„Abspielen"**. Bei Klick: abspielen; nach `ended`, wenn noch Durchgänge übrig (`hoerdurchgaenge`, Default 2 für Teil 1/3, 1 für Teil 2), ~2,5 s Pause, dann erneut. Nach dem letzten Durchgang Button **sperren** und „Gehört ✓" anzeigen.
- Solange der Versuch **nicht aufgelöst** ist: Transkript verborgen. Nach `resolved` (bestehender State in `ExamApp`): Transkript einblenden **und** freies „Nochmal hören" ohne Limit (Lernmodus).
- **Fallback**: fehlt `audioUrl`, wird der heutige `TranscriptPlayer` (Browser-`speechSynthesis`) verwendet. Damit ist der Rollout inkrementell und bricht nie – Items ohne generiertes Audio funktionieren weiter.
- Integration in `ExamApp`: dort, wo heute `TranscriptPlayer` für Hören-Items gerendert wird, stattdessen `HoerPlayer` (der intern auf `TranscriptPlayer` zurückfällt). `resolved`/`showAnswers` steuern Sperre und Transkript-Sichtbarkeit.

## 8. Verzeichnisstruktur (Ergänzung)

```
public/
└── audio/
    ├── modellsatz/hoeren-teil1-1.mp3 …            # generiert
    ├── uebungssatz-01/…
    ├── uebungssatz-02/…
    └── uebungssatz-03/…
scripts/
├── generate-audio.mjs                            # NEU: Pipeline (edge-tts + ffmpeg)
├── gemini_tts.py                                 # NEU (optional): Gemini-Zweig für den Spike
└── audio/ambience-profiles.mjs                   # NEU: Tag → ffmpeg-Filterkette
components/exam/HoerPlayer.tsx                     # NEU: prüfungsrealistischer Player
lib/types.ts                                      # ambiente? an HoerItem
content/exams/*/exam.json                          # audioUrl + ambiente pro Hören-Item
```

## 9. Phasen / Scope

- **Phase 0 – Spike**: ein Item (Modellsatz Teil 1 Nr 1) mit **beiden** Engines (Edge + Gemini) inkl. Ambiente rendern → anhören, Engine wählen. Ergebnis: zwei MP3s + Entscheidung.
- **Phase 1 – Pipeline + Player**: Pipeline für die gewählte Engine fertigstellen, `HoerPlayer` bauen, **Modellsatz komplett** (15 Items) generieren, End-to-End in der App testen.
- **Phase 2 – Restliche Sätze**: Übungssatz 01/02/03 generieren (45 Items).

## 10. Validierung / „Tests"

- **Spike**: zwei Beispiel-MP3s zum Vergleich (Sprachqualität, Ambiente-Dezenz, Verständlichkeit).
- **Pipeline**: MP3s werden erzeugt; Dauer plausibel; `loudnorm` ohne Clipping; Sprache klar über dem Ambiente; `audioUrl` korrekt in `exam.json`.
- **App** (`verify`-Skill / manuell): Button spielt genau `hoerdurchgaenge`-mal, sperrt danach; kein Spulen/Pausieren möglich; Transkript vor Auflösen verborgen, danach sichtbar; Items ohne `audioUrl` fallen sauber auf `TranscriptPlayer` zurück; `gradeExam` unverändert korrekt.
- **Node-Tests**: reine Logik (Wiederholungszähler, Voice-Zuordnung, Ambiente-Tag-Default, `audioUrl`-Pfadbildung) wird per `node:test` getestet; ffmpeg/edge-tts-Aufrufe bleiben manuelle Hör-Checkpoints (kein sinnvoller Unit-Test für Klangqualität).

## 11. Bekannte Grenzen (bewusst akzeptiert)

- Synthetisches Ambiente klingt bei Menschenmengen/Restaurant generischer als echte CC0-Aufnahmen (Nutzerentscheidung zugunsten Selbstständigkeit/Lizenzfreiheit). Profile sind später leicht durch echte Beds ersetzbar (gleiche Registry).
- Gemischtes Geschlecht/Stimme wird aus dem Sprecher-Label geraten; seltene Sonderfälle (neutrale Rollen, uneindeutige Namen) werden beim Hören-Checkpoint korrigiert.
- Kein Streaming/adaptives Laden – MP3s sind klein (A1-Items sind kurz), einfaches `<audio src>` genügt.
- Sprechen-Audio (Rollenspiel/TTS) ist **nicht** Teil dieser Phase – nur Hören.

## 12. Nicht Teil dieser Phase

- KI-Bewertung von Schreiben/Sprechen, Vokabeltrainer-Audio, Exam-Auswahl-UI (eigene Phase).
- Laufzeit-TTS in der App.
- Echte (aufgenommene) Ambiente-Sounddateien.
