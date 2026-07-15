import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";
import { SplashLogo } from "@/components/SplashLogo";
import { CountdownBadge } from "@/components/hud/CountdownBadge";
import { Button } from "@/components/hud/ui";

/**
 * Стартовый экран: рендерится мгновенно (LCP), пока лениво едет 3D-чанк.
 * Когда сцена готова (ready) — показывает кнопку входа; тап по ней заодно
 * разблокирует WebAudio (первый жест пользователя).
 */
export function Splash({
  loadingLabel,
  ready = false,
  onStart,
}: {
  loadingLabel?: string;
  ready?: boolean;
  onStart?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky to-sky-deep px-6 pb-safe pt-safe text-center">
      <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.25em] text-cream/80">
        {STR.splash.agency}
      </p>

      <div className="animate-fade-up [animation-delay:120ms]">
        <h1 className="sr-only">{STR.meta.gameTitle}</h1>
        <div className="motion-safe-only animate-float-bob">
          <SplashLogo className="w-full max-w-sm drop-shadow-lg sm:max-w-lg" />
        </div>
        <p className="mt-2 text-lg font-bold text-cream/95 drop-shadow">
          {STR.splash.weddingOf(wedding.coupleGenitive)}
        </p>
        <p className="mt-0.5 text-sm text-cream/80">{STR.splash.subtitle}</p>
      </div>

      <CountdownBadge className="animate-fade-up [animation-delay:240ms]" />

      {/* Пока чанк сцены грузится — статус; когда готово — вход по кнопке */}
      <div className="flex min-h-14 items-center" aria-live="polite">
        {onStart && ready ? (
          <Button
            onClick={onStart}
            className="animate-fade-up px-8 py-4 text-lg shadow-xl"
          >
            {STR.splash.enter}
          </Button>
        ) : (
          <p className="animate-fade-up text-sm text-cream/70">
            {loadingLabel ?? STR.splash.loading}
          </p>
        )}
      </div>
    </div>
  );
}
