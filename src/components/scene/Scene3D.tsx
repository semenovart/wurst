"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { SkyDome } from "./SkyDome";
import { Lights } from "./Lights";
import { Terrain } from "./Terrain";
import { Lawn } from "./Lawn";
import { CloudField } from "./CloudField";
import { Mascot } from "./Mascot";
import { SpotMarker } from "./SpotMarker";
import { DirtParticles } from "./DirtParticles";
import { DirtMound } from "./DirtMound";
import { Shovel } from "./Shovel";
import { Ceremony } from "./Ceremony";
import { SunAndRainbow } from "./SunAndRainbow";
import { MoundFlag } from "./MoundFlag";
import { CameraRig } from "./CameraRig";
import { useRitualStore } from "@/store/ritualStore";

function ReadySignal({ onReady }: { onReady?: () => void }) {
  // Вызывается внутри Canvas после монтирования всего дерева сцены
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/** Дев-доступ к R3F-состоянию из консоли (отладка камеры/рейкаста) */
function DevHook() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__three = get;
    }
  }, [get]);
  return null;
}

/** Содержимое сцены: здесь можно пользоваться store-хуками */
function SceneContent() {
  const phase = useRitualStore((s) => s.phase);
  const spotArr = useRitualStore((s) => s.spot);
  const spotVec = useMemo(
    () => (spotArr ? new THREE.Vector3(spotArr[0], 0, spotArr[1]) : null),
    [spotArr],
  );

  return (
    <>
      <SkyDome />
      <Lights />
      <Terrain />
      <Lawn />
      <CloudField />
      <Mascot />
      <SpotMarker />
      <DirtMound />
      <DirtParticles />
      <Shovel />
      <Ceremony />
      <SunAndRainbow />
      <MoundFlag />
      <CameraRig phase={phase} spot={spotVec} />
    </>
  );
}

/**
 * 3D-сцена. Загружается лениво (three-чанк) из Experience.
 * PerformanceMonitor снижает DPR на слабых устройствах (ступень «вниз»
 * необратима в рамках сессии — стабильность дороже пиковой чёткости).
 */
export default function Scene3D({ onReady }: { onReady?: () => void }) {
  const [dprCap, setDprCap] = useState(2);
  return (
    <Canvas
      shadows
      dpr={[1, dprCap]}
      camera={{ fov: 50, position: [0, 1.6, 4.4], near: 0.1, far: 90 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor
        onDecline={() => setDprCap((v) => (v > 1.3 ? 1.25 : 1))}
      >
        <SceneContent />
      </PerformanceMonitor>
      <AdaptiveDpr pixelated={false} />
      <ReadySignal onReady={onReady} />
      <DevHook />
    </Canvas>
  );
}
