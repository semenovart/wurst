"use client";

import { CountdownBadge } from "./CountdownBadge";
import { DialogueBubble } from "./DialogueBubble";
import { PhaseHint } from "./PhaseHint";
import { SpotConfirm } from "./SpotConfirm";
import { ProgressRing } from "./ProgressRing";
import { useRitualStore } from "@/store/ritualStore";

/**
 * DOM-слой поверх канваса. Сам прозрачен для указателя;
 * интерактивны только конкретные элементы (pointer-events-auto).
 */
export function Hud() {
  const phase = useRitualStore((s) => s.phase);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-safe pb-safe pt-safe">
      {/* верхняя панель */}
      <div className="flex items-start justify-between p-3">
        <CountdownBadge className="scale-90 origin-top-left" />
        <ProgressRing />
        {/* справа появится MuteButton (S7) и счётчик (S6) */}
        <div />
      </div>

      {/* нижняя зона: диалог / подсказки / подтверждения */}
      <div className="flex flex-col items-center gap-3 p-4 pb-6">
        {phase === "hello" && <DialogueBubble />}
        <SpotConfirm />
        <PhaseHint />
      </div>
    </div>
  );
}
