"use client";

import { useRitualStore } from "@/store/ritualStore";

/**
 * WebAudio-движок: ленивый AudioContext, разблокировка первым касанием
 * (политика браузеров), шины sfx/ambient → master, мгновенный mute.
 * Ноль аудио-ассетов — весь звук синтезируется (см. sfx.ts).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let unlockAttached = false;
let ambientStarted = false;
let startAmbientFn: (() => void) | null = null;

export function getAudio(): {
  ctx: AudioContext;
  sfx: GainNode;
  amb: GainNode;
} | null {
  if (!ctx || !sfxBus || !ambBus) return null;
  if (ctx.state !== "running") return null;
  return { ctx, sfx: sfxBus, amb: ambBus };
}

function applyMuted(muted: boolean) {
  if (!ctx || !master) return;
  const target = muted ? 0.0001 : 1;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(target, ctx.currentTime, 0.06);
}

function buildGraph() {
  if (ctx) return;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  sfxBus.connect(master);
  ambBus = ctx.createGain();
  ambBus.gain.value = 1;
  ambBus.connect(master);
  applyMuted(useRitualStore.getState().muted);
  // mute из стора — единственный источник правды
  useRitualStore.subscribe((s) => s.muted, applyMuted);
}

async function unlock() {
  buildGraph();
  if (!ctx) return;
  try {
    await ctx.resume();
    // тихий буфер будит iOS-аудиотракт
    const silent = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silent;
    src.connect(ctx.destination);
    src.start(0);
    if (!ambientStarted && startAmbientFn) {
      ambientStarted = true;
      startAmbientFn();
    }
  } catch {
    /* попробуем на следующем касании */
  }
}

/**
 * Вешает одноразовый unlock на первое касание страницы.
 * ambient — колбэк запуска фоновых звуков (из sfx.ts), стартует после unlock.
 */
export function initAudio(startAmbient: () => void) {
  if (unlockAttached || typeof window === "undefined") return;
  unlockAttached = true;
  startAmbientFn = startAmbient;
  const handler = () => void unlock();
  window.addEventListener("pointerdown", handler, {
    once: true,
    capture: true,
  });
}

/** Общий буфер белого шума (1 с) — переиспользуется всеми эффектами */
let noiseBuffer: AudioBuffer | null = null;
export function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate)
    return noiseBuffer;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}
