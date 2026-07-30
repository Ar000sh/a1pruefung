"use client";

import { useEffect, useState } from "react";
import type { DialogLine } from "../../lib/types";
import { btnSmall } from "../ui/styles";

interface TranscriptPlayerProps {
  lines: DialogLine[];
  label: string;
}

export function TranscriptPlayer({ lines, label }: TranscriptPlayerProps) {
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);
  }, []);

  function play() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = lines.map((line) => `${line.sprecher}: ${line.text}`).join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="my-3.5 border-l-[3px] border-[color:color-mix(in_srgb,var(--color-teal)_60%,var(--color-line))] py-1 pl-4">
      <div className="mb-2.5 flex items-center gap-2.5">
        <button type="button" className={btnSmall} onClick={play} disabled={!canSpeak}>
          Transkript abspielen
        </button>
        {!canSpeak ? <span className="text-muted">Wiedergabe im Browser nicht verfügbar</span> : null}
      </div>
      <div aria-label={label}>
        {lines.map((line, index) => (
          <p key={`${line.sprecher}-${index}`} className="my-1.5 leading-relaxed">
            <strong>{line.sprecher}:</strong> {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
