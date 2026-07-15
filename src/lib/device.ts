"use client";

import { useEffect, useState } from "react";

/** Пробный WebGL-контекст: решаем, грузить ли 3D-чанк вообще */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Пользователь просил меньше движения: без тряски, конфетти и длинных твинов */
export function usePrefersReducedMotion(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/** Тач-устройство (грубый указатель) — влияет на подсказки и размеры целей */
export function useCoarsePointer(): boolean {
  return useMedia("(pointer: coarse)");
}
