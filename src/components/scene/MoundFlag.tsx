import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRitualStore } from "@/store/ritualStore";
import { MAT, toon, PALETTE } from "./materials";

const flagMat = toon(PALETTE.cream);

/**
 * Памятный холмик с флажком — показывается вернувшемуся гостю:
 * «ваша сосиска несёт службу под землёй».
 */
export function MoundFlag() {
  const phase = useRitualStore((s) => s.phase);
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    // флажок трепещет на ветру
    if (flagRef.current) {
      flagRef.current.rotation.y =
        0.35 + Math.sin(clock.elapsedTime * 2.6) * 0.22;
    }
  });

  if (phase !== "returned") return null;

  return (
    <group position={[0, 0, 0]}>
      {/* холмик */}
      <mesh material={MAT.dirt} position={[0, 0.1, 0]} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[0.75, 14, 10]} />
      </mesh>
      <mesh material={MAT.dirt} position={[0.4, 0.06, 0.25]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[0.3, 10, 8]} />
      </mesh>
      {/* древко */}
      <mesh material={MAT.trunk} position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
      </mesh>
      {/* флажок-вымпел */}
      <mesh
        ref={flagRef}
        material={flagMat}
        position={[0.02, 1.08, 0]}
        rotation={[0, 0.35, 0]}
      >
        <coneGeometry args={[0.14, 0.42, 4]} />
      </mesh>
    </group>
  );
}
