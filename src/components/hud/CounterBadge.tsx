"use client";

import { useEffect, useState } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { fetchWall } from "@/lib/burialApi";
import { STR } from "@/lib/strings.ru";

/**
 * «N сосисок» — живой счётчик и кнопка стены почёта.
 * Обновляется при монтировании и каждые 20 с.
 */
export function CounterBadge() {
  const setWallOpen = useRitualStore((s) => s.setWallOpen);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const data = await fetchWall();
      if (alive && data) setCount(data.count);
    };
    void load();
    const iv = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => setWallOpen(true)}
      className="pointer-events-auto flex touch-manipulation items-center gap-2 rounded-2xl bg-cream/90 px-3 py-2 text-sm font-bold text-ink shadow-lg backdrop-blur transition active:scale-95"
      aria-label={STR.wall.open}
    >
      <span aria-hidden="true">🌭</span>
      {count === null ? STR.wall.open : STR.wall.counterShort(count)}
    </button>
  );
}
