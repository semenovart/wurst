# PROGRESS — журнал реализации «Сосиска-диггер»

> **Текущий стейдж: S1 · Следующий шаг: S1.1 materials.ts (toon-градиент, палитра)**
>
> Правила: после каждого шага — отметка здесь + коммит `S<стейдж>.<шаг>: <что сделано>`.
> Новая сессия: прочитай этот файл и [PLAN.md](PLAN.md), продолжай со «Следующего шага».

## Стейджи

| Стейдж | Название | Статус |
|---|---|---|
| S0 | Каркас | ✅ |
| S1 | Статичная 3D-сцена | 🔄 |
| S2 | Машина ритуала + диалог + место | ⬜ |
| S3 | Копание | ⬜ |
| S4 | Сосиска, засыпка, утаптывание | ⬜ |
| S5 | Церемония + сертификат (клиент) | ⬜ |
| S6 | Бэкенд + стена + share | ⬜ |
| S7 | Звук + вибро | ⬜ |
| S8 | Полировка + прод | ⬜ |

## Чеклисты

### S0 · Каркас
- [x] S0.1 git init (main) + PLAN.md + PROGRESS.md
- [x] S0.2 скаффолд Next.js (пинованные версии из PLAN.md) + npm install
- [x] S0.3 strict tsconfig (+noUncheckedIndexedAccess), eslint flat, vitest
- [x] S0.4 wedding.config.ts + strings.ru.ts
- [x] S0.5 шрифты: fontsource (woff2 браузеру) + TTF в src/assets/fonts для satori
- [x] S0.6 layout (metadata, viewport cover) + globals.css (тема, safe-area, dvh)
- [x] S0.7 серверный splash + CountdownBadge
- [x] S0.DoD dev-сервер: сплэш с именами и отсчётом; build зелёный

### S1 · Статичная 3D-сцена
- [ ] S1.1 materials.ts (toon-градиент, палитра)
- [ ] S1.2 Experience + dynamic(Scene3D, ssr:false) + детект WebGL
- [ ] S1.3 Lights + SkyDome + тени
- [ ] S1.4 Lawn (instanced деревья/цветы) + CloudField
- [ ] S1.5 Mascot idle (капсула, глаза, моргание, Float)
- [ ] S1.6 CameraRig (aspect-адаптация) + DPR clamp
- [ ] S1.DoD лужайка с дышащей сосиской, портрет-режим, нет скролла

### S2 · Машина ритуала + диалог + место
- [ ] S2.1 phases.ts (enum, NEXT, guard'ы) + vitest переходов
- [ ] S2.2 ritualStore (persist partialize, subscribeWithSelector)
- [ ] S2.3 Hud + DialogueBubble (skip) + NameForm
- [ ] S2.4 SpotMarker + фиксация места (zoneIndices)
- [ ] S2.5 PhaseHint (aria-live)
- [ ] S2.DoD hello→chooseSpot кликабелен, имя переживает F5

### S3 · Копание
- [ ] S3.1 Terrain: геометрия 96×96, vertex colors, зона
- [ ] S3.2 Кисть (cos²-falloff, бортик, mixDirtColor) + dirty-флаг
- [ ] S3.3 Прогресс (квантованно) + ProgressRing через ref
- [ ] S3.4 DirtParticles (InstancedMesh, fxBus, гравитация)
- [ ] S3.5 Shovel за указателем
- [ ] S3.6 DirtMound растёт
- [ ] S3.7 pointer capture + интерполяция свайпов + touch-action
- [ ] S3.DoD яма роется мышью/тачем, комья летят, ≥50 FPS

### S4 · Сосиска, засыпка, утаптывание
- [ ] S4.1 place: drag + снап + падение со squash
- [ ] S4.2 fill: кисть dir=+1 до холмика, DirtMound тает
- [ ] S4.3 tamp: тапы, сжатие бугра, пыль, shake
- [ ] S4.DoD полный ритуал офлайн

### S5 · Церемония + сертификат (клиент)
- [ ] S5.1 Ceremony timeline (облака, золото, фог)
- [ ] S5.2 SunAndRainbow + Sparkles + конфетти
- [ ] S5.3 certificate/spec.ts (дизайн, тексты)
- [ ] S5.4 drawCertificate.ts (Canvas 2D ×2, fonts.ready)
- [ ] S5.5 CertificateModal (скачать/share/long-press)
- [ ] S5.DoD финал + PNG с кириллицей и печатью

### S6 · Бэкенд + стена + share
- [ ] S6.1 redis.ts (Upstash | memory) + keys.ts
- [ ] S6.2 validation.ts (zod) + ids.ts
- [ ] S6.3 moderation.ts + vitest
- [ ] S6.4 ratelimit.ts
- [ ] S6.5 роуты burial/wish/wall/admin
- [ ] S6.6 burialApi.ts (async POST, ретраи, «№ ~N»)
- [ ] S6.7 CounterBadge + WallPanel + WishForm
- [ ] S6.8 /s/[id] + оба opengraph-image
- [ ] S6.9 фаза returned
- [ ] S6.DoD curl-чеклист, повторный визит, OG 200 image/png

### S7 · Звук + вибро
- [ ] S7.1 engine.ts (unlock, шины, iOS-буфер)
- [ ] S7.2 sfx.ts (все звуки + ambient)
- [ ] S7.3 haptics.ts
- [ ] S7.4 MuteButton (persist, aria-pressed)
- [ ] S7.DoD тишина до тапа, mute мгновенный

### S8 · Полировка + прод
- [ ] S8.1 Fallback2D
- [ ] S8.2 prefers-reduced-motion
- [ ] S8.3 PerformanceMonitor-деградация
- [ ] S8.4 a11y-проход
- [ ] S8.5 README
- [ ] S8.6 деплой Vercel + env + OG в Telegram
- [ ] S8.7 Lighthouse + реальные устройства
- [ ] S8.DoD прод-ссылка с личной OG-карточкой

## Журнал (append-only)

- 2026-07-15 · S0.1 готов: git init на main, PLAN.md (копия утверждённого плана), PROGRESS.md создан. Дальше S0.2.
- 2026-07-15 · S0 завершён: Next 16.2.10 + react 19.2.7 (~пин) + fiber 9.6.1/drei 10.7.7/three 0.185.1 — всё по плану. Шрифты: fontsource (главные css с unicode-range! сабсетные css без range — их не использовать), TTF для satori скачаны с fonts.gstatic.com (полные, с кириллицей). Нюанс: имена пары нужны в двух падежах — добавлено coupleGenitive в конфиг. Build зелёный, сплэш проверен на десктопе и mobile 375px. Дальше S1.1.
