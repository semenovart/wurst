"use client";

import { create, type StateCreator } from "zustand";
import {
  persist,
  subscribeWithSelector,
  createJSONStorage,
} from "zustand/middleware";
import { NEXT, type Phase } from "./phases";

/** Сколько «хлопков» утаптывания нужно для финала */
export const TAMP_GOAL = 5;

export type Burial = {
  id: string;
  n: number;
  /** true, если номер локальный (бэкенд был недоступен) и уточняется */
  approx?: boolean;
  wishSent?: boolean;
};

export type RitualState = {
  phase: Phase;
  /** Индекс реплики маскота; >= числа реплик → показываем форму имени */
  dialogueStep: number;
  guestName: string;
  /** Подтверждённое место ямы (x, z) */
  spot: [number, number] | null;
  /** Кандидат места до подтверждения */
  candidateSpot: [number, number] | null;
  /** 0..1, квантованный шагом ~0.05 — не дёргает React каждый кадр */
  digProgress: number;
  fillProgress: number;
  tampCount: number;
  burial: Burial | null;
  muted: boolean;
  wallOpen: boolean;

  advance: () => void;
  nextDialogue: () => void;
  skipDialogue: () => void;
  setGuestName: (name: string) => void;
  setCandidateSpot: (xz: [number, number] | null) => void;
  confirmSpot: () => void;
  setDigProgress: (v: number) => void;
  setFillProgress: (v: number) => void;
  tamp: () => void;
  setBurial: (b: Burial) => void;
  markWishSent: () => void;
  setMuted: (m: boolean) => void;
  setWallOpen: (o: boolean) => void;
};

/** Guard'ы выхода из фазы: advance() из фазы разрешён, только если guard истинен */
const EXIT_GUARDS: Partial<Record<Phase, (s: RitualState) => boolean>> = {
  chooseSpot: (s) => s.spot !== null,
  dig: (s) => s.digProgress >= 1,
  fill: (s) => s.fillProgress >= 1,
  tamp: (s) => s.tampCount >= TAMP_GOAL,
};

export const DIALOGUE_LINES_COUNT = 3;

/**
 * Чистый state-creator: тестируется vanilla-стором без persist,
 * приложение оборачивает его в persist + subscribeWithSelector.
 */
export const createRitualState: StateCreator<RitualState> = (set, get) => ({
  phase: "hello",
  dialogueStep: 0,
  guestName: "",
  spot: null,
  candidateSpot: null,
  digProgress: 0,
  fillProgress: 0,
  tampCount: 0,
  burial: null,
  muted: false,
  wallOpen: false,

  advance: () => {
    const s = get();
    const next = NEXT[s.phase];
    if (!next) return; // из терминальных фаз пути вперёд нет
    const guard = EXIT_GUARDS[s.phase];
    if (guard && !guard(s)) return; // условие не выполнено — no-op
    set({ phase: next });
  },

  nextDialogue: () => {
    const s = get();
    if (s.phase !== "hello") return;
    set({ dialogueStep: s.dialogueStep + 1 });
  },

  skipDialogue: () => {
    const s = get();
    if (s.phase !== "hello") return;
    set({ dialogueStep: DIALOGUE_LINES_COUNT });
  },

  setGuestName: (name) => set({ guestName: name.trim().slice(0, 40) }),

  setCandidateSpot: (xz) => set({ candidateSpot: xz }),

  confirmSpot: () => {
    const s = get();
    if (s.phase !== "chooseSpot" || !s.candidateSpot) return;
    set({ spot: s.candidateSpot, candidateSpot: null });
    get().advance();
  },

  setDigProgress: (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    if (Math.abs(clamped - get().digProgress) < 0.001) return;
    set({ digProgress: clamped });
  },

  setFillProgress: (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    if (Math.abs(clamped - get().fillProgress) < 0.001) return;
    set({ fillProgress: clamped });
  },

  tamp: () => {
    const s = get();
    if (s.phase !== "tamp") return;
    const tampCount = s.tampCount + 1;
    set({ tampCount });
    if (tampCount >= TAMP_GOAL) get().advance();
  },

  setBurial: (b) => set({ burial: b }),

  markWishSent: () => {
    const b = get().burial;
    if (b) set({ burial: { ...b, wishSent: true } });
  },

  setMuted: (m) => set({ muted: m }),
  setWallOpen: (o) => set({ wallOpen: o }),
});

type PersistedSlice = Pick<RitualState, "guestName" | "burial" | "muted">;

export const useRitualStore = create<RitualState>()(
  subscribeWithSelector(
    persist(createRitualState, {
      name: "sosiska:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedSlice => ({
        guestName: s.guestName,
        burial: s.burial,
        muted: s.muted,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedSlice>;
        return {
          ...current,
          ...p,
          // Гость с закопанной сосиской попадает сразу в «returned»
          phase: p.burial ? "returned" : current.phase,
        };
      },
    }),
  ),
);
