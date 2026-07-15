import {
  CERT_W,
  CERT_H,
  CERT_SCALE,
  CERT_COLORS as C,
  certTexts,
  type CertData,
} from "./spec";

/** Перенос текста по ширине */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Текст по дуге окружности (для печати) */
function circularText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
) {
  const step = (Math.PI * 2) / text.length;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(startAngle);
  for (const ch of text) {
    ctx.save();
    ctx.translate(0, -radius);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    ctx.rotate(step);
  }
  ctx.restore();
}

/** Мини-маскот (плоский, как SausageFace) */
function drawMiniMascot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.24);
  ctx.scale(scale, scale);
  // тело
  ctx.fillStyle = C.sausage;
  ctx.strokeStyle = C.sausageDark;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-62, -26, 124, 52, 26);
  ctx.fill();
  ctx.stroke();
  // глаза
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(-14, -4, 7, 0, Math.PI * 2);
  ctx.arc(14, -4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-11.5, -6.5, 2.4, 0, Math.PI * 2);
  ctx.arc(16.5, -6.5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // румянец
  ctx.fillStyle = C.blush;
  ctx.beginPath();
  ctx.arc(-30, 6, 6, 0, Math.PI * 2);
  ctx.arc(30, 6, 6, 0, Math.PI * 2);
  ctx.fill();
  // улыбка
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 4, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

/** Радуга-декор в углу */
function drawRainbow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r0: number,
) {
  ctx.save();
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  C.rainbow.forEach((color, i) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, r0 + i * 9, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * Рисует сертификат в canvas (2400×1260, координаты — в системе 1200×630).
 * Требует загруженных шрифтов: вызывающий делает await ensureCertFonts().
 */
export function drawCertificate(canvas: HTMLCanvasElement, data: CertData) {
  const t = certTexts(data);
  canvas.width = CERT_W * CERT_SCALE;
  canvas.height = CERT_H * CERT_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(CERT_SCALE, CERT_SCALE);

  // фон
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CERT_W, CERT_H);

  // рамки
  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(24, 24, CERT_W - 48, CERT_H - 48, 26);
  ctx.stroke();
  ctx.strokeStyle = C.frameThin;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(44, 44, CERT_W - 88, CERT_H - 88, 16);
  ctx.stroke();

  // декор
  drawRainbow(ctx, CERT_W - 84, 128, 28);
  drawMiniMascot(ctx, 158, 470, 1.05);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // шапка
  ctx.fillStyle = C.accent;
  ctx.font = "700 24px Rubik";
  ctx.save();
  // разрядка «канцелярской» шапки
  const agency = t.agency.split("").join("  ");
  ctx.fillText(agency, CERT_W / 2, 92);
  ctx.restore();

  // заголовок
  ctx.fillStyle = C.ink;
  ctx.font = "700 82px Rubik";
  ctx.fillText(t.title, CERT_W / 2, 168);
  ctx.font = "400 30px Rubik";
  ctx.fillText(t.subtitle, CERT_W / 2, 222);

  // удостоверяющий текст
  ctx.font = "400 25px Rubik";
  ctx.fillStyle = C.ink;
  const lines = wrapText(ctx, t.certifies, 760);
  lines.forEach((line, i) => {
    ctx.fillText(line, CERT_W / 2, 286 + i * 34);
  });

  // имя гостя — рукописно
  ctx.fillStyle = C.accent;
  ctx.font = "700 62px Caveat";
  ctx.fillText(t.name, CERT_W / 2, 392);

  // ради чьей свадьбы
  ctx.fillStyle = C.ink;
  ctx.font = "400 24px Rubik";
  ctx.fillText(t.forWedding, CERT_W / 2, 442);

  // номер сосиски
  ctx.font = "700 38px Rubik";
  ctx.fillText(t.sausageNo, CERT_W / 2, 500);

  // подпись слева-снизу
  ctx.textAlign = "left";
  ctx.fillStyle = C.accent;
  ctx.font = "700 40px Caveat";
  ctx.fillText(t.signatureName, 96, 548);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(92, 566);
  ctx.lineTo(330, 566);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = "400 17px Rubik";
  ctx.fillText(t.signature, 96, 582);

  // место
  ctx.textAlign = "right";
  ctx.font = "400 17px Rubik";
  ctx.fillText(t.place, CERT_W - 96, 582);

  // бренд игры — мелко по центру снизу
  ctx.textAlign = "center";
  ctx.font = "400 15px Rubik";
  ctx.globalAlpha = 0.55;
  ctx.fillText(t.brand, CERT_W / 2, 582);
  ctx.globalAlpha = 1;

  // печать
  const sx = CERT_W - 190;
  const sy = 470;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(-0.21);
  ctx.translate(-sx, -sy);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = C.stamp;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sx, sy, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = C.stamp;
  ctx.font = "700 16px Rubik";
  circularText(ctx, t.stamp, sx, sy, 73, -Math.PI / 2);
  ctx.font = "700 20px Rubik";
  ctx.textAlign = "center";
  ctx.fillText("МЕТЕО", sx, sy - 12);
  ctx.fillText("РИТУАЛ", sx, sy + 12);
  ctx.restore();
}

/** Гарантирует, что нужные начертания загружены до рисования */
export async function ensureCertFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  await Promise.all([
    document.fonts.load("700 82px Rubik", "СЕРТИФИКАТ"),
    document.fonts.load("400 25px Rubik", "удостоверяется"),
    document.fonts.load("700 62px Caveat", "Артём"),
    document.fonts.ready,
  ]);
}

/** Скачивание/шаринг PNG: share files → a[download] → просто оставляем превью */
export async function exportCertificate(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<"shared" | "downloaded" | "none"> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return "none";
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (d: ShareData) => boolean;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch {
      /* пользователь отменил — падаем в скачивание */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
