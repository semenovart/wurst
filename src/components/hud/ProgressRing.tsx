"use client";

import { useEffect, useRef } from "react";
import { useRitualStore, type RitualState } from "@/store/ritualStore";

const R = 19;
const C = 2 * Math.PI * R;

/**
 * Кольцо прогресса копания/засыпки. Обновляется транзитной подпиской
 * прямо в DOM (strokeDashoffset/textContent) — без setState.
 */
export function ProgressRing() {
  const phase = useRitualStore((s) => s.phase);
  const circleRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const active = phase === "dig" || phase === "fill";

  useEffect(() => {
    if (!active) return;
    const selector = (s: RitualState) =>
      phase === "dig" ? s.digProgress : s.fillProgress;
    const apply = (v: number) => {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(C * (1 - v));
      }
      if (labelRef.current) {
        labelRef.current.textContent = `${Math.round(v * 100)}%`;
      }
    };
    apply(selector(useRitualStore.getState()));
    return useRitualStore.subscribe(selector, apply);
  }, [active, phase]);

  if (!active) return null;

  return (
    <div className="pointer-events-none flex animate-fade-up items-center gap-2 rounded-full bg-cream/90 py-1.5 pl-2 pr-4 shadow-lg backdrop-blur">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="rgba(58,46,38,0.12)"
          strokeWidth="5"
        />
        <circle
          ref={circleRef}
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="#e1764c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <span ref={labelRef} className="min-w-10 text-lg font-bold tabular-nums">
        0%
      </span>
    </div>
  );
}
