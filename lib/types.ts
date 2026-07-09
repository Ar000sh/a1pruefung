export type ExamSectionId = "hoeren" | "lesen" | "schreiben" | "sprechen";
export type ObjectiveStatus = "unanswered" | "correct" | "wrong";

export interface Optionen {
  a: string;
  b: string;
  c?: string;
}

export interface DialogLine {
  sprecher: string;
  text: string;
}

export interface FutureMediaFields {
  audioUrl?: string;
  imageUrl?: string;
  roleplayPrompt?: string;
  partnerRole?: string;
  teacherRubric?: string;
  recordingUrl?: string;
  agentFeedback?: string;
}

export interface HoerItem extends FutureMediaFields {
  nr: number;
  dialog?: DialogLine[];
  durchsage?: string;
  nachricht?: string;
  frage?: string;
  aussage?: string;
  optionen?: Optionen;
  loesung: string;
  hoerdurchgaenge?: number;
}

export interface HoerTeil {
  beispiel?: HoerItem;
  items: HoerItem[];
}

export interface LesenAussage {
  nr: number;
  aussage: string;
  loesung: string;
}

export interface LesenText {
  titel: string;
  text: string;
  aussagen: LesenAussage[];
}

export interface LesenTeil2Item {
  nr: number;
  situation: string;
  anzeige_a: string;
  anzeige_b: string;
  loesung: string;
}

export interface LesenTeil3Item extends FutureMediaFields {
  nr: number;
  schild: string;
  aussage: string;
  loesung: string;
}

export interface Exam {
  id: string;
  hoeren: { teil1: HoerTeil; teil2: HoerTeil; teil3: HoerTeil };
  lesen: {
    teil1: { texte: LesenText[] };
    teil2: { items: LesenTeil2Item[] };
    teil3: { beispiel?: LesenTeil3Item; items: LesenTeil3Item[] };
  };
  schreiben: {
    teil1: { ausgangstext: string; formularfelder: { feld: string; loesung: string }[] };
    teil2: { situation: string; inhaltspunkte: string[]; musterloesung: string };
  };
  sprechen: {
    teil1: { beschreibung: string; fragen: string[] };
    teil2: { themen: { thema: string; karten: string[] }[] };
    teil3: { bildkarten: { beschreibung: string; beispielbitte: string }[] };
  };
}

export interface AttemptAnswers {
  objective: Record<string, string>;
  schreibenTeil2: string;
  sprechenNotes: string;
  sprechenPracticed: boolean;
}
