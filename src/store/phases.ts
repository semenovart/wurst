/**
 * Фазы ритуала. Линейная машина с одним особым входом `returned`
 * (повторный визит гостя, у которого сосиска уже закопана).
 */
export const PHASES = [
  "loading",
  "hello",
  "chooseSpot",
  "dig",
  "place",
  "fill",
  "tamp",
  "ceremony",
  "certificate",
  "returned",
] as const;

export type Phase = (typeof PHASES)[number];

/** Таблица допустимых переходов вперёд; всё остальное — no-op */
export const NEXT: Partial<Record<Phase, Phase>> = {
  loading: "hello",
  hello: "chooseSpot",
  chooseSpot: "dig",
  dig: "place",
  place: "fill",
  fill: "tamp",
  tamp: "ceremony",
  ceremony: "certificate",
};

/** Фазы, в которых идёт взаимодействие с землёй у ямы */
export const DIG_SITE_PHASES: ReadonlySet<Phase> = new Set([
  "dig",
  "place",
  "fill",
  "tamp",
]);
