import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAT } from "./materials";
import { ceremonyMix } from "./interactionBus";

type CloudSpec = {
  y: number;
  z: number;
  x0: number;
  speed: number;
  scale: number;
  puffs: Array<[number, number, number, number]>; // x, y, z, r
};

const CLOUD_SPECS: CloudSpec[] = [
  {
    y: 6.2,
    z: -7,
    x0: -9,
    speed: 0.22,
    scale: 1.1,
    puffs: [
      [0, 0, 0, 0.9],
      [0.9, 0.15, 0.1, 0.65],
      [-0.9, 0.1, -0.1, 0.6],
      [0.2, 0.45, 0, 0.55],
    ],
  },
  {
    y: 7.4,
    z: -10,
    x0: 2,
    speed: 0.15,
    scale: 1.5,
    puffs: [
      [0, 0, 0, 0.8],
      [0.8, 0.2, 0, 0.6],
      [-0.85, 0.05, 0, 0.55],
    ],
  },
  {
    y: 5.4,
    z: -4,
    x0: 8,
    speed: 0.28,
    scale: 0.8,
    puffs: [
      [0, 0, 0, 0.75],
      [0.7, 0.2, 0.1, 0.5],
      [-0.7, 0.12, 0, 0.5],
      [0, 0.4, -0.1, 0.45],
    ],
  },
  {
    y: 8.2,
    z: -13,
    x0: -4,
    speed: 0.1,
    scale: 1.9,
    puffs: [
      [0, 0, 0, 0.7],
      [0.75, 0.15, 0, 0.55],
      [-0.7, 0.1, 0, 0.5],
    ],
  },
  {
    y: 6.8,
    z: -6,
    x0: 12,
    speed: 0.19,
    scale: 1.0,
    puffs: [
      [0, 0, 0, 0.85],
      [0.85, 0.1, 0, 0.6],
      [-0.8, 0.2, 0.1, 0.55],
    ],
  },
];

const WRAP_X = 17;

/**
 * Мультяшные облака из сфер. Дрейфуют по X с заворачиванием.
 * В церемонии (S5) поле получит команду «разойтись» — прозрачность/разлёт.
 */
export function CloudField() {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const specs = useMemo(() => CLOUD_SPECS, []);

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05);
    const m = ceremonyMix.v;
    MAT.cloud.opacity = 1 - m;
    specs.forEach((spec, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      if (m >= 0.98) {
        g.visible = false;
        return;
      }
      g.visible = true;
      // Обычный дрейф + церемониальный «разъезд» в свою сторону
      const away = spec.x0 >= 0 ? 1 : -1;
      g.position.x += (spec.speed + m * 3.2 * away) * clampedDt;
      g.position.y += m * clampedDt * 0.7;
      if (m < 0.02 && g.position.x > WRAP_X) g.position.x = -WRAP_X;
    });
  });

  return (
    <group>
      {specs.map((spec, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={[spec.x0, spec.y, spec.z]}
          scale={spec.scale}
        >
          {spec.puffs.map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]} material={MAT.cloud}>
              <sphereGeometry args={[r, 12, 10]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
