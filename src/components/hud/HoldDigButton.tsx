"use client";

import { useEffect } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { holdAction } from "@/components/scene/interactionBus";
import { STR } from "@/lib/strings.ru";

/**
 * Доступная альтернатива жестам: удержание кнопки копает/засыпает,
 * в фазе утаптывания каждый клик — один «топ». Работает с клавиатуры
 * (Space/Enter) и любым указателем.
 */
export function HoldDigButton() {
  const phase = useRitualStore((s) => s.phase);

  // Страховка: при смене фазы отпускаем «зажатие»
  useEffect(() => {
    holdAction.digging = false;
  }, [phase]);

  if (phase !== "dig" && phase !== "fill" && phase !== "tamp") return null;

  const label =
    phase === "dig"
      ? STR.hints.digHold
      : phase === "fill"
        ? STR.hints.fillHold
        : STR.hints.tampHold;

  const start = () => {
    if (phase === "tamp") holdAction.tampPulses++;
    else holdAction.digging = true;
  };
  const stop = () => {
    holdAction.digging = false;
  };

  return (
    <button
      type="button"
      className="pointer-events-auto touch-manipulation select-none rounded-full bg-cream/90 px-6 py-3 text-base font-bold text-ink shadow-lg backdrop-blur transition active:scale-95"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) start();
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") stop();
      }}
    >
      ⛏ {label}
    </button>
  );
}
