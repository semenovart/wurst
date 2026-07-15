import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hasRealRedis } from "./redis";
import { keys } from "./keys";

export type LimiterName = "burial" | "wish";

const WINDOWS: Record<LimiterName, { limit: number; windowSec: number }> = {
  burial: { limit: 5, windowSec: 600 },
  wish: { limit: 3, windowSec: 600 },
};

type LimitResult = { success: boolean };

/** In-memory sliding window для dev без Upstash */
const memHits = new Map<string, number[]>();
function memLimit(name: LimiterName, id: string): LimitResult {
  const { limit, windowSec } = WINDOWS[name];
  const now = Date.now();
  const key = `${name}:${id}`;
  const hits = (memHits.get(key) ?? []).filter(
    (t) => now - t < windowSec * 1000,
  );
  if (hits.length >= limit) {
    memHits.set(key, hits);
    return { success: false };
  }
  hits.push(now);
  memHits.set(key, hits);
  return { success: true };
}

const upstashLimiters = new Map<LimiterName, Ratelimit>();
function upstashLimiter(name: LimiterName): Ratelimit {
  let l = upstashLimiters.get(name);
  if (!l) {
    const { limit, windowSec } = WINDOWS[name];
    l = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `${keys().rl}:${name}`,
    });
    upstashLimiters.set(name, l);
  }
  return l;
}

export async function checkLimit(
  name: LimiterName,
  id: string,
): Promise<LimitResult> {
  if (hasRealRedis()) {
    const { success } = await upstashLimiter(name).limit(id);
    return { success };
  }
  return memLimit(name, id);
}

/** Первый адрес из x-forwarded-for; локально — 'local' */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "local";
  return xff.split(",")[0]?.trim() || "local";
}
