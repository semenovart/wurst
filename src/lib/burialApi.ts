"use client";

import { useRitualStore, type Burial } from "@/store/ritualStore";
import type { WallEntry } from "@/lib/validation";
import { randomHex } from "@/lib/ids";

/**
 * Клиентский слой API. Главный принцип: ритуал НИКОГДА не блокируется
 * бэкендом — при недоступности сервера выдаём локальный «№ ~N, уточняется»
 * и тихо ретраим в фоне.
 */

const LAST_COUNT_KEY = "sosiska:lastCount";

type WallData = { count: number; wishes: WallEntry[] };

function rememberCount(count: number) {
  try {
    sessionStorage.setItem(LAST_COUNT_KEY, String(count));
  } catch {
    /* приватный режим — ну и ладно */
  }
}

function lastKnownCount(): number {
  try {
    return Number(sessionStorage.getItem(LAST_COUNT_KEY) ?? "0");
  } catch {
    return 0;
  }
}

async function postBurial(name: string): Promise<Burial> {
  const res = await fetch("/api/burial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`burial ${res.status}`);
  const data = (await res.json()) as { id: string; n: number };
  return { id: data.id, n: data.n };
}

let inFlight = false;

/**
 * Регистрирует сосиску. Вызывается на старте церемонии.
 * Успех → честный номер; провал → локальный approx-номер + фоновые ретраи.
 */
export async function registerBurial(): Promise<void> {
  const st = useRitualStore.getState();
  if (st.burial || inFlight) return;
  inFlight = true;
  try {
    const burial = await postBurial(st.guestName);
    rememberCount(burial.n);
    useRitualStore.getState().setBurial(burial);
  } catch {
    // локальный сертификат «№ ~N, уточняется»
    useRitualStore.getState().setBurial({
      id: `local-${randomHex(6)}`,
      n: lastKnownCount() + 1,
      approx: true,
    });
    retryRegister(1);
  } finally {
    inFlight = false;
  }
}

function retryRegister(attempt: number) {
  if (attempt > 5) return;
  setTimeout(
    async () => {
      const st = useRitualStore.getState();
      if (!st.burial?.approx) return; // уже успешно
      try {
        const burial = await postBurial(st.guestName);
        rememberCount(burial.n);
        useRitualStore.getState().setBurial(burial);
      } catch {
        retryRegister(attempt + 1);
      }
    },
    Math.min(30_000, 2 ** attempt * 2000),
  );
}

export type WishOutcome = "ok" | "duplicate" | "rejected" | "failed";

export async function submitWish(
  id: string,
  wish: string,
): Promise<WishOutcome> {
  try {
    const res = await fetch("/api/wish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, wish }),
    });
    if (res.ok) return "ok";
    if (res.status === 409) return "duplicate";
    if (res.status === 422) return "rejected";
    return "failed";
  } catch {
    return "failed";
  }
}

const WALL_CACHE_KEY = "sosiska:wallCache";

export async function fetchWall(): Promise<WallData | null> {
  try {
    const res = await fetch("/api/wall");
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as WallData;
    rememberCount(data.count);
    try {
      sessionStorage.setItem(WALL_CACHE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
    return data;
  } catch {
    try {
      const cached = sessionStorage.getItem(WALL_CACHE_KEY);
      return cached ? (JSON.parse(cached) as WallData) : null;
    } catch {
      return null;
    }
  }
}
