"use client";

import { useRitualStore } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";
import { Button } from "./ui";

/** Подтверждение выбранного места ямы */
export function SpotConfirm() {
  const phase = useRitualStore((s) => s.phase);
  const candidate = useRitualStore((s) => s.candidateSpot);
  const confirmSpot = useRitualStore((s) => s.confirmSpot);

  if (phase !== "chooseSpot" || !candidate) return null;

  return (
    <div className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-3xl bg-cream/95 px-5 py-3 shadow-xl backdrop-blur">
      <span className="text-base font-bold">{STR.hints.confirmSpot}</span>
      <Button onClick={confirmSpot}>{STR.hints.confirmSpotYes}</Button>
    </div>
  );
}
