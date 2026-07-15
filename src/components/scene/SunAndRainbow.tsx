import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ceremonyMix } from "./interactionBus";
import { useRitualStore } from "@/store/ritualStore";
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

// Бледный на восходе → сочный в зените: иначе диск сливается
// с золотым небом финала (skyGolden очень близок к PALETTE.sun)
const SUN_PALE = new THREE.Color(PALETTE.sun);
const SUN_VIVID = new THREE.Color("#ffb703");
const RAY_VIVID = new THREE.Color("#ff8f0f");

/**
 * Солнце с лучами и радуга из семи полудуг. Спрятаны до церемонии;
 * солнце выкатывается из-за горизонта, дуги проявляются каскадом.
 */
export function SunAndRainbow() {
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Group>(null);
  const rainbowRef = useRef<THREE.Group>(null);
  const sparklesRef = useRef<THREE.Group>(null);

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
  // fog: false — солнце далеко (z=-9), туман не должен его бледнить
  const sunMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: SUN_PALE, fog: false }),
    [],
  );
  const rayMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: SUN_PALE, fog: false }),
    [],
  );
  const glowMats = useMemo(
    () =>
      [0, 1].map(
        () =>
          new THREE.MeshBasicMaterial({
            color: "#fff3cf",
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          }),
      ),
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
    // Солнце «накаляется» по мере восхода и в зените горит сочным золотом
    sunMat.color.lerpColors(SUN_PALE, SUN_VIVID, ease);
    rayMat.color.lerpColors(SUN_PALE, RAY_VIVID, ease);
    const glowInner = glowMats[0];
    const glowOuter = glowMats[1];
    if (glowInner) glowInner.opacity = 0.5 * ease;
    if (glowOuter) glowOuter.opacity = 0.28 * ease;
    if (raysRef.current) {
      raysRef.current.rotation.z = clock.elapsedTime * 0.15;
    }
    // Радуга и искры — атрибуты церемонии; вернувшийся гость видит
    // просто ясный день с солнцем
    const festive = useRitualStore.getState().phase !== "returned";
    if (rainbowRef.current) rainbowRef.current.visible = festive;
    if (sparklesRef.current) sparklesRef.current.visible = festive;
    arcMats.forEach((mat, i) => {
      mat.opacity = THREE.MathUtils.clamp(m * 1.8 - i * 0.12, 0, 0.85);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* солнце за лужайкой */}
      <group position={[2.5, 0, -9]}>
        <group ref={sunRef} position={[0, 5.6, 0]}>
          {/* сияние: два аддитивных ореола позади диска */}
          <mesh material={glowMats[1]} position={[0, 0, -0.16]}>
            <circleGeometry args={[2.7, 40]} />
          </mesh>
          <mesh material={glowMats[0]} position={[0, 0, -0.12]}>
            <circleGeometry args={[1.75, 40]} />
          </mesh>
          <mesh material={sunMat}>
            <sphereGeometry args={[1.15, 24, 18]} />
          </mesh>
          <group ref={raysRef}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  material={rayMat}
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
      <group ref={rainbowRef} position={[-1.5, 0, -7]}>
        {arcMats.map((mat, i) => (
          <mesh key={i} material={mat} rotation={[0, 0, 0]}>
            <torusGeometry args={[3.4 + i * 0.16, 0.075, 8, 48, Math.PI]} />
          </mesh>
        ))}
      </group>

      {/* волшебные искорки над лужайкой */}
      <group ref={sparklesRef}>
        <Sparkles
          count={50}
          scale={[9, 4, 9]}
          position={[0, 2.2, -1]}
          size={4}
          speed={0.35}
          color={PALETTE.cream}
        />
      </group>
    </group>
  );
}
