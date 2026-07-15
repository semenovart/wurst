import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAT } from "./materials";

/** Где маскот стоит и здоровается в начале ритуала */
export const MASCOT_HOME: [number, number, number] = [0, 0, 1.3];

/**
 * Сосиска-маскот: процедурная капсула с лицом.
 * Idle: дыхание (squash без изменения объёма), лёгкое покачивание, моргание.
 */
export function Mascot() {
  const bodyRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const nextBlinkAt = useRef(2.4);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const body = bodyRef.current;
    if (body) {
      const breathe = Math.sin(t * 2.2) * 0.02;
      body.scale.set(1 - breathe * 0.6, 1 + breathe, 1 - breathe * 0.6);
      body.rotation.z = Math.sin(t * 0.7) * 0.05;
    }
    // Моргание: раз в 2.5–5 с сжимаем глаза по Y на ~130 мс
    const left = leftEyeRef.current;
    const right = rightEyeRef.current;
    if (left && right) {
      const sinceBlink = t - nextBlinkAt.current;
      let eyeScaleY = 1;
      if (sinceBlink > 0) {
        if (sinceBlink < 0.13) {
          eyeScaleY = Math.max(0.08, 1 - Math.sin((sinceBlink / 0.13) * Math.PI));
        } else {
          nextBlinkAt.current = t + 2.5 + Math.random() * 2.5;
        }
      }
      left.scale.y = eyeScaleY;
      right.scale.y = eyeScaleY;
    }
  });

  return (
    <group position={MASCOT_HOME}>
      <group ref={bodyRef}>
        {/* тело: центр капсулы на высоте 0.9 → стоит на земле */}
        <mesh position={[0, 0.9, 0]} material={MAT.sausage} castShadow>
          <capsuleGeometry args={[0.45, 0.9, 12, 32]} />
        </mesh>

        {/* лицо (на передней поверхности, +z) */}
        <group position={[0, 1.22, 0]}>
          <mesh ref={leftEyeRef} position={[-0.17, 0, 0.38]} material={MAT.ink}>
            <sphereGeometry args={[0.075, 12, 10]} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.17, 0, 0.38]} material={MAT.ink}>
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
  );
}
