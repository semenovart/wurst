"use client";

import { useEffect, useRef, useState } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";
import { useCoarsePointer } from "@/lib/device";
import {
  drawCertificate,
  ensureCertFonts,
  exportCertificate,
} from "@/lib/certificate/drawCertificate";
import { Button } from "./ui";

/**
 * Финальный экран: превью сертификата (Canvas 2D) + скачивание.
 * Шаринг ссылкой и пожелание подключаются в S6.
 */
export function CertificateModal({ onClose }: { onClose: () => void }) {
  const guestName = useRitualStore((s) => s.guestName);
  const burial = useRitualStore((s) => s.burial);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const coarse = useCoarsePointer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureCertFonts();
      if (cancelled || !canvasRef.current) return;
      drawCertificate(canvasRef.current, {
        guestName,
        n: burial?.n ?? null,
        approx: burial?.approx ?? false,
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [guestName, burial]);

  const download = async () => {
    if (!canvasRef.current) return;
    await exportCertificate(canvasRef.current, "sosiska-certificate.png");
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl animate-fade-up rounded-3xl bg-cream p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <h2 className="px-1 text-lg font-bold">
            {STR.certificate.title} · {STR.certificate.subtitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={STR.a11y.closePanel}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm font-bold hover:bg-ink/20"
          >
            ✕
          </button>
        </div>

        <canvas
          ref={canvasRef}
          role="img"
          aria-label={STR.a11y.certificateImage(
            guestName || STR.certificate.anonymousName,
            burial?.n ?? 0,
          )}
          className={`mt-3 w-full rounded-xl shadow transition-opacity ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />

        {coarse && (
          <p className="mt-2 text-center text-xs opacity-60">
            {STR.certificate.longPressHint}
          </p>
        )}

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button onClick={download}>{STR.certificate.download}</Button>
          {/* S6: Поделиться ссылкой + Оставить пожелание */}
        </div>
      </div>
    </div>
  );
}
