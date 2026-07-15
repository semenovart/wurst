/** Геометрия ритуальной зоны (общие константы сцены) */

/** Где маскот стоит и здоровается */
export const MASCOT_HOME: [number, number, number] = [0, 0, 1.3];

/** Радиус зоны, где можно выбрать место ямы (от центра лужайки) */
export const SPOT_ZONE_R = 3.2;

/** Минимальная дистанция ямы от маскота */
export const MASCOT_CLEAR_R = 1.4;

/** Радиус самой ямы */
export const HOLE_R = 0.85;

export function isValidSpot(x: number, z: number): boolean {
  if (Math.hypot(x, z) > SPOT_ZONE_R) return false;
  const [mx, , mz] = MASCOT_HOME;
  return Math.hypot(x - mx, z - mz) >= MASCOT_CLEAR_R;
}
