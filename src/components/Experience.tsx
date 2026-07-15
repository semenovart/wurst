"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { Splash } from "@/components/Splash";
import { Hud } from "@/components/hud/Hud";
import { useHasWebGL } from "@/lib/device";
import { STR } from "@/lib/strings.ru";
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

/** Заглушка до полноценного Fallback2D (S8): ритуал «силой мысли» */
function FallbackStub() {
  return <Splash loadingLabel={STR.fallback2d.title} />;
}

/**
 * Оболочка опыта: детект WebGL → ленивый 3D; серверный сплэш
 * лежит снизу и плавно растворяется, когда сцена готова.
 */
export function Experience() {
  const webgl = useHasWebGL();
  const [sceneReady, setSceneReady] = useState(false);
  // На сервере webgl=false → рендерится только сплэш; клиент решает сам
  const mode: "3d" | "2d" = webgl ? "3d" : "2d";

  // Звук разблокируется первым касанием (браузерная политика)
  useEffect(() => {
    initAudio(startAmbient);
  }, []);

  return (
    <div className="relative h-full w-full">
      {mode === "3d" && (
        <div className="canvas-gesture-layer absolute inset-0">
          <SceneErrorBoundary fallback={<FallbackStub />}>
            <Scene3D onReady={() => setSceneReady(true)} />
          </SceneErrorBoundary>
        </div>
      )}

      {mode === "2d" && (
        <div className="absolute inset-0">
          <FallbackStub />
        </div>
      )}

      {/* DOM-интерфейс поверх сцены */}
      {mode === "3d" && <Hud />}

      {/* Сплэш поверх всего, пока сцена не готова */}
      <div
        aria-hidden={sceneReady}
        className={`absolute inset-0 z-20 transition-opacity duration-700 ${
          sceneReady ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Splash />
      </div>
    </div>
  );
}
