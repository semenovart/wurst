import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAT, PALETTE } from "./materials";
import { ceremonyMix } from "./interactionBus";

const CLOUD_GLOOMY = new THREE.Color(PALETTE.cloudGloomy);
const CLOUD_LIT = new THREE.Color(PALETTE.cloud);

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
  // низкие тяжёлые тучи — сгущают пасмурность до ритуала
  {
    y: 4.6,
    z: -5,
    x0: -5,
    speed: 0.12,
    scale: 1.35,
    puffs: [
      [0, 0, 0, 0.85],
      [0.95, -0.05, 0.1, 0.7],
      [-0.95, 0.05, -0.1, 0.65],
      [0.3, 0.35, 0, 0.55],
    ],
  },
  {
    y: 5.0,
    z: -8,
    x0: 6,
    speed: 0.16,
    scale: 1.5,
    puffs: [
      [0, 0, 0, 0.8],
      [0.85, 0.1, 0, 0.62],
      [-0.9, -0.02, 0, 0.6],
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
    // уходя, тучи ловят солнце и светлеют
    MAT.cloud.color.lerpColors(CLOUD_GLOOMY, CLOUD_LIT, m);
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
