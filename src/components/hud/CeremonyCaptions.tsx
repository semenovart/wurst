"use client";

import { useEffect, useState } from "react";
import { STR } from "@/lib/strings.ru";

/**
 * Канцелярские титры церемонии: реплики сменяются каждые ~1.7 с.
 * Монтируется только в фазе ceremony (см. Hud) — state сбрасывается сам.
 */
export function CeremonyCaptions() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setStep((s) => Math.min(s + 1, STR.ceremony.lines.length - 1));
    }, 1700);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none flex flex-col items-center gap-1"
    >
      <div
        key={step}
        className="animate-fade-up rounded-full bg-cream/95 px-5 py-2.5 text-base font-bold text-ink shadow-xl backdrop-blur"
      >
        {STR.ceremony.lines[step]}
      </div>
      <div className="text-xs font-medium text-cream/90 drop-shadow">
        {STR.ceremony.working}
      </div>
    </div>
  );
}
