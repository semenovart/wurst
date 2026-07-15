"use client";

import { useRitualStore } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";

/** Звук и вибро: одна настройка, persist в сторе, мгновенный ramp в движке */
export function MuteButton() {
  const muted = useRitualStore((s) => s.muted);
  const setMuted = useRitualStore((s) => s.setMuted);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? STR.a11y.muteOn : STR.a11y.muteOff}
      title={STR.a11y.mute}
      className="pointer-events-auto flex h-10 w-10 touch-manipulation items-center justify-center rounded-2xl bg-cream/90 text-lg shadow-lg backdrop-blur transition active:scale-95"
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
