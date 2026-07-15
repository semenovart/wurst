import type { Metadata, Viewport } from "next";
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/caveat/700.css";
import "./globals.css";
import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: STR.meta.title(wedding.coupleLabel),
  description: STR.meta.description(wedding.coupleGenitive, wedding.city),
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7ec8f5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="bg-sky font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
