import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRitualStore } from "@/store/ritualStore";
import { MAT } from "./materials";
import { HOLE_R, MASCOT_HOME } from "./constants";

/**
 * Куча вынутой земли рядом с ямой: растёт при копании, тает при засыпке —
 * иллюзия сохранения объёма. Позиция — в сторону от маскота.
 */
export function DirtMound() {
  const spot = useRitualStore((s) => s.spot);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const st = useRitualStore.getState();
    const amount = Math.max(0, st.digProgress - st.fillProgress);
    if (!st.spot || amount < 0.03) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const s = 0.3 + 0.7 * amount;
    g.scale.set(s, 0.35 + 0.65 * amount, s);
  });

  if (!spot) return null;

  const [sx, sz] = spot;
  let dx = sx - MASCOT_HOME[0];
  let dz = sz - MASCOT_HOME[2];
  const len = Math.hypot(dx, dz) || 1;
  dx /= len;
  dz /= len;
  const mx = sx + dx * (HOLE_R + 0.55);
  const mz = sz + dz * (HOLE_R + 0.55);

  return (
    <group ref={groupRef} position={[mx, 0, mz]} visible={false}>
      <mesh material={MAT.dirt} position={[0, 0.15, 0]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.42, 12, 9]} />
      </mesh>
      <mesh material={MAT.dirt} position={[0.3, 0.09, 0.14]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.24, 10, 8]} />
      </mesh>
      <mesh material={MAT.dirt} position={[-0.27, 0.08, -0.12]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.2, 10, 8]} />
      </mesh>
    </group>
  );
}
