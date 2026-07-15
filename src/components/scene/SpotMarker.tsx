import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRitualStore } from "@/store/ritualStore";
import { hoverSpot } from "./interactionBus";
import { HOLE_R } from "./constants";
import { PALETTE } from "./materials";

/**
 * Кольцо-подсказка: в chooseSpot следует за указателем/кандидатом,
 * в dig лежит на выбранном месте и гаснет по мере выкапывания.
 */
export function SpotMarker() {
  const phase = useRitualStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const fillMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const st = useRitualStore.getState();

    if (st.phase === "chooseSpot") {
      const candidate = st.candidateSpot;
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
      if (ringMatRef.current) ringMatRef.current.opacity = 0.95;
      if (fillMatRef.current) fillMatRef.current.opacity = 0.18;
      return;
    }

    if (st.phase === "dig" && st.spot) {
      // Цель для первого касания; гаснет, когда яма начала появляться
      const fade = Math.max(0, 0.85 - st.digProgress * 2.4);
      if (fade <= 0.01) {
        g.visible = false;
        return;
      }
      g.visible = true;
      g.position.set(st.spot[0], 0.04, st.spot[1]);
      g.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.04);
      if (ringMatRef.current) ringMatRef.current.opacity = fade;
      if (fillMatRef.current) fillMatRef.current.opacity = fade * 0.15;
      return;
    }

    g.visible = false;
  });

  if (phase !== "chooseSpot" && phase !== "dig") return null;

  return (
    <group ref={groupRef} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[HOLE_R - 0.07, HOLE_R, 48]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={PALETTE.cream}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[HOLE_R - 0.07, 48]} />
        <meshBasicMaterial
          ref={fillMatRef}
          color={PALETTE.cream}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
