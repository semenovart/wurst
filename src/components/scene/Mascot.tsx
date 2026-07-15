import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { MAT } from "./materials";
import { MASCOT_HOME, HOLE_R } from "./constants";
import { useRitualStore } from "@/store/ritualStore";
import { fxBus, cameraShake } from "./interactionBus";
import { MAX_DEPTH } from "./Terrain";
import { pick, sausageSplat } from "@/lib/audio/sfx";
import { haptic } from "@/lib/haptics";

type MascotMode = "idle" | "dragged" | "returning" | "falling" | "buried";

/** Центр сосиски, когда она лежит на дне ямы (радиус 0.45) */
const REST_Y = -MAX_DEPTH + 0.42;
/** Насколько глубоко «затягивает» сосиску при засыпке (чтобы скрылась под холмиком) */
const SUNK_Y = -MAX_DEPTH - 0.15;

const _tmp = new THREE.Vector3();

/**
 * Сосиска-маскот. Idle: дыхание и моргание. В place: перетаскивается
 * в яму (магнитный снап), падает со squash-and-stretch и остаётся лежать;
 * при засыпке медленно скрывается под землёй.
 */
export function Mascot() {
  const phase = useRitualStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const squashRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const nextBlinkAt = useRef(2.4);
  const mode = useRef<MascotMode>("idle");
  const fallT = useRef(0);
  const fallFrom = useRef(new THREE.Vector3());
  const squashT = useRef(1); // 1 = отработал
  /** Последняя точка указателя на плоскости земли (намерение пользователя) */
  const dragXZ = useRef<[number, number] | null>(null);
  const dragPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );

  // Сброс режима при смене фазы (place начинается всегда с idle-дома)
  useEffect(() => {
    if (phase === "place") mode.current = "idle";
    if (phase === "fill" || phase === "tamp" || phase === "ceremony") {
      mode.current = "buried";
    }
  }, [phase]);

  // ВАЖНО: setPointerCapture на ThreeEvent-таргете НЕ вызываем — R3F
  // регистрирует внутренний capture, а при анмаунте зовёт
  // releasePointerCapture по мёртвому pointerId → NotFoundError валит Canvas.
  // Вместо capture: перетаскивание ведётся по state.raycaster в useFrame,
  // а отпускание ловим на window (см. useEffect ниже).
  const grab = (e: ThreeEvent<PointerEvent>) => {
    if (useRitualStore.getState().phase !== "place") return;
    e.stopPropagation();
    mode.current = "dragged";
    dragXZ.current = null;
    pick();
    haptic("clod");
  };

  const release = () => {
    if (mode.current !== "dragged") return;
    const g = groupRef.current;
    const spot = useRitualStore.getState().spot;
    // Решаем по НАМЕРЕНИЮ (последняя точка указателя на земле),
    // а не по отстающей за лерпом сосиске
    let px = g?.position.x ?? 0;
    let pz = g?.position.z ?? 0;
    if (dragXZ.current) {
      [px, pz] = dragXZ.current;
    }
    if (g && spot) {
      const d = Math.hypot(px - spot[0], pz - spot[1]);
      if (d < HOLE_R * 1.25) {
        mode.current = "falling";
        fallT.current = 0;
        fallFrom.current.copy(g.position);
        return;
      }
    }
    mode.current = "returning";
  };

  // Отпускание где угодно на странице заканчивает перетаскивание
  useEffect(() => {
    if (phase !== "place") return;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__releaseHookAt = Date.now();
    }
    const end = () => release();
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [phase]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = groupRef.current;
    const body = bodyRef.current;
    const squash = squashRef.current;
    if (!g || !body || !squash) return;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__mascotMode = mode.current;
    }
    const t = state.clock.elapsedTime;
    const st = useRitualStore.getState();
    const k = 1 - Math.exp(-14 * dt);

    switch (mode.current) {
      case "dragged": {
        // Ведём по плоскости земли; магнитное притяжение к яме
        state.raycaster.ray.intersectPlane(dragPlane, _tmp);
        dragXZ.current = [_tmp.x, _tmp.z];
        let tx = _tmp.x;
        let tz = _tmp.z;
        if (st.spot) {
          const d = Math.hypot(tx - st.spot[0], tz - st.spot[1]);
          if (d < HOLE_R * 1.6) {
            const pull = 1 - d / (HOLE_R * 1.6);
            tx = THREE.MathUtils.lerp(tx, st.spot[0], pull * 0.5);
            tz = THREE.MathUtils.lerp(tz, st.spot[1], pull * 0.5);
          }
        }
        g.position.x += (tx - g.position.x) * k;
        g.position.z += (tz - g.position.z) * k;
        g.position.y += (0.55 - g.position.y) * k;
        body.rotation.z = Math.sin(t * 9) * 0.14; // болтается в руках
        break;
      }

      case "falling": {
        fallT.current = Math.min(1, fallT.current + dt * 2.4);
        const ft = fallT.current;
        const spot = st.spot ?? [0, 0];
        // Дуга: подлёт и нырок в яму
        const ease = ft * ft * (3 - 2 * ft);
        g.position.x = THREE.MathUtils.lerp(fallFrom.current.x, spot[0], ease);
        g.position.z = THREE.MathUtils.lerp(fallFrom.current.z, spot[1], ease);
        const arc = Math.sin(ft * Math.PI) * 0.7;
        g.position.y =
          THREE.MathUtils.lerp(fallFrom.current.y, REST_Y, ease) + arc;
        // Ложится на бочок
        body.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2, ease);
        if (ft >= 1) {
          mode.current = "buried";
          squashT.current = 0; // запускаем сплющивание
          fxBus.spawn({ x: spot[0], y: 0.2, z: spot[1], count: 10, kind: "dust" });
          cameraShake.intensity = 0.5;
          sausageSplat();
          haptic("splat");
          st.advance(); // place → fill
        }
        break;
      }

      case "buried": {
        // Лежит в яме; при засыпке утягивается под землю
        const spot = st.spot ?? [0, 0];
        g.position.x = spot[0];
        g.position.z = spot[1];
        const sink = THREE.MathUtils.lerp(REST_Y, SUNK_Y, st.fillProgress);
        g.position.y += (sink - g.position.y) * k;
        body.rotation.z = Math.PI / 2;
        break;
      }

      case "returning": {
        g.position.x += (MASCOT_HOME[0] - g.position.x) * k;
        g.position.z += (MASCOT_HOME[2] - g.position.z) * k;
        g.position.y += (0 - g.position.y) * k;
        body.rotation.z *= 1 - k;
        if (
          Math.abs(g.position.x - MASCOT_HOME[0]) < 0.02 &&
          Math.abs(g.position.z - MASCOT_HOME[2]) < 0.02
        ) {
          mode.current = "idle";
        }
        break;
      }

      default: {
        // idle: дыхание + лёгкое покачивание
        const breathe = Math.sin(t * 2.2) * 0.02;
        body.scale.set(1 - breathe * 0.6, 1 + breathe, 1 - breathe * 0.6);
        body.rotation.z = Math.sin(t * 0.7) * 0.05;
        g.position.y += (0 - g.position.y) * k;
      }
    }

    // Squash-and-stretch после приземления
    if (squashT.current < 1) {
      squashT.current = Math.min(1, squashT.current + dt * 3.5);
      const sq = squashT.current;
      const bounce = Math.sin(sq * Math.PI);
      squash.scale.set(1 + bounce * 0.25, 1 - bounce * 0.3, 1 + bounce * 0.25);
    } else {
      squash.scale.set(1, 1, 1);
    }

    // Моргание (в яме глаза зажмурены от удовольствия — не моргаем)
    const left = leftEyeRef.current;
    const right = rightEyeRef.current;
    if (left && right) {
      let eyeScaleY = 1;
      if (mode.current === "dragged") {
        eyeScaleY = 1.25; // глаза по пять копеек
      } else if (mode.current === "buried") {
        eyeScaleY = 0.15; // зажмурился: «такова служба»
      } else {
        const sinceBlink = t - nextBlinkAt.current;
        if (sinceBlink > 0) {
          if (sinceBlink < 0.13) {
            eyeScaleY = Math.max(
              0.08,
              1 - Math.sin((sinceBlink / 0.13) * Math.PI),
            );
          } else {
            nextBlinkAt.current = t + 2.5 + Math.random() * 2.5;
          }
        }
      }
      left.scale.y += (eyeScaleY - left.scale.y) * Math.min(1, dt * 20);
      right.scale.y = left.scale.y;
    }
  });

  const grabbable = phase === "place";

  return (
    <group ref={groupRef} position={MASCOT_HOME}>
      <group ref={bodyRef}>
        <group ref={squashRef}>
          {/* тело: центр капсулы на высоте 0.9 → стоит на земле */}
          <mesh
            position={[0, 0.9, 0]}
            material={MAT.sausage}
            castShadow
            onPointerDown={grabbable ? grab : undefined}
          >
            <capsuleGeometry args={[0.45, 0.9, 12, 32]} />
          </mesh>

          {/* лицо (на передней поверхности, +z) */}
          <group position={[0, 1.22, 0]}>
            <mesh
              ref={leftEyeRef}
              position={[-0.17, 0, 0.38]}
              material={MAT.ink}
            >
              <sphereGeometry args={[0.075, 12, 10]} />
            </mesh>
            <mesh
              ref={rightEyeRef}
              position={[0.17, 0, 0.38]}
              material={MAT.ink}
            >
              <sphereGeometry args={[0.075, 12, 10]} />
            </mesh>
            <mesh position={[-0.145, 0.025, 0.445]} material={MAT.eyeWhite}>
              <sphereGeometry args={[0.024, 8, 6]} />
            </mesh>
            <mesh position={[0.195, 0.025, 0.445]} material={MAT.eyeWhite}>
              <sphereGeometry args={[0.024, 8, 6]} />
            </mesh>

            {/* румянец */}
            <mesh
              position={[-0.31, -0.14, 0.34]}
              scale={[1, 0.62, 0.5]}
              material={MAT.blush}
            >
              <sphereGeometry args={[0.075, 10, 8]} />
            </mesh>
            <mesh
              position={[0.31, -0.14, 0.34]}
              scale={[1, 0.62, 0.5]}
              material={MAT.blush}
            >
              <sphereGeometry args={[0.075, 10, 8]} />
            </mesh>

            {/* улыбка: полутор дугой вниз (чуть впереди поверхности капсулы) */}
            <mesh
              position={[0, -0.12, 0.455]}
              rotation={[0, 0, Math.PI]}
              material={MAT.ink}
            >
              <torusGeometry args={[0.085, 0.022, 8, 20, Math.PI]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
