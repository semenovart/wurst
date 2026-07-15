import { ImageResponse } from "next/og";
import { loadCertFonts } from "@/lib/certificate/fonts.server";
import { OgCertificate } from "@/lib/certificate/OgCertificate";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Wurst Case Scenario — закопай сосиску за погоду";

/** Общая OG-карточка сайта: generic-сертификат без имени */
export default async function Image() {
  const [rubik, rubikBold, caveat] = await loadCertFonts();
  return new ImageResponse(
    <OgCertificate data={{ guestName: "", n: null, approx: false }} />,
    {
      ...size,
      fonts: [
        { name: "Rubik", data: rubik, weight: 400 },
        { name: "Rubik", data: rubikBold, weight: 700 },
        { name: "Caveat", data: caveat, weight: 700 },
      ],
    },
  );
}
