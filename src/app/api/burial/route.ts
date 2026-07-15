import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { burialSchema } from "@/lib/validation";
import { isProfane } from "@/lib/moderation";
import { checkLimit, getClientIp } from "@/lib/ratelimit";
import { randomHex } from "@/lib/ids";

/** Регистрация закопанной сосиски: честный номер + id для share-ссылки */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = burialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const name = parsed.data.name;

  if (name && isProfane(name)) {
    return NextResponse.json({ error: "moderation" }, { status: 422 });
  }

  const rl = await checkLimit("burial", getClientIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const redis = getRedis();
    const k = keys();
    const n = await redis.incr(k.count);
    const id = randomHex(10);
    await redis.hset(k.burial(id), { n, name, ts: Date.now() });
    return NextResponse.json({ id, n }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "degraded" }, { status: 503 });
  }
}
