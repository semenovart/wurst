import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { wishSchema } from "@/lib/validation";
import { isProfane } from "@/lib/moderation";
import { checkLimit, getClientIp } from "@/lib/ratelimit";

const WALL_CAP = 500;

/** Пожелание паре: одно на сосиску, после модерации попадает на стену */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = wishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { id, wish } = parsed.data;

  if (isProfane(wish)) {
    return NextResponse.json({ error: "moderation" }, { status: 422 });
  }

  const rl = await checkLimit("wish", getClientIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const redis = getRedis();
    const k = keys();
    const burial = await redis.hgetall<{ wish?: string }>(k.burial(id));
    if (!burial) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (burial.wish) {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    const wishTs = Date.now();
    await redis.hset(k.burial(id), { wish, wishTs });
    await redis.zadd(k.wall, { score: wishTs, member: id });
    // держим стену компактной: только последние WALL_CAP записей
    await redis.zremrangebyrank(k.wall, 0, -(WALL_CAP + 1));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "degraded" }, { status: 503 });
  }
}
