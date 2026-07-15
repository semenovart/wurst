"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { Splash } from "@/components/Splash";
import { Hud } from "@/components/hud/Hud";
import { Fallback2D } from "@/components/fallback/Fallback2D";
import { useHasWebGL } from "@/lib/device";
import { initAudio } from "@/lib/audio/engine";
import { startAmbient } from "@/lib/audio/sfx";

const Scene3D = dynamic(() => import("@/components/scene/Scene3D"), {
  ssr: false,
  loading: () => null,
});

/** Рантайм-падение WebGL (потеря контекста и т.п.) → мягкий фолбэк */
class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Оболочка опыта: детект WebGL → ленивый 3D; серверный сплэш
 * лежит снизу и плавно растворяется, когда сцена готова.
 */
export function Experience() {
  const webgl = useHasWebGL();
  const [sceneReady, setSceneReady] = useState(false);
  // Сплэш — стартовый экран: держится до явного входа по кнопке
  const [entered, setEntered] = useState(false);
  // На сервере webgl=false → рендерится только сплэш; клиент решает сам
  const mode: "3d" | "2d" = webgl ? "3d" : "2d";

  // Звук разблокируется первым касанием (браузерная политика);
  // обычно это тап по кнопке «На лужайку» — эмбиент стартует сразу за ним
  useEffect(() => {
    initAudio(startAmbient);
  }, []);

  return (
    <div className="relative h-full w-full">
      {mode === "3d" && (
        <div className="canvas-gesture-layer absolute inset-0">
          <SceneErrorBoundary fallback={<Fallback2D />}>
            <Scene3D onReady={() => setSceneReady(true)} />
          </SceneErrorBoundary>
        </div>
      )}

      {mode === "2d" && (
        <div className="absolute inset-0">
          <Fallback2D />
        </div>
      )}

      {/* DOM-интерфейс (сертификат/стена/счётчик) нужен в обоих режимах */}
      <Hud gestures={mode === "3d"} />

      {/* Сплэш-титульник поверх всего: уходит по кнопке «На лужайку» */}
      <div
        aria-hidden={entered}
        className={`absolute inset-0 z-20 transition-opacity duration-700 ${
          entered ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Splash
          ready={sceneReady || mode === "2d"}
          onStart={() => setEntered(true)}
        />
      </div>
    </div>
  );
}
