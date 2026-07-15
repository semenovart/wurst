import * as THREE from "three";

/**
 * Палитра сцены. Синхронизирована с CSS-темой (globals.css) и сертификатом.
 */
export const PALETTE = {
  sky: "#7ec8f5",
  skyGolden: "#ffd98a",
  grassA: "#6cc551",
  grassB: "#58b944",
  grassFar: "#54ad42",
  dirt: "#8a5a3b",
  dirtDark: "#6b4128",
  sausage: "#e1764c",
  sausageDark: "#b85433",
  blush: "#f2a48b",
  cloud: "#ffffff",
  sun: "#ffd166",
  trunk: "#8a6242",
  leafA: "#4da53c",
  leafB: "#67c05a",
  ink: "#3a2e26",
  cream: "#fff8ec",
  shovelMetal: "#b9c4cc",
  marker: "#fff8ec",
} as const;

/**
 * Один трёхступенчатый градиент на все toon-материалы —
 * минимум компиляций шейдеров и единый характер света.
 */
const gradientMap = new THREE.DataTexture(
  new Uint8Array([90, 170, 255]),
  3,
  1,
  THREE.RedFormat,
);
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.needsUpdate = true;

export function toon(
  color: THREE.ColorRepresentation,
  opts: Partial<THREE.MeshToonMaterialParameters> = {},
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color, gradientMap, ...opts });
}

/** Разделяемые материалы-синглтоны (не диспозить в компонентах!) */
export const MAT = {
  terrain: toon("#ffffff", { vertexColors: true }),
  grassFar: toon(PALETTE.grassFar),
  sausage: toon(PALETTE.sausage),
  blush: new THREE.MeshBasicMaterial({ color: PALETTE.blush }),
  ink: new THREE.MeshBasicMaterial({ color: PALETTE.ink }),
  eyeWhite: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
  cloud: toon(PALETTE.cloud, { transparent: true }),
  trunk: toon(PALETTE.trunk),
  leafA: toon(PALETTE.leafA),
  leafB: toon(PALETTE.leafB),
  dirt: toon(PALETTE.dirt),
  sun: new THREE.MeshBasicMaterial({ color: PALETTE.sun }),
} as const;
