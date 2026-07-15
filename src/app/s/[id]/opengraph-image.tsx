import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { loadCertFonts } from "@/lib/certificate/fonts.server";
import { OgCertificate } from "@/lib/certificate/OgCertificate";
import type { CertData } from "@/lib/certificate/spec";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Сертификат гаранта хорошей погоды";

type BurialHash = { n?: number | string; name?: string };

/** Персональный OG-сертификат: мессенджер разворачивает ссылку /s/[id] */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: CertData = { guestName: "", n: null, approx: false };
  if (/^[0-9a-f]{10}$/.test(id)) {
    try {
      const burial = await getRedis().hgetall<BurialHash>(keys().burial(id));
      if (burial) {
        data = {
          guestName: burial.name ?? "",
          n: Number(burial.n ?? 0) || null,
          approx: false,
        };
      }
    } catch {
      /* generic-вариант карточки */
    }
  }

  const [rubik, rubikBold, caveat] = await loadCertFonts();
  return new ImageResponse(<OgCertificate data={data} />, {
    ...size,
    fonts: [
      { name: "Rubik", data: rubik, weight: 400 },
      { name: "Rubik", data: rubikBold, weight: 700 },
      { name: "Caveat", data: caveat, weight: 700 },
    ],
  });
}
