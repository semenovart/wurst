import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { MAT, PALETTE } from "./materials";
import { useRitualStore } from "@/store/ritualStore";
import {
  hoverSpot,
  digPointer,
  fxBus,
  cameraShake,
  holdAction,
} from "./interactionBus";
import { isValidSpot, HOLE_R } from "./constants";
import { digScrape, clodPlop, pour, tampThump } from "@/lib/audio/sfx";
import { haptic } from "@/lib/haptics";

export const TERRAIN_SIZE = 14;
export const TERRAIN_SEGS = 96;

/** Глубина готовой ямы и высота бортика вынутой земли */
export const MAX_DEPTH = 0.55;
const RIM_H = 0.1;
/** Радиус мазка кисти */
const BRUSH_R = 0.55;
/** Высота холмика после засыпки (S4) */
export const MOUND_H = 0.2;

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

type Zone = {
  /** Вершины в радиусе действия кисти (яма + бортик) */
  indices: number[];
  /** Расстояние каждой зонной вершины до центра ямы */
  distFromSpot: Float32Array;
  /** Идеальная глубина боула для каждой вершины (0 за пределами ямы) */
  idealDepth: Float32Array;
  /** Σ идеальных глубин — знаменатель прогресса */
  targetSum: number;
  /** Базовые цвета зоны (для смешивания трава→земля) */
  baseColors: Float32Array;
  cx: number;
  cz: number;
};

const GRASS_TO_DIRT = new THREE.Color(PALETTE.dirt);
const DIRT_DARK = new THREE.Color(PALETTE.dirtDark);

/**
 * Деформируемая лужайка: выбор места (chooseSpot) и кисть копания (dig).
 * Вся деформация — мутация attributes.position/color; React не участвует.
 */
