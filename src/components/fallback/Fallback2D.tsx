"use client";

import { useEffect, useRef, useState } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";
import { SausageFace } from "@/components/SausageFace";
import { NameForm } from "@/components/hud/NameForm";
import { Button } from "@/components/hud/ui";

/**
 * Протокол Б для устройств без WebGL: тот же ритуал «силой мысли».
 * Стор и бэкенд-флоу общие с 3D-версией (Hud рядом рисует сертификат,
 * счётчик и стену) — юридическая сила сертификата та же.
 */
export function Fallback2D() {
  const phase = useRitualStore((s) => s.phase);
  const [thinking, setThinking] = useState(false);
  const timers = useRef<number[]>([]);

  // «Мысленное копание»: прогоняем фазы ритуала с театральными паузами
  const digByThought = () => {
    if (thinking) return;
    setThinking(true);
    const g = () => useRitualStore.getState();
    const later = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };
    g().setCandidateSpot([0, 0]);
    g().confirmSpot();
    later(900, () => g().setDigProgress(1));
    later(1500, () => g().advance()); // place → fill
    later(2100, () => g().setFillProgress(1));
    later(2600, () => {
      for (let i = 0; i < 5; i++) g().tamp();
    });
  };

  // ceremony → certificate: в 3D это делает таймлайн сцены, здесь — таймер
  useEffect(() => {
    if (phase !== "ceremony") return;
    const t = window.setTimeout(
      () => useRitualStore.getState().advance(),
      3000,
    );
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const showRitualButton =
    phase === "chooseSpot" ||
    phase === "dig" ||
    phase === "place" ||
    phase === "fill" ||
    phase === "tamp";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky via-sky to-grass px-6 pb-safe pt-safe text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/90">
        {STR.splash.agency}
      </p>
      <p className="-mt-3 text-2xl font-black tracking-tight text-cream drop-shadow">
        {STR.meta.gameTitle}
      </p>

      <div className={thinking ? "animate-float-bob" : ""}>
        <SausageFace className="w-40 drop-shadow-xl" />
      </div>

      {phase === "hello" && (
        <>
          <p className="max-w-sm text-sm font-medium text-cream drop-shadow">
            {STR.fallback2d.title}. {STR.fallback2d.body}
          </p>
          <NameForm />
        </>
      )}

      {showRitualButton && (
        <>
          {thinking ? (
            <p
              className="animate-fade-up text-base font-bold text-cream drop-shadow"
              aria-live="polite"
            >
              {STR.fallback2d.digging}
            </p>
          ) : (
            <Button onClick={digByThought}>{STR.fallback2d.button}</Button>
          )}
        </>
      )}

      {phase === "ceremony" && (
        <p
          className="animate-fade-up text-lg font-bold text-cream drop-shadow"
          aria-live="polite"
        >
          {STR.ceremony.lines[2]}
        </p>
      )}
    </div>
  );
}
