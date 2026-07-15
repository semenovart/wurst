import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";

const sha = (s: string) => createHash("sha256").update(s).digest();

/**
 * Скрытое удаление пожелания со стены (заголовок x-admin-key).
 * Сертификат гостя при этом остаётся живым.
 *
 * id пожелания берётся из GET /api/wall.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const secret = process.env.ADMIN_SECRET;
  const provided = req.headers.get("x-admin-key") ?? "";
  // сравнение хэшей уравнивает длины → timingSafeEqual без утечек
  if (!secret || !timingSafeEqual(sha(provided), sha(secret))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!/^[0-9a-f]{10}$/.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const redis = getRedis();
    const k = keys();
    await redis.zrem(k.wall, id);
    await redis.hdel(k.burial(id), "wish", "wishTs");
    await redis.hset(k.burial(id), { hidden: 1 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "degraded" }, { status: 503 });
  }
}
