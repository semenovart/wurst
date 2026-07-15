"use client";

import { useRitualStore } from "@/store/ritualStore";

/**
 * Вибрация (Vibration API). Android — работает, iOS Safari — честно ничего.
 * Выключается вместе со звуком (одна настройка «звук и вибро»).
 */

const PATTERNS = {
  dig: [8],
  clod: [5],
  splat: [40, 60, 30],
  pour: [6, 40, 6],
  tamp: [20],
  fanfare: [30, 60, 30, 60, 90],
} as const;

export type HapticKind = keyof typeof PATTERNS;

let lastAt = 0;

export function haptic(kind: HapticKind) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (useRitualStore.getState().muted) return;
  const now = Date.now();
  if (now - lastAt < 50) return; // троттлинг, чтобы не жужжать непрерывно
  lastAt = now;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* некоторые webview кидаются — молча пропускаем */
  }
}
