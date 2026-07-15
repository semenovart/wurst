/** Короткий криптослучайный id: 10 hex-символов (5 байт) */
export function randomHex(chars = 10): string {
  const bytes = new Uint8Array(Math.ceil(chars / 2));
  crypto.getRandomValues(bytes);
  return [...bytes]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, chars);
}
