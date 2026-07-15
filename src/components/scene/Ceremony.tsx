import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRitualStore } from "@/store/ritualStore";
import { usePrefersReducedMotion } from "@/lib/device";
import { fxBus, ceremonyMix } from "./interactionBus";

/**
 * Дирижёр финала: ведёт ceremonyMix (0→1), стреляет конфетти
 * и по завершении таймлайна переводит ритуал к сертификату.
 */
export function Ceremony() {
  const phase = useRitualStore((s) => s.phase);
  const reduced = usePrefersReducedMotion();
  const t0 = useRef<number | null>(null);
  const burstsDone = useRef(0);

  useFrame(({ clock }, dt) => {
    if (phase === "ceremony") {
      if (t0.current === null) t0.current = clock.elapsedTime;
      const t = clock.elapsedTime - t0.current;

      // Плавный вход в «золото» за ~2 с
      ceremonyMix.v = Math.min(1, t / (reduced ? 1.2 : 2));

      // Конфетти-залпы над ямой
      const bursts = reduced ? [] : [1.2, 2.2, 3.4];
      const next = bursts[burstsDone.current];
      if (next !== undefined && t > next) {
        const spot = useRitualStore.getState().spot ?? [0, 0];
        fxBus.spawn({
          x: spot[0],
          y: 1.3,
          z: spot[1],
          count: 45,
          kind: "confetti",
        });
        burstsDone.current++;
      }

      if (t > (reduced ? 3 : 5.5)) {
        useRitualStore.getState().advance(); // → certificate
      }
      return;
    }

    if (phase === "certificate") {
      ceremonyMix.v = 1; // золотой свет остаётся на финальном экране
      return;
    }

    // Любая другая фаза — плавно возвращаем день и сбрасываем таймер
    t0.current = null;
    burstsDone.current = 0;
    if (ceremonyMix.v > 0) {
      ceremonyMix.v = Math.max(0, ceremonyMix.v - dt * 0.8);
    }
  });

  return null;
}
