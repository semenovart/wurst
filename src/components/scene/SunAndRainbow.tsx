import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ceremonyMix } from "./interactionBus";
import { PALETTE } from "./materials";

const RAINBOW = [
  "#ff6b6b",
  "#ffa94d",
  "#ffd43b",
  "#69db7c",
  "#4dabf7",
  "#748ffc",
  "#b197fc",
];

/**
 * Солнце с лучами и радуга из семи полудуг. Спрятаны до церемонии;
 * солнце выкатывается из-за горизонта, дуги проявляются каскадом.
 */
export function SunAndRainbow() {
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Group>(null);

  const arcMats = useMemo(
    () =>
      RAINBOW.map(
        (c) =>
          new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
      ),
    [],
  );
  const sunMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: PALETTE.sun }),
    [],
  );

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const m = ceremonyMix.v;
    if (m <= 0.02) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const ease = m * m * (3 - 2 * m);

    const sun = sunRef.current;
    if (sun) {
      sun.position.y = THREE.MathUtils.lerp(-3, 5.6, ease);
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.05 * m;
      sun.scale.setScalar(pulse);
    }
    if (raysRef.current) {
      raysRef.current.rotation.z = clock.elapsedTime * 0.15;
    }
    arcMats.forEach((mat, i) => {
      mat.opacity = THREE.MathUtils.clamp(m * 1.8 - i * 0.12, 0, 0.85);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* солнце за лужайкой */}
      <group position={[2.5, 0, -9]}>
        <group ref={sunRef} position={[0, 5.6, 0]}>
          <mesh material={sunMat}>
            <sphereGeometry args={[1.15, 24, 18]} />
          </mesh>
          <group ref={raysRef}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  material={sunMat}
                  position={[Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0]}
                  rotation={[0, 0, a - Math.PI / 2]}
                >
                  <coneGeometry args={[0.16, 0.55, 6]} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>

      {/* радуга над сценой */}
      <group position={[-1.5, 0, -7]}>
        {arcMats.map((mat, i) => (
          <mesh key={i} material={mat} rotation={[0, 0, 0]}>
            <torusGeometry args={[3.4 + i * 0.16, 0.075, 8, 48, Math.PI]} />
          </mesh>
        ))}
      </group>

      {/* волшебные искорки над лужайкой */}
      <Sparkles
        count={50}
        scale={[9, 4, 9]}
        position={[0, 2.2, -1]}
        size={4}
        speed={0.35}
        color={PALETTE.cream}
      />
    </group>
  );
}
