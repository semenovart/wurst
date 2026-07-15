import { PALETTE } from "./materials";

/**
 * Небо и туман. Пока — статичный солнечный день;
 * в церемонии (S5) фон и туман лерпятся в золотистый.
 */
export function SkyDome() {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fog attach="fog" args={[PALETTE.sky, 24, 60]} />
    </>
  );
}
