import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "./materials";
import { ceremonyMix } from "./interactionBus";

/**
 * Небо и туман: солнечный день, в церемонии лерпится в золотистый закат.
 */
export function SkyDome() {
  const scene = useThree((s) => s.scene);
  const bg = useMemo(() => new THREE.Color(PALETTE.sky), []);
  const day = useMemo(() => new THREE.Color(PALETTE.sky), []);
  const golden = useMemo(() => new THREE.Color(PALETTE.skyGolden), []);

  useEffect(() => {
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 24, 60);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, bg]);

  useFrame(() => {
    bg.copy(day).lerp(golden, ceremonyMix.v);
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bg);
  });

  return null;
}
