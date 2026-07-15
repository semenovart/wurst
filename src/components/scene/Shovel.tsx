import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRitualStore } from "@/store/ritualStore";
import { digPointer } from "./interactionBus";
import { MAT, toon, PALETTE } from "./materials";

const metalMat = toon(PALETTE.shovelMetal);

/**
 * Процедурная лопата: парит за указателем над землёй,
 * при копании ныряет вниз с наклоном («укус» по fxBus-таймингу).
 */
export function Shovel() {
  const phase = useRitualStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);
  const shown = phase === "dig" || phase === "fill";

  useFrame(({ clock }, dt) => {
    const g = groupRef.current;
    if (!g) return;
    if (!shown || !digPointer.active) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const k = 1 - Math.exp(-16 * dt);
    g.position.x += (digPointer.x + 0.15 - g.position.x) * k;
    g.position.z += (digPointer.z + 0.15 - g.position.z) * k;

    // «Укус»: короткий нырок после каждого выброса комьев
    const bite = Math.max(0, 1 - (clock.elapsedTime - digPointer.lastBiteAt) * 5);
    const baseY = digPointer.pressing ? 0.32 : 0.62;
    const targetY = baseY - bite * 0.28;
    g.position.y += (targetY - g.position.y) * k;

    const targetTilt = digPointer.pressing ? -1.05 - bite * 0.35 : -0.75;
    g.rotation.z += (targetTilt - g.rotation.z) * k;
    g.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.06;
  });

  if (!shown) return null;

  return (
    <group ref={groupRef} visible={false} rotation={[0, 0, -0.75]}>
      {/* черенок */}
      <mesh position={[0, 0.62, 0]} material={MAT.trunk} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.0, 8]} />
      </mesh>
      {/* Т-ручка */}
      <mesh
        position={[0, 1.13, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MAT.trunk}
      >
        <cylinderGeometry args={[0.033, 0.033, 0.24, 8]} />
      </mesh>
      {/* штык */}
      <mesh position={[0, 0.02, 0]} material={metalMat} castShadow>
        <boxGeometry args={[0.26, 0.3, 0.045]} />
      </mesh>
      <mesh
        position={[0, -0.16, 0]}
        rotation={[0, 0, Math.PI / 4]}
        material={metalMat}
      >
        <boxGeometry args={[0.19, 0.19, 0.044]} />
      </mesh>
    </group>
  );
}
