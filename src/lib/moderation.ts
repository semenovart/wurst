/**
 * Лёгкая серверная модерация имён и пожеланий (стена читается бабушками).
 * Два взгляда на текст: «кириллический» (латинские двойники и leet приводятся
 * к кириллице) и «латинский» (как есть) — каждый со своим словарём.
 * Allowlist безобидных слов имеет приоритет.
 *
 * Это фильтр «пьяного шутника», а не непробиваемая стена: явную грязь ловит,
 * креативную — снимет админ-эндпоинт.
 */

/** Латинские двойники и leet → кириллица */
const TO_CYR: Record<string, string> = {
  a: "а",
  b: "б",
  c: "с",
  e: "е",
  h: "н",
  k: "к",
  m: "м",
  o: "о",
  p: "р",
  r: "г",
  t: "т",
  u: "и",
  x: "х",
  y: "у",
  "0": "о",
  "1": "и",
  "3": "з",
  "4": "ч",
  "6": "б",
  "9": "д",
  "@": "а",
  $: "с",
};

/** Leet → латиница (для английских слов) */
const TO_LAT: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "@": "a",
  $: "s",
};

/** Кириллические корни, запрещённые как подстроки */
const RU_ROOTS = [
  "хуй",
  "хуе",
  "хуя",
  "хуи",
  "пизд",
  "бляд",
  "блят",
  "ебан",
  "ебат",
  "ебал",
  "ебну",
  "ебуч",
  "заеб",
  "уебо",
  "въеб",
  "выеб",
  "долбоеб",
  "пидор",
  "пидар",
  "педик",
  "мудак",
  "мудач",
  "гандон",
  "гондон",
  "шлюх",
  "мразь",
  "мрази",
  "залуп",
  "дроч",
];

/** Английские корни-подстроки */
const EN_ROOTS = [
  "fuck",
  "fuk",
  "shit",
  "cunt",
  "bitch",
  "whore",
  "nigg",
  "faggot",
  "asshole",
  "dickhead",
];

/** Точные слова по границам (как подстроки дали бы ложняки) */
const RU_WORDS = new Set([
  "бля",
  "сука",
  "суки",
  "сучка",
  "хер",
  "жопа",
  "срань",
  "говно",
  "гавно",
  "член",
]);
const EN_WORDS = new Set(["ass", "cock", "dick", "slut"]);

/** Безобидные слова, в которых «прячутся» корни — приоритет над матчами */
const ALLOWLIST = [
  "оскорб",
  "употреб",
  "потреб",
  "истреб",
  "требов",
  "рубл",
  "команд",
  "мандарин",
  "мандат",
  "скипидар",
  "член семьи", // устойчивое безобидное
];

const squashRepeats = (s: string) => s.replace(/(.)\1{1,}/g, "$1");

/** Кириллический взгляд: двойники→кириллица, только буквы и пробелы */
export function normalizeCyr(input: string): string {
  let s = input.toLowerCase().replaceAll("ё", "е");
  s = [...s].map((ch) => TO_CYR[ch] ?? ch).join("");
  s = s.replace(/[^а-я ]+/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return squashRepeats(s);
}

/** Латинский взгляд: leet→латиница, только буквы и пробелы */
export function normalizeLat(input: string): string {
  let s = input.toLowerCase();
  s = [...s].map((ch) => TO_LAT[ch] ?? ch).join("");
  s = s.replace(/[^a-z ]+/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return squashRepeats(s);
}

function hitsDict(
  normalized: string,
  roots: string[],
  words: ReadonlySet<string>,
): boolean {
  const glued = normalized.replaceAll(" ", "");
  if (ALLOWLIST.some((ok) => normalized.includes(ok) || glued.includes(ok))) {
    return false;
  }
  if (roots.some((r) => glued.includes(r))) return true;
  return normalized.split(" ").some((w) => words.has(w));
}

/** true → текст публиковать нельзя */
export function isProfane(input: string): boolean {
  return (
    hitsDict(normalizeCyr(input), RU_ROOTS, RU_WORDS) ||
    hitsDict(normalizeLat(input), EN_ROOTS, EN_WORDS)
  );
}
