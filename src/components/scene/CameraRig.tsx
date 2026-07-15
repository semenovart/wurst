import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "@/store/phases";
import { cameraShake } from "./interactionBus";
import { usePrefersReducedMotion } from "@/lib/device";

type Pose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

const ORIGIN = new THREE.Vector3(0, 0, 0);

/**
 * Позы камеры по фазам ритуала с адаптацией под портретный экран:
 * дистанция ×~1.45, точка выше, fov шире — узкий кадр вмещает сцену.
 */
function poseFor(
  phase: Phase,
  portrait: boolean,
  spot: THREE.Vector3 | null,
  out: Pose,
): void {
  const m = portrait ? 1.45 : 1;
  out.fov = portrait ? 62 : 50;

  switch (phase) {
    case "loading":
    case "hello":
      out.pos.set(0, portrait ? 2.0 : 1.6, 4.4 * m);
      out.look.set(0, 0.95, 0.6);
      break;
    case "chooseSpot":
      out.pos.set(0, 9 * m, 7 * m);
      out.look.set(0, 0, 0);
      break;
    case "dig":
    case "place":
    case "fill":
    case "tamp": {
      const s = spot ?? ORIGIN;
      out.pos.set(s.x + 2.6 * m, 3.4 * m, s.z + 3.8 * m);
      out.look.copy(s);
      break;
    }
    case "ceremony":
      out.pos.set(0, 3.2 * m, 9 * m);
      out.look.set(0, 2.6, 0);
      break;
    case "certificate":
    case "returned":
      out.pos.set(0, 3.6 * m, 7.5 * m);
      out.look.set(0, 0.9, 0);
      break;
  }
}

export function CameraRig({
  phase,
  spot = null,
}: {
  phase: Phase;
  spot?: THREE.Vector3 | null;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const reducedMotion = usePrefersReducedMotion();
  const lookTarget = useRef(new THREE.Vector3(0, 0.95, 0.6));
  const pose = useRef<Pose>({
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
    fov: 50,
  });

  useFrame(({ clock }, dt) => {
    const portrait = size.width / size.height < 0.9;
    const p = pose.current;
    poseFor(phase, portrait, spot, p);

    // Экспоненциальное сглаживание — независимо от FPS
    const k = 1 - Math.exp(-4 * dt);
    camera.position.lerp(p.pos, k);
    lookTarget.current.lerp(p.look, k);

    // Тряска (утаптывание/шлепок): затухающий шум поверх позы.
    // prefers-reduced-motion — гасим сразу, без визуального эффекта.
    if (cameraShake.intensity > 0.001) {
      if (reducedMotion) {
        cameraShake.intensity = 0;
      } else {
        const a = cameraShake.intensity;
        const t = clock.elapsedTime * 30;
        camera.position.x += Math.sin(t * 1.3) * 0.05 * a;
        camera.position.y += Math.sin(t * 1.7 + 1) * 0.04 * a;
        cameraShake.intensity = Math.max(0, a - dt * 2.5);
      }
    }

    camera.lookAt(lookTarget.current);

    if (Math.abs(camera.fov - p.fov) > 0.1) {
      camera.fov += (p.fov - camera.fov) * k;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
