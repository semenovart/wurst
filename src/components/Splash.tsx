import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";
import { SausageFace } from "@/components/SausageFace";
import { CountdownBadge } from "@/components/hud/CountdownBadge";

/**
 * Серверный сплэш: рендерится мгновенно (LCP), пока лениво едет 3D-чанк.
 * После загрузки сцены Experience плавно накрывает его.
 */
export function Splash({ loadingLabel }: { loadingLabel?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky to-sky-deep px-6 pb-safe pt-safe text-center">
      <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.25em] text-cream/80">
        {STR.splash.agency}
      </p>

      <div className="motion-safe-only animate-float-bob">
        <SausageFace className="w-44 drop-shadow-xl sm:w-56" />
      </div>

      <div className="animate-fade-up [animation-delay:120ms]">
        <h1 className="text-3xl font-black tracking-tight text-cream drop-shadow sm:text-5xl">
          {STR.meta.gameTitle}
        </h1>
        <p className="mt-2 text-lg font-bold text-cream/95 drop-shadow">
          {STR.splash.weddingOf(wedding.coupleGenitive)}
        </p>
        <p className="mt-0.5 text-sm text-cream/80">{STR.splash.subtitle}</p>
      </div>

      <CountdownBadge className="animate-fade-up [animation-delay:240ms]" />

      <p
        className="animate-fade-up text-sm text-cream/70 [animation-delay:360ms]"
        aria-live="polite"
      >
        {loadingLabel ?? STR.splash.loading}
      </p>
    </div>
  );
}
