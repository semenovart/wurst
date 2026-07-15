"use client";

import { useSyncExternalStore } from "react";

/** Пробный WebGL-контекст: решаем, грузить ли 3D-чанк вообще */
let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglCache = false;
  }
  return webglCache;
}

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Пользователь просил меньше движения: без тряски, конфетти и длинных твинов */
export function usePrefersReducedMotion(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/** Тач-устройство (грубый указатель) — влияет на подсказки и размеры целей */
export function useCoarsePointer(): boolean {
  return useMedia("(pointer: coarse)");
}

const noopSubscribe = () => () => {};

/** SSR-безопасный детект WebGL: false на сервере, реальное значение на клиенте */
export function useHasWebGL(): boolean {
  return useSyncExternalStore(noopSubscribe, hasWebGL, () => false);
}
