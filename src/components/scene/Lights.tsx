/**
 * Освещение: hemisphere (небо/трава) + один направленный с тенью.
 * Тени кастуют только маскот, лопата и деревья; принимает — террейн.
 */
export function Lights() {
  return (
    <>
      <hemisphereLight args={["#cfe9ff", "#8bc46a", 1.1]} />
      <directionalLight
        position={[8, 10, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={2}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  );
}
