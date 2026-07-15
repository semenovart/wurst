import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";

/**
 * Единый источник правды для дизайна сертификата.
 * Клиент рисует его в Canvas 2D (drawCertificate), сервер — в satori (S6):
 * одинаковые размеры, палитра и тексты = «тот же документ».
 */

export const CERT_W = 1200;
export const CERT_H = 630;
/** Клиентский рендер в ×2 для ретины */
export const CERT_SCALE = 2;

export const CERT_COLORS = {
  bg: "#fff8ec",
  frame: "#e1764c",
  frameThin: "#3a2e26",
  ink: "#3a2e26",
  accent: "#b85433",
  stamp: "#4263eb",
  sausage: "#e1764c",
  sausageDark: "#b85433",
  blush: "#f2a48b",
  rainbow: ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#b197fc"],
} as const;

export type CertData = {
  guestName: string; // "" → «Неизвестный Закапыватель»
  n: number | null; // null → номер ещё не присвоен
  approx: boolean;
};

export function certTexts(data: CertData) {
  const name = data.guestName.trim() || STR.certificate.anonymousName;
  // «ОДОБРЕНО • ОСАДКИ ОТМЕНЕНЫ •» → верхняя и нижняя дуги печати
  const stampParts = STR.certificate.stamp
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);
  const dateLabel = new Date(wedding.dateISO).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    agency: STR.certificate.agency,
    title: STR.certificate.title,
    subtitle: STR.certificate.subtitle,
    certifies: STR.certificate.certifies(name),
    name,
    forWedding: STR.certificate.forWedding(wedding.coupleGenitive, dateLabel),
    sausageNo:
      data.n === null
        ? "Сосиска № …"
        : data.approx
          ? STR.certificate.sausageNoApprox(data.n)
          : STR.certificate.sausageNo(data.n),
    stampTop: stampParts[0] ?? "ОДОБРЕНО",
    stampBottom: stampParts[1] ?? "ОСАДКИ ОТМЕНЕНЫ",
    stampCenter: ["МЕТЕО", "РИТУАЛ"] as const,
    signature: STR.certificate.signature,
    signatureName: STR.certificate.signatureName,
    place: `${wedding.city}`,
    brand: `· ${STR.meta.gameTitle.toLowerCase()} ·`,
  };
}
