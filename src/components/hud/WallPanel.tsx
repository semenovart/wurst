"use client";

import { useEffect, useState } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { fetchWall } from "@/lib/burialApi";
import { STR } from "@/lib/strings.ru";
import type { WallEntry } from "@/lib/validation";

type WallState =
  | { status: "loading" }
  | { status: "ready"; count: number; wishes: WallEntry[]; degraded: boolean };

/** Стена почёта: bottom-sheet со счётчиком и пожеланиями */
export function WallPanel() {
  const setWallOpen = useRitualStore((s) => s.setWallOpen);
  const [state, setState] = useState<WallState>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchWall();
      if (!alive) return;
      if (data) {
        setState({
          status: "ready",
          count: data.count,
          wishes: data.wishes,
          degraded: false,
        });
      } else {
        setState({ status: "ready", count: 0, wishes: [], degraded: true });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex flex-col justify-end">
      {/* фон-затемнение, закрывает по тапу */}
      <button
        type="button"
        aria-label={STR.wall.close}
        onClick={() => setWallOpen(false)}
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
      />
      <div className="relative max-h-[72dvh] animate-fade-up overflow-hidden rounded-t-3xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-ink/10 p-4 pb-3">
          <div>
            <h2 className="text-lg font-bold">{STR.wall.title}</h2>
            {state.status === "ready" && !state.degraded && (
              <p className="text-sm opacity-70">
                {STR.wall.counter(state.count)}
              </p>
            )}
            {state.status === "ready" && state.degraded && (
              <p className="text-sm opacity-70">{STR.wall.degraded}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setWallOpen(false)}
            aria-label={STR.wall.close}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm font-bold hover:bg-ink/20"
          >
            ✕
          </button>
        </div>

        <ul className="overflow-y-auto p-4 pt-3" style={{ maxHeight: "56dvh" }}>
          {state.status === "ready" && state.wishes.length === 0 && (
            <li className="py-6 text-center text-sm opacity-60">
              {STR.wall.empty}
            </li>
          )}
          {state.status === "ready" &&
            state.wishes.map((w) => (
              <li
                key={w.id}
                className="mb-2 rounded-2xl bg-white/70 p-3 shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                  {w.name || STR.certificate.anonymousName} ·{" "}
                  {STR.wall.sausageNo(w.n)}
                </div>
                <div className="mt-0.5 text-[15px] leading-snug">{w.wish}</div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
