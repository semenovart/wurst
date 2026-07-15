import { useMemo } from "react";
import * as THREE from "three";
import { MAT } from "./materials";

/** Ёлочка-конус: ствол + две кроны */
function Tree({
  position,
  scale = 1,
  leaf = MAT.leafA,
}: {
  position: [number, number, number];
  scale?: number;
  leaf?: THREE.Material;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} material={MAT.trunk} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 1.1, 0]} material={leaf} castShadow>
        <coneGeometry args={[0.85, 1.5, 8]} />
      </mesh>
      <mesh position={[0, 1.9, 0]} material={leaf} castShadow>
        <coneGeometry args={[0.55, 1.0, 8]} />
      </mesh>
    </group>
  );
}

/** Куст из трёх сфер */
function Bush({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} material={MAT.leafB} castShadow>
        <sphereGeometry args={[0.38, 12, 10]} />
      </mesh>
      <mesh position={[0.32, 0.2, 0.05]} material={MAT.leafA}>
        <sphereGeometry args={[0.26, 12, 10]} />
      </mesh>
      <mesh position={[-0.3, 0.18, -0.05]} material={MAT.leafB}>
        <sphereGeometry args={[0.24, 12, 10]} />
      </mesh>
    </group>
  );
}

const FLOWER_COLORS = ["#ffffff", "#ffd166", "#f78fb3", "#a78bfa"];
const FLOWER_COUNT = 56;

/** Цветочки-точки: один InstancedMesh с per-instance цветом */
function Flowers() {
  const { matrices, colors } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const colors = new Float32Array(FLOWER_COUNT * 3);
    const tmpColor = new THREE.Color();
    const m = new THREE.Matrix4();
    let placed = 0;
    let seed = 7;
    const rand = () => {
      // детерминированный LCG — цветы не «прыгают» между рендерами
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    while (placed < FLOWER_COUNT) {
      const r = 2.8 + rand() * 3.6;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // не сажаем цветы там, где будет стоять маскот
      if (Math.hypot(x - 0, z - 1.3) < 0.9) continue;
      const s = 0.05 + rand() * 0.05;
      m.makeScale(s, s * 0.7, s);
      m.setPosition(x, 0.05, z);
      matrices.push(m.clone());
      tmpColor.set(
        FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)] ?? "#ffffff",
      );
      colors[placed * 3] = tmpColor.r;
      colors[placed * 3 + 1] = tmpColor.g;
      colors[placed * 3 + 2] = tmpColor.b;
      placed++;
    }
    return { matrices, colors };
  }, []);

  return (
    <instancedMesh
      args={[undefined, undefined, FLOWER_COUNT]}
      ref={(mesh) => {
        if (!mesh) return;
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.instanceMatrix.needsUpdate = true;
        if (!mesh.instanceColor) {
          mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
        }
      }}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshToonMaterial color="#ffffff" />
    </instancedMesh>
  );
}

/** Декор лужайки вокруг зоны ритуала (сама земля — в Terrain) */
export function Lawn() {
  return (
    <group>
      <Tree position={[-5.4, 0, -3.6]} scale={1.15} />
      <Tree position={[5.2, 0, -4.4]} scale={0.95} leaf={MAT.leafB} />
      <Tree position={[-4.6, 0, 3.8]} scale={0.8} leaf={MAT.leafB} />
      <Tree position={[5.8, 0, 2.6]} scale={1.05} />
      <Tree position={[-6.2, 0, 0.4]} scale={0.7} />
      <Bush position={[-3.4, 0, -4.6]} />
      <Bush position={[3.9, 0, 4.4]} scale={0.85} />
      <Bush position={[6.4, 0, -1.2]} scale={1.1} />
      <Flowers />
    </group>
  );
}
