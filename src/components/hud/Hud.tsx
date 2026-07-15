"use client";

import { useEffect, useState } from "react";
import { CountdownBadge } from "./CountdownBadge";
import { DialogueBubble } from "./DialogueBubble";
import { PhaseHint } from "./PhaseHint";
import { SpotConfirm } from "./SpotConfirm";
import { ProgressRing } from "./ProgressRing";
import { CeremonyCaptions } from "./CeremonyCaptions";
import { CertificateModal } from "./CertificateModal";
import { CounterBadge } from "./CounterBadge";
import { WallPanel } from "./WallPanel";
import { STR } from "@/lib/strings.ru";
import { useRitualStore } from "@/store/ritualStore";
import { registerBurial } from "@/lib/burialApi";
import { Button } from "./ui";

/** Карточка вернувшегося гостя: сосиска уже несёт службу */
function ReturnedCard() {
  const burial = useRitualStore((s) => s.burial);
  if (!burial) return null;
  return (
    <div className="pointer-events-none max-w-md animate-fade-up rounded-3xl bg-cream/95 px-5 py-3 text-center shadow-xl backdrop-blur">
      <div className="text-base font-bold">{STR.returned.title}</div>
      <div className="mt-0.5 text-sm opacity-75">
        {STR.returned.body(burial.n)}
      </div>
    </div>
  );
}

/** Кнопка «Мой сертификат» + модалка; в certificate открыта сразу */
function CertificatePanel({ initialOpen }: { initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        {STR.returned.showCertificate}
      </Button>
    );
  }
  return <CertificateModal onClose={() => setOpen(false)} />;
}

/**
 * DOM-слой поверх канваса. Сам прозрачен для указателя;
 * интерактивны только конкретные элементы (pointer-events-auto).
 */
export function Hud() {
  const phase = useRitualStore((s) => s.phase);
  const wallOpen = useRitualStore((s) => s.wallOpen);

  // Сосиска регистрируется на сервере в начале церемонии (не блокирует ритуал)
  useEffect(() => {
    if (phase === "ceremony") void registerBurial();
  }, [phase]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-safe pb-safe pt-safe">
      {/* верхняя панель */}
      <div className="flex items-start justify-between gap-2 p-3">
        <CountdownBadge className="scale-90 origin-top-left" />
        <ProgressRing />
        {/* справа: счётчик-кнопка стены (S7 добавит MuteButton) */}
        <CounterBadge />
      </div>

      {/* нижняя зона: диалог / подсказки / подтверждения */}
      <div className="flex flex-col items-center gap-3 p-4 pb-6">
        {phase === "hello" && <DialogueBubble />}
        <SpotConfirm />
        {phase === "ceremony" && <CeremonyCaptions />}
        {phase === "returned" && <ReturnedCard />}
        {(phase === "certificate" || phase === "returned") && (
          <CertificatePanel
            key={phase}
            initialOpen={phase === "certificate"}
          />
        )}
        <PhaseHint />
      </div>

      {wallOpen && <WallPanel />}
    </div>
  );
}
