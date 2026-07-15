"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding.config";
import { STR, ruPlural } from "@/lib/strings.ru";

const WEDDING_TS = new Date(wedding.dateISO).getTime();
const DAY_MS = 86_400_000;

function remainingParts(now: number) {
  const diff = WEDDING_TS - now;
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Обратный отсчёт до свадьбы. Тикает на клиенте; серверный рендер даёт
 * первую оценку, расхождение гасится suppressHydrationWarning.
 */
export function CountdownBadge({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { diff, days, hours, minutes, seconds } = remainingParts(now);

  const badgeBase =
    "inline-flex flex-col items-center gap-0.5 rounded-2xl bg-cream/90 px-4 py-2 text-ink shadow-lg backdrop-blur";

  if (diff <= 0) {
    const isToday = diff > -DAY_MS;
    return (
      <div className={`${badgeBase} ${className}`} suppressHydrationWarning>
        <span className="text-sm font-bold">
          {isToday ? STR.countdown.today : STR.countdown.past}
        </span>
      </div>
    );
  }

  return (
    <div className={`${badgeBase} ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">
        {STR.countdown.label}
      </span>
      <span className="tabular-nums" suppressHydrationWarning>
        <b className="text-xl">{days}</b>{" "}
        <span className="text-sm">{ruPlural(days, STR.countdown.day)}</span>{" "}
        <span className="text-sm opacity-70">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </span>
    </div>
  );
}
