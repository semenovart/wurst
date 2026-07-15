import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fxBus, type BurstKind } from "./interactionBus";
import { PALETTE } from "./materials";

const COUNT = 150;

const DIRT_SHADES = [PALETTE.dirt, PALETTE.dirtDark, "#9c6a47"];
const CONFETTI_SHADES = [
  "#ff8fab",
  "#ffd166",
  "#7ec8f5",
  "#a78bfa",
  "#6cc551",
  "#fff8ec",
];
const DUST_SHADES = ["#c9b49a", "#d8c7ae"];

const KIND_CFG: Record<
  BurstKind,
  { up: [number, number]; spread: number; g: number; size: [number, number]; decay: number }
> = {
  dirt: { up: [1.6, 3.0], spread: 1.1, g: 8, size: [0.05, 0.11], decay: 1.5 },
  dust: { up: [0.4, 1.0], spread: 0.7, g: 2.5, size: [0.04, 0.08], decay: 2.2 },
  confetti: { up: [2.2, 4.2], spread: 1.6, g: 1.6, size: [0.05, 0.09], decay: 0.35 },
};

function shade(kind: BurstKind): string {
  const list =
    kind === "dirt" ? DIRT_SHADES : kind === "dust" ? DUST_SHADES : CONFETTI_SHADES;
  return list[Math.floor(Math.random() * list.length)] ?? "#8a5a3b";
}

/**
 * Пул частиц (комья/пыль/конфетти) на одном InstancedMesh.
 * Спавн — императивно через fxBus, ноль ре-рендеров React.
 */
export function DirtParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const data = useMemo(
    () => ({
      pos: new Float32Array(COUNT * 3),
      vel: new Float32Array(COUNT * 3),
      life: new Float32Array(COUNT),
      size: new Float32Array(COUNT),
      seed: new Float32Array(COUNT),
      decay: new Float32Array(COUNT),
      g: new Float32Array(COUNT),
      cursor: 0,
    }),
    [],
  );

  useEffect(
    () =>
      fxBus.subscribe((b) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const cfg = KIND_CFG[b.kind];
        for (let n = 0; n < b.count; n++) {
          const i = data.cursor;
          data.cursor = (data.cursor + 1) % COUNT;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * cfg.spread;
          data.pos[i * 3] = b.x + (Math.random() - 0.5) * 0.25;
          data.pos[i * 3 + 1] = b.y;
          data.pos[i * 3 + 2] = b.z + (Math.random() - 0.5) * 0.25;
          data.vel[i * 3] = Math.cos(a) * r;
          data.vel[i * 3 + 1] =
            cfg.up[0] + Math.random() * (cfg.up[1] - cfg.up[0]);
          data.vel[i * 3 + 2] = Math.sin(a) * r;
          data.life[i] = 1;
          data.size[i] = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
          data.seed[i] = Math.random() * 10;
          data.decay[i] = cfg.decay;
          data.g[i] = cfg.g;
          tmpColor.set(shade(b.kind));
          mesh.setColorAt(i, tmpColor);
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }),
    [data, tmpColor],
  );

  useFrame((_, dtRaw) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(dtRaw, 0.05);
    for (let i = 0; i < COUNT; i++) {
      const life = data.life[i] ?? 0;
      if (life <= 0) {
        dummy.position.set(0, -10, 0);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const nl = life - dt * (data.decay[i] ?? 1.5);
      data.life[i] = nl;
      data.vel[i * 3 + 1] = (data.vel[i * 3 + 1] ?? 0) - (data.g[i] ?? 8) * dt;
      data.pos[i * 3] = (data.pos[i * 3] ?? 0) + (data.vel[i * 3] ?? 0) * dt;
      data.pos[i * 3 + 1] =
        (data.pos[i * 3 + 1] ?? 0) + (data.vel[i * 3 + 1] ?? 0) * dt;
      data.pos[i * 3 + 2] =
        (data.pos[i * 3 + 2] ?? 0) + (data.vel[i * 3 + 2] ?? 0) * dt;
      // Умирают, коснувшись земли на излёте
      if ((data.pos[i * 3 + 1] ?? 0) < 0.03 && (data.vel[i * 3 + 1] ?? 0) < 0) {
        data.life[i] = 0;
        continue;
      }
      const seed = data.seed[i] ?? 0;
      dummy.position.set(
        data.pos[i * 3] ?? 0,
        data.pos[i * 3 + 1] ?? 0,
        data.pos[i * 3 + 2] ?? 0,
      );
      dummy.rotation.set(seed + nl * 4, seed * 2, seed + nl * 6);
      dummy.scale.setScalar((data.size[i] ?? 0.05) * Math.min(1, nl * 4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshToonMaterial color="#ffffff" />
    </instancedMesh>
  );
}
