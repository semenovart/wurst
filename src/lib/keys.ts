import { wedding } from "@/config/wedding.config";

/**
 * Билдер ключей Redis. scope в v1 — слаг свадьбы из конфига;
 * в v2 станет параметром (/w/[slug] → своя пачка ключей).
 */
export function keys(scope: string = wedding.slug) {
  return {
    /** STRING, INCR — честный порядковый номер сосиски */
    count: `s:${scope}:count`,
    /** HASH: { n, name, ts, wish?, wishTs? } */
    burial: (id: string) => `s:${scope}:burial:${id}`,
    /** ZSET: member=id, score=wishTs — только записи с пожеланием */
    wall: `s:${scope}:wall`,
    /** префикс служебных ключей rate limit */
    rl: `s:${scope}:rl`,
  } as const;
}
