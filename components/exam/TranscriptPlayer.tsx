"use client";

import { useEffect, useState } from "react";
import type { DialogLine } from "../../lib/types";

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
    <div className="transcript">
      <div className="transcript-actions">
        <button type="button" className="small-button" onClick={play} disabled={!canSpeak}>
          Play transcript
        </button>
        {!canSpeak ? <span className="muted">Browser playback unavailable</span> : null}
      </div>
      <div aria-label={label}>
        {lines.map((line, index) => (
          <p key={`${line.sprecher}-${index}`}>
            <strong>{line.sprecher}:</strong> {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
