import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import type { WallEntry } from "@/lib/validation";

type BurialHash = {
  n?: number | string;
  name?: string;
  wish?: string;
  wishTs?: number | string;
  hidden?: number | string;
};

/** Счётчик сосисок + последние 50 пожеланий для стены почёта */
export async function GET() {
  try {
    const redis = getRedis();
    const k = keys();
    const [countRaw, ids] = await Promise.all([
      redis.get(k.count),
      redis.zrange(k.wall, 0, 49, { rev: true }),
    ]);
    const hashes = await Promise.all(
      ids.map((id) => redis.hgetall<BurialHash>(k.burial(id))),
    );
    const wishes: WallEntry[] = [];
    hashes.forEach((h, i) => {
      const id = ids[i];
      if (!h || !id || h.hidden || !h.wish) return;
      wishes.push({
        id,
        name: h.name ?? "",
        wish: h.wish,
        n: Number(h.n ?? 0),
        ts: Number(h.wishTs ?? 0),
      });
    });
    return NextResponse.json(
      { count: Number(countRaw ?? 0), wishes },
      {
        headers: {
          "Cache-Control": "s-maxage=15, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "degraded" }, { status: 503 });
  }
}
