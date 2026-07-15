"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { SkyDome } from "./SkyDome";
import { Lights } from "./Lights";
import { Terrain } from "./Terrain";
import { Lawn } from "./Lawn";
import { CloudField } from "./CloudField";
import { Mascot } from "./Mascot";
import { CameraRig } from "./CameraRig";

function ReadySignal({ onReady }: { onReady?: () => void }) {
  // Вызывается внутри Canvas после монтирования всего дерева сцены
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/**
 * 3D-сцена. Загружается лениво (three-чанк) из Experience.
 */
export default function Scene3D({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 50, position: [0, 1.6, 4.4], near: 0.1, far: 90 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <SkyDome />
      <Lights />
      <Terrain />
      <Lawn />
      <CloudField />
      <Mascot />
      <CameraRig phase="hello" />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
