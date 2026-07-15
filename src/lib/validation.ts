import { z } from "zod";

/** POST /api/burial */
export const burialSchema = z.object({
  name: z.string().trim().max(40).optional().default(""),
});

/** POST /api/wish */
export const wishSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-f]{10}$/, "ожидается 10 hex-символов"),
  wish: z.string().trim().min(1).max(140),
});

/** Запись стены, отдаваемая клиенту */
export type WallEntry = {
  id: string;
  name: string;
  wish: string;
  n: number;
  ts: number;
};
