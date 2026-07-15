/**
 * Транзитные (покадровые) данные взаимодействия и шина эффектов — мимо React.
 * Пишутся обработчиками указателя, читаются в useFrame.
 */

/** Ховер при выборе места */
export const hoverSpot = {
  x: 0,
  z: 0,
  /** Указатель сейчас над валидным местом для ямы */
  active: false,
};

/** Позиция указателя над землёй в фазах dig/fill (для лопаты) */
export const digPointer = {
  x: 0,
  z: 0,
  /** Указатель над террейном */
  active: false,
  /** Кнопка/палец зажаты — идёт копание */
  pressing: false,
  /** Момент последнего «укуса» лопаты (сек, clock.elapsedTime) */
  lastBiteAt: -10,
};

/** Тряска камеры: пишется событиями (утаптывание, шлепок), гасится CameraRig */
export const cameraShake = { intensity: 0 };

/**
 * Прогресс церемонии 0..1: пишет Ceremony, читают SkyDome/Lights/CloudField/
 * SunAndRainbow — небо золотеет, тучи расходятся, солнце выкатывается.
 */
export const ceremonyMix = { v: 0 };

export type BurstKind = "dirt" | "dust" | "confetti";

export type Burst = {
  x: number;
  y: number;
  z: number;
  count: number;
  kind: BurstKind;
};

type BurstListener = (b: Burst) => void;
const burstListeners = new Set<BurstListener>();

/** Императивный спавн частиц: Terrain/Mascot стреляют, DirtParticles слушает */
export const fxBus = {
  spawn(b: Burst): void {
    for (const l of burstListeners) l(b);
  },
  subscribe(l: BurstListener): () => void {
    burstListeners.add(l);
    return () => {
      burstListeners.delete(l);
    };
  },
};
