"use client";

import { useState } from "react";
import { CountdownBadge } from "./CountdownBadge";
import { DialogueBubble } from "./DialogueBubble";
import { PhaseHint } from "./PhaseHint";
import { SpotConfirm } from "./SpotConfirm";
import { ProgressRing } from "./ProgressRing";
import { CeremonyCaptions } from "./CeremonyCaptions";
import { CertificateModal } from "./CertificateModal";
import { STR } from "@/lib/strings.ru";
import { useRitualStore } from "@/store/ritualStore";
import { Button } from "./ui";

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
        {phase === "ceremony" && <CeremonyCaptions />}
        {(phase === "certificate" || phase === "returned") && (
          <CertificatePanel
            key={phase}
            initialOpen={phase === "certificate"}
          />
        )}
        <PhaseHint />
      </div>
    </div>
  );
}
