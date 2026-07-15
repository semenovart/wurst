import { Redis } from "@upstash/redis";

/**
 * Мини-интерфейс Redis: ровно те команды, что нужны приложению.
 * Реализации: Upstash (env заданы) | in-memory (локальная разработка).
 */
export type MiniRedis = {
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  hset(key: string, value: Record<string, unknown>): Promise<unknown>;
  hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null>;
  hdel(key: string, ...fields: string[]): Promise<unknown>;
  zadd(key: string, entry: { score: number; member: string }): Promise<unknown>;
  zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean },
  ): Promise<string[]>;
  zrem(key: string, member: string): Promise<unknown>;
  zremrangebyrank(key: string, start: number, stop: number): Promise<unknown>;
};

export function hasRealRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/** In-memory реализация для dev без сети. Данные живут до рестарта процесса. */
function createMemoryRedis(): MiniRedis {
  const strings = new Map<string, string>();
  const hashes = new Map<string, Map<string, unknown>>();
  const zsets = new Map<string, Map<string, number>>();

  const sortedMembers = (key: string): string[] => {
    const z = zsets.get(key);
    if (!z) return [];
    return [...z.entries()].sort((a, b) => a[1] - b[1]).map(([m]) => m);
  };

  return {
    async get(key) {
      return strings.get(key) ?? null;
    },
    async incr(key) {
      const next = Number(strings.get(key) ?? "0") + 1;
      strings.set(key, String(next));
      return next;
    },
    async hset(key, value) {
      const h = hashes.get(key) ?? new Map<string, unknown>();
      for (const [f, v] of Object.entries(value)) h.set(f, v);
      hashes.set(key, h);
      return Object.keys(value).length;
    },
    async hgetall<T extends Record<string, unknown>>(key: string) {
      const h = hashes.get(key);
      if (!h || h.size === 0) return null;
      return Object.fromEntries(h.entries()) as T;
    },
    async hdel(key, ...fields) {
      const h = hashes.get(key);
      if (!h) return 0;
      let removed = 0;
      for (const f of fields) if (h.delete(f)) removed++;
      return removed;
    },
    async zadd(key, { score, member }) {
      const z = zsets.get(key) ?? new Map<string, number>();
      z.set(member, score);
      zsets.set(key, z);
      return 1;
    },
    async zrange(key, start, stop, opts) {
      let members = sortedMembers(key);
      if (opts?.rev) members = members.reverse();
      const end = stop === -1 ? members.length - 1 : stop;
      return members.slice(start, end + 1);
    },
    async zrem(key, member) {
      return zsets.get(key)?.delete(member) ? 1 : 0;
    },
    async zremrangebyrank(key, start, stop) {
      const z = zsets.get(key);
      if (!z) return 0;
      const members = sortedMembers(key);
      const end = stop < 0 ? members.length + stop : stop;
      const toRemove = members.slice(start, end + 1);
      toRemove.forEach((m) => z.delete(m));
      return toRemove.length;
    },
  };
}

declare global {
  var __memRedis: MiniRedis | undefined;
}

/**
 * Единая точка доступа. С env — Upstash (сетевые ошибки НЕ маскируются,
 * роуты отвечают 503 degraded); без env — in-memory для dev.
 */
export function getRedis(): MiniRedis {
  if (hasRealRedis()) {
    // Upstash-клиент структурно совместим с MiniRedis по используемым командам
    return Redis.fromEnv() as unknown as MiniRedis;
  }
  globalThis.__memRedis ??= createMemoryRedis();
  return globalThis.__memRedis;
}
