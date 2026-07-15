import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * TTF-шрифты для satori (WOFF2 он не умеет). Литеральные пути от
 * process.cwd() трассируются Next'ом в серверный бандл.
 */
let cache: Promise<[Buffer, Buffer, Buffer]> | null = null;

export function loadCertFonts(): Promise<[Buffer, Buffer, Buffer]> {
  cache ??= Promise.all([
    readFile(path.join(process.cwd(), "src/assets/fonts/rubik-400.ttf")),
    readFile(path.join(process.cwd(), "src/assets/fonts/rubik-700.ttf")),
    readFile(path.join(process.cwd(), "src/assets/fonts/caveat-700.ttf")),
  ]);
  return cache;
}
