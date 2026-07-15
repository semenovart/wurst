import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ceremonyMix } from "./interactionBus";

// Пасмурное утро службы → золотой свет после ритуала
const DIR_GLOOM = new THREE.Color("#dbe3ea");
const DIR_GOLD = new THREE.Color("#ffd9a0");
const HEMI_SKY_GLOOM = new THREE.Color("#a9bccb");
const HEMI_SKY_GOLD = new THREE.Color("#ffe4b8");

/**
 * Освещение: hemisphere (небо/трава) + один направленный с тенью.
 * До ритуала — тусклый холодный свет из-под туч; ceremonyMix
 * выкатывает тёплое яркое солнце.
 */
export function Lights() {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const m = ceremonyMix.v;
    const dir = dirRef.current;
    if (dir) {
      dir.color.copy(tmp.copy(DIR_GLOOM).lerp(DIR_GOLD, m));
      dir.intensity = THREE.MathUtils.lerp(1.55, 2.35, m);
    }
    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.copy(tmp.copy(HEMI_SKY_GLOOM).lerp(HEMI_SKY_GOLD, m));
      hemi.intensity = THREE.MathUtils.lerp(0.95, 1.25, m);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#a9bccb", "#8bc46a", 0.95]} />
      <directionalLight
        ref={dirRef}
        position={[8, 10, 8]}
        intensity={1.55}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={2}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  );
}
