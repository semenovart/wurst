import { useMemo, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { MAT, PALETTE } from "./materials";
import { useRitualStore } from "@/store/ritualStore";
import { hoverSpot } from "./interactionBus";
import { isValidSpot } from "./constants";

export const TERRAIN_SIZE = 14;
export const TERRAIN_SEGS = 96;

/** Стабильный «шум» по координатам — оттенок травинок без текстур */
function hash2(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function buildTerrainGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    TERRAIN_SEGS,
    TERRAIN_SEGS,
  );
  // Запекаем поворот: дальше «высота» — это просто Y-компонента атрибута
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const grassA = new THREE.Color(PALETTE.grassA);
  const grassB = new THREE.Color(PALETTE.grassB);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    tmp.copy(grassA).lerp(grassB, hash2(x, z));
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;

    // Лёгкая волнистость только у краёв — центр (зона копания) ровный
    const d = Math.hypot(x, z);
    if (d > 4.5) {
      const edge = Math.min(1, (d - 4.5) / 2);
      pos.setY(i, Math.sin(x * 0.8) * Math.cos(z * 0.7) * 0.06 * edge);
    }
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Деформируемая лужайка. В S1 — статичная; кисть копания добавляется в S3
 * (мутирует attributes.position/color этой же геометрии).
 */
export function Terrain() {
  const geometry = useMemo(buildTerrainGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const phase = useRitualStore((s) => s.phase);
  const choosing = phase === "chooseSpot";

  const onChooseMove = (e: ThreeEvent<PointerEvent>) => {
    hoverSpot.x = e.point.x;
    hoverSpot.z = e.point.z;
    hoverSpot.active = isValidSpot(e.point.x, e.point.z);
  };

  const onChooseClick = (e: ThreeEvent<MouseEvent>) => {
    if (isValidSpot(e.point.x, e.point.z)) {
      useRitualStore
        .getState()
        .setCandidateSpot([e.point.x, e.point.z]);
    }
  };

  return (
    <>
      <mesh
        geometry={geometry}
        material={MAT.terrain}
        receiveShadow
        onPointerMove={choosing ? onChooseMove : undefined}
        onClick={choosing ? onChooseClick : undefined}
      />
      {/* Бесконечный луг до горизонта: туман растворяет край */}
      <mesh
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.grassFar}
      >
        <circleGeometry args={[80, 48]} />
      </mesh>
    </>
  );
}
