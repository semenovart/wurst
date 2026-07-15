"use client";

import { useRitualStore, TAMP_GOAL } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";
import type { Phase } from "@/store/phases";

const HINTS: Partial<Record<Phase, string>> = {
  chooseSpot: STR.hints.chooseSpot,
  dig: STR.hints.dig,
  place: STR.hints.place,
  fill: STR.hints.fill,
  tamp: STR.hints.tamp,
};

/** Инструкция текущего шага; дублируется скринридерам через aria-live */
export function PhaseHint() {
  const phase = useRitualStore((s) => s.phase);
  const candidate = useRitualStore((s) => s.candidateSpot);
  const tampCount = useRitualStore((s) => s.tampCount);

  // Пока открыт конфирм места — подсказку прячем, чтобы не спорили
  let text = phase === "chooseSpot" && candidate ? undefined : HINTS[phase];
  if (phase === "tamp" && tampCount > 0) {
    text = STR.hints.tampProgress(Math.max(0, TAMP_GOAL - tampCount));
  }

  return (
    <div aria-live="polite" className="flex min-h-10 items-center">
      {text && (
        <div
          key={text}
          className="animate-fade-up rounded-full bg-ink/70 px-4 py-2 text-sm font-bold text-cream shadow-lg backdrop-blur"
        >
          {text}
        </div>
      )}
    </div>
  );
}