export function Terrain() {
  const geometry = useMemo(() => buildTerrainGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const phase = useRitualStore((s) => s.phase);
  const spot = useRitualStore((s) => s.spot);

  const zoneRef = useRef<Zone | null>(null);
  const dirtyRef = useRef(false);
  const autoAngleRef = useRef(0);
  const draggingRef = useRef(false);
  const lastPtRef = useRef(new THREE.Vector3());
  const hasLastPt = useRef(false);
  const lastBurstAt = useRef(0);
  const dugSinceBurst = useRef(0);
  const pouredSinceSfx = useRef(0);
  const lastPourAt = useRef(0);
  /** База для прогресса засыпки: высоты на входе в fill и сколько поднять */
  const fillBaseRef = useRef<{ startY: Float32Array; deltaSum: number } | null>(
    null,
  );

  // Предвычисление зоны при фиксации места
  useEffect(() => {
    if (!spot) {
      zoneRef.current = null;
      return;
    }
    const [cx, cz] = spot;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const col = geometry.attributes.color as THREE.BufferAttribute;
    const indices: number[] = [];
    const outerR = HOLE_R * 1.45;
    for (let i = 0; i < pos.count; i++) {
      const dx = pos.getX(i) - cx;
      const dz = pos.getZ(i) - cz;
      if (dx * dx + dz * dz <= outerR * outerR) indices.push(i);
    }
    const distFromSpot = new Float32Array(indices.length);
    const idealDepth = new Float32Array(indices.length);
    const baseColors = new Float32Array(indices.length * 3);
    let targetSum = 0;
    indices.forEach((vi, k) => {
      const dx = pos.getX(vi) - cx;
      const dz = pos.getZ(vi) - cz;
      const d = Math.hypot(dx, dz);
      distFromSpot[k] = d;
      const ideal =
        d < HOLE_R ? MAX_DEPTH * Math.cos(((d / HOLE_R) * Math.PI) / 2) : 0;
      idealDepth[k] = ideal;
      targetSum += ideal;
      baseColors[k * 3] = col.getX(vi);
      baseColors[k * 3 + 1] = col.getY(vi);
      baseColors[k * 3 + 2] = col.getZ(vi);
    });
    zoneRef.current = {
      indices,
      distFromSpot,
      idealDepth,
      targetSum,
      baseColors,
      cx,
      cz,
    };
  }, [spot, geometry]);

  // Вход в fill: снимок высот ямы → знаменатель прогресса засыпки
  useEffect(
    () =>
      useRitualStore.subscribe(
        (s) => s.phase,
        (ph) => {
          if (ph !== "fill") return;
          const zone = zoneRef.current;
          if (!zone) return;
          const pos = geometry.attributes.position as THREE.BufferAttribute;
          const startY = new Float32Array(zone.indices.length);
          let deltaSum = 0;
          zone.indices.forEach((vi, k) => {
            const y = pos.getY(vi);
            startY[k] = y;
            const d = zone.distFromSpot[k] ?? Infinity;
            if (d < HOLE_R) {
              const target =
                MOUND_H * Math.cos(((d / HOLE_R) * Math.PI) / 2) ** 2;
              deltaSum += Math.max(0, target - y);
            }
          });
          fillBaseRef.current = { startY, deltaSum };
        },
      ),
    [geometry],
  );

  /** Смешивание цвета вершины: трава → земля по фактической глубине */
  const mixDirtColor = (zone: Zone, k: number, vi: number, y: number) => {
    const col = geometry.attributes.color as THREE.BufferAttribute;
    // 0 на поверхности, 1 на дне; бортик тоже слегка «пачкается»
    const t = THREE.MathUtils.clamp(
      y < 0 ? -y / (MAX_DEPTH * 0.85) : y > 0.02 ? 0.35 : 0,
      0,
      1,
    );
    if (t <= 0) {
      col.setXYZ(
        vi,
        zone.baseColors[k * 3] ?? 0,
        zone.baseColors[k * 3 + 1] ?? 0,
        zone.baseColors[k * 3 + 2] ?? 0,
      );
      return;
    }
    const shade = 0.85 + hash2(vi, k) * 0.3;
    const base = t < 0.7 ? GRASS_TO_DIRT : DIRT_DARK;
    col.setXYZ(
      vi,
      THREE.MathUtils.lerp(zone.baseColors[k * 3] ?? 0, base.r * shade, t),
      THREE.MathUtils.lerp(zone.baseColors[k * 3 + 1] ?? 0, base.g * shade, t),
      THREE.MathUtils.lerp(zone.baseColors[k * 3 + 2] ?? 0, base.b * shade, t),
    );
  };

  /** Один мазок кисти в точке p; dir=-1 копаем, +1 засыпаем (S4) */
  const applyBrush = (px: number, pz: number, dir: -1 | 1, strength: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;

    zone.indices.forEach((vi, k) => {
      const dx = pos.getX(vi) - px;
      const dz = pos.getZ(vi) - pz;
      const dPointer = Math.hypot(dx, dz);
      if (dPointer > BRUSH_R) return;

      const dSpot = zone.distFromSpot[k] ?? Infinity;
      const fall = Math.cos(((dPointer / BRUSH_R) * Math.PI) / 2) ** 2;
      let y = pos.getY(vi);

      if (dir < 0) {
        if (dSpot < HOLE_R) {
          // Внутри ямы: копаем к идеальному боулу (центр поддаётся легче)
          const centerBias = 0.55 + 0.45 * ((zone.idealDepth[k] ?? 0) / MAX_DEPTH);
          y = Math.max(y - strength * fall * centerBias, -(zone.idealDepth[k] ?? 0));
        } else {
          // Бортик слегка нарастает от выброса земли
          y = Math.min(y + strength * fall * 0.18, RIM_H);
        }
      } else {
        // Засыпание: поднимаем к профилю холмика
        const target =
          dSpot < HOLE_R
            ? MOUND_H * Math.cos(((dSpot / HOLE_R) * Math.PI) / 2) ** 2
            : pos.getY(vi);
        y = Math.min(y + strength * fall, target);
      }

      pos.setY(vi, y);
      mixDirtColor(zone, k, vi, y);
      if (dSpot < HOLE_R) {
        if (dir < 0) dugSinceBurst.current += strength * fall;
        else pouredSinceSfx.current += strength * fall;
      }
    });

    dirtyRef.current = true;
  };

  /** Мазок вдоль отрезка a→b (быстрые свайпы интерполируются) */
  const applyStroke = (
    ax: number,
    az: number,
    bx: number,
    bz: number,
    dir: -1 | 1,
  ) => {
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.ceil(len / (BRUSH_R * 0.45)));
    const strength = THREE.MathUtils.clamp(0.025 + len * 0.2, 0.03, 0.13);
    for (let s = 0; s < steps; s++) {
      const t = steps === 1 ? 1 : s / (steps - 1);
      applyBrush(
        THREE.MathUtils.lerp(ax, bx, t),
        THREE.MathUtils.lerp(az, bz, t),
        dir,
        strength / Math.sqrt(steps),
      );
    }
  };

  // Пересчёт нормалей/прогресса — не чаще раза за кадр
  useFrame(({ clock }, dt) => {
    // A11y: удержание кнопки «Копать/Засыпать» — автокисть по спирали вокруг ямы
    const stNow = useRitualStore.getState();
    const zoneNow = zoneRef.current;
    if (
      holdAction.digging &&
      zoneNow &&
      (stNow.phase === "dig" || stNow.phase === "fill")
    ) {
      autoAngleRef.current += dt * 5;
      const a = autoAngleRef.current;
      const r = HOLE_R * 0.55 * (0.35 + 0.65 * Math.abs(Math.sin(a * 0.6)));
      const px = zoneNow.cx + Math.cos(a) * r;
      const pz = zoneNow.cz + Math.sin(a) * r;
      digPointer.x = px;
      digPointer.z = pz;
      digPointer.active = true;
      digPointer.pressing = true;
      applyBrush(px, pz, stNow.phase === "fill" ? 1 : -1, 0.05);
    }
    // A11y: накопленные «топы» с кнопки
    while (holdAction.tampPulses > 0 && zoneNow && stNow.phase === "tamp") {
      holdAction.tampPulses--;
      tampAt(zoneNow.cx, zoneNow.cz);
    }
    if (holdAction.tampPulses > 0) holdAction.tampPulses = 0;

    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    const zone = zoneRef.current;
    geometry.computeVertexNormals();
    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    const normal = geometry.attributes.normal;
    if (normal) normal.needsUpdate = true;

    if (zone && zone.targetSum > 0) {
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const st = useRitualStore.getState();
      if (st.phase === "dig") {
        let dug = 0;
        zone.indices.forEach((vi, k) => {
          const y = pos.getY(vi);
          if (y < 0) dug += Math.min(-y, zone.idealDepth[k] ?? 0);
        });
        // Яма «готова» при 80% идеального объёма: кламп кисти делает
        // последние проценты асимптотическими — не мучаем пользователя
        const norm = Math.min(1, dug / zone.targetSum / 0.8);
        // Квантуем, чтобы не дёргать React каждый кадр
        const q = Math.round(norm * 20) / 20;
        st.setDigProgress(q);
      } else if (st.phase === "fill") {
        const base = fillBaseRef.current;
        if (base && base.deltaSum > 0) {
          let raised = 0;
          zone.indices.forEach((vi, k) => {
            const d = zone.distFromSpot[k] ?? Infinity;
            if (d >= HOLE_R) return;
            raised += Math.max(0, pos.getY(vi) - (base.startY[k] ?? 0));
          });
          const norm = Math.min(1, raised / base.deltaSum / 0.85);
          st.setFillProgress(Math.round(norm * 20) / 20);
        }
      }
    }

    // Комья летят порциями (не чаще раза в 70 мс)
    const now = clock.elapsedTime;
    if (dugSinceBurst.current > 0.05 && now - lastBurstAt.current > 0.07) {
      const zone2 = zoneRef.current;
      if (zone2) {
        fxBus.spawn({
          x: digPointer.x,
          y: 0.15,
          z: digPointer.z,
          count: Math.min(7, 2 + Math.floor(dugSinceBurst.current * 40)),
          kind: "dirt",
        });
        digPointer.lastBiteAt = now;
        digScrape(Math.min(1, dugSinceBurst.current * 6));
        clodPlop(0.7);
        haptic("dig");
      }
      dugSinceBurst.current = 0;
      lastBurstAt.current = now;
    }

    // Шорох засыпки (не чаще раза в 180 мс)
    if (pouredSinceSfx.current > 0.05 && now - lastPourAt.current > 0.18) {
      pour();
      haptic("pour");
      pouredSinceSfx.current = 0;
      lastPourAt.current = now;
    }
  });

  /** Один «топ» по холмику: прижим + отдача (общее для тапа и a11y-кнопки) */
  const tampAt = (px: number, pz: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    zone.indices.forEach((vi, k) => {
      const dSpot = zone.distFromSpot[k] ?? Infinity;
      if (dSpot >= HOLE_R * 1.2) return;
      const y = pos.getY(vi);
      if (y > 0.015) pos.setY(vi, y * 0.85);
    });
    dirtyRef.current = true;
    fxBus.spawn({ x: px, y: 0.18, z: pz, count: 6, kind: "dust" });
    cameraShake.intensity = 0.55;
    tampThump();
    haptic("tamp");
    useRitualStore.getState().tamp();
  };

  /** Утаптывание: тап по холмику */
  const onTampClick = (e: ThreeEvent<MouseEvent>) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const d = Math.hypot(e.point.x - zone.cx, e.point.z - zone.cz);
    if (d > HOLE_R * 1.3) return; // мимо холмика
    tampAt(e.point.x, e.point.z);
  };

  // ── Обработчики фазы chooseSpot ──
  const onChooseMove = (e: ThreeEvent<PointerEvent>) => {
    hoverSpot.x = e.point.x;
    hoverSpot.z = e.point.z;
    hoverSpot.active = isValidSpot(e.point.x, e.point.z);
  };

  const onChooseClick = (e: ThreeEvent<MouseEvent>) => {
    if (isValidSpot(e.point.x, e.point.z)) {
      useRitualStore.getState().setCandidateSpot([e.point.x, e.point.z]);
    }
  };

  // ── Обработчики копания (dig; в S4 сюда добавится fill) ──
  const digDir: -1 | 1 = phase === "fill" ? 1 : -1;

  const onDigDown = (e: ThreeEvent<PointerEvent>) => {
    // capture только для доверенных событий: на синтетических/умерших
    // указателях внутренняя регистрация R3F при анмаунте кидает
    // NotFoundError и роняет Canvas
    if (e.nativeEvent?.isTrusted) {
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        /* без capture тоже работаем */
      }
    }
    draggingRef.current = true;
    digPointer.pressing = true;
    lastPtRef.current.copy(e.point);
    hasLastPt.current = true;
    applyStroke(e.point.x, e.point.z, e.point.x, e.point.z, digDir);
  };

  const onDigMove = (e: ThreeEvent<PointerEvent>) => {
    digPointer.x = e.point.x;
    digPointer.z = e.point.z;
    digPointer.active = true;
    if (!draggingRef.current || !hasLastPt.current) return;
    applyStroke(
      lastPtRef.current.x,
      lastPtRef.current.z,
      e.point.x,
      e.point.z,
      digDir,
    );
    lastPtRef.current.copy(e.point);
  };

  const endDig = () => {
    draggingRef.current = false;
    hasLastPt.current = false;
    digPointer.pressing = false;
  };

  const choosing = phase === "chooseSpot";
  const earthwork = phase === "dig" || phase === "fill";
  const tamping = phase === "tamp";

  return (
    <>
      <mesh
        geometry={geometry}
        material={MAT.terrain}
        receiveShadow
        onPointerMove={
          choosing ? onChooseMove : earthwork ? onDigMove : undefined
        }
        onClick={choosing ? onChooseClick : tamping ? onTampClick : undefined}
        onPointerDown={earthwork ? onDigDown : undefined}
        onPointerUp={earthwork ? endDig : undefined}
        onPointerLeave={
          earthwork
            ? () => {
                digPointer.active = false;
                endDig();
              }
            : undefined
        }
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
