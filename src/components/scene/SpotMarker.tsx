import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRitualStore } from "@/store/ritualStore";
import { hoverSpot } from "./interactionBus";
import { HOLE_R } from "./constants";
import { PALETTE } from "./materials";

/**
 * Кольцо-подсказка выбора места: следует за указателем (транзитно, мимо React),
 * после клика фиксируется на кандидате и пульсирует до подтверждения.
 */
export function SpotMarker() {
  const phase = useRitualStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const candidate = useRitualStore.getState().candidateSpot;
    if (candidate) {
      g.visible = true;
      g.position.set(candidate[0], 0.03, candidate[1]);
      g.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.06);
    } else if (hoverSpot.active) {
      g.visible = true;
      g.position.set(hoverSpot.x, 0.03, hoverSpot.z);
      g.scale.setScalar(1);
    } else {
      g.visible = false;
    }
  });

  if (phase !== "chooseSpot") return null;

  return (
    <group ref={groupRef} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[HOLE_R - 0.07, HOLE_R, 48]} />
        <meshBasicMaterial
          color={PALETTE.cream}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[HOLE_R - 0.07, 48]} />
        <meshBasicMaterial
          color={PALETTE.cream}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
