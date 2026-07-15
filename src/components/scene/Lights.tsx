import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ceremonyMix } from "./interactionBus";

const DIR_DAY = new THREE.Color("#ffffff");
const DIR_GOLD = new THREE.Color("#ffd9a0");
const HEMI_SKY_DAY = new THREE.Color("#cfe9ff");
const HEMI_SKY_GOLD = new THREE.Color("#ffe4b8");

/**
 * Освещение: hemisphere (небо/трава) + один направленный с тенью.
 * В церемонии свет теплеет вслед за ceremonyMix.
 */
export function Lights() {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const m = ceremonyMix.v;
    const dir = dirRef.current;
    if (dir) {
      dir.color.copy(tmp.copy(DIR_DAY).lerp(DIR_GOLD, m));
      dir.intensity = THREE.MathUtils.lerp(2.4, 2.0, m);
    }
    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.copy(tmp.copy(HEMI_SKY_DAY).lerp(HEMI_SKY_GOLD, m));
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#cfe9ff", "#8bc46a", 1.1]} />
      <directionalLight
        ref={dirRef}
        position={[8, 10, 8]}
        intensity={2.4}
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
