# PROGRESS — журнал реализации «Сосиска-диггер»

> **Текущий стейдж: S4 · Следующий шаг: S4.1 place — drag маскота в яму со снапом**
>
> Правила: после каждого шага — отметка здесь + коммит `S<стейдж>.<шаг>: <что сделано>`.
> Новая сессия: прочитай этот файл и [PLAN.md](PLAN.md), продолжай со «Следующего шага».

## Стейджи

| Стейдж | Название | Статус |
|---|---|---|
| S0 | Каркас | ✅ |
| S1 | Статичная 3D-сцена | ✅ |
| S2 | Машина ритуала + диалог + место | ✅ |
| S3 | Копание | ✅ |
| S4 | Сосиска, засыпка, утаптывание | 🔄 |
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
- [x] S1.1 materials.ts (toon-градиент, палитра)
- [x] S1.2 Experience + dynamic(Scene3D, ssr:false) + детект WebGL
- [x] S1.3 Lights + SkyDome + тени
- [x] S1.4 Lawn (instanced деревья/цветы) + CloudField
- [x] S1.5 Mascot idle (капсула, глаза, моргание — своё «дыхание» вместо drei Float)
- [x] S1.6 CameraRig (aspect-адаптация) + DPR clamp
- [x] S1.DoD лужайка с дышащей сосиской, портрет-режим, нет скролла

### S2 · Машина ритуала + диалог + место
- [x] S2.1 phases.ts (enum, NEXT, guard'ы) + vitest переходов (8 тестов)
- [x] S2.2 ritualStore (persist partialize, subscribeWithSelector)
- [x] S2.3 Hud + DialogueBubble (skip) + NameForm
- [x] S2.4 SpotMarker (транзитный hover через interactionBus) + конфирм места
- [x] S2.5 PhaseHint (aria-live)
- [x] S2.DoD hello→chooseSpot→dig кликабелен, имя в localStorage

### S3 · Копание
- [x] S3.1 Terrain: геометрия 96×96, vertex colors, зона
- [x] S3.2 Кисть (cos²-falloff, бортик, mixDirtColor) + dirty-флаг
- [x] S3.3 Прогресс (квантованно, порог 80% объёма) + ProgressRing через ref
- [x] S3.4 DirtParticles (InstancedMesh, fxBus, гравитация)
- [x] S3.5 Shovel за указателем
- [x] S3.6 DirtMound растёт
- [x] S3.7 pointer capture (в try/catch!) + интерполяция свайпов + touch-action
- [x] S3.DoD яма роется до -0.546 из -0.55, авто-переход в place; FPS-замер отложен до реального устройства (S8)

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

- 2026-07-15 · S3 завершён. Механика подтверждена интроспекцией: 118 вершин ямы, minY=-0.546. Важные находки: (1) прогресс копания сделан = 80% идеального объёма, иначе кламп кисти делает 100% асимптотически недостижимым; (2) setPointerCapture обязан быть в try/catch (InvalidPointerId); (3) dev-хуки window.__ritual (стор) и window.__three (R3F state) — оставлены, полезны для e2e; (4) тест-среда: события панели приходят в ФИЗИЧЕСКИХ пикселях (×dpr) — синтетические жесты слать в координатах ×2, иначе луч мимо; редактирование модуля стора под HMR раздваивает стор (сцена в динамическом чанке остаётся на старом) — после правок стора делать полный reload; (5) новые react-hooks compiler-правила eslint отключены для src/components/scene/** — императивные мутации в useFrame это осознанный паттерн.

- 2026-07-15 · S2 завершён: полный флоу hello→dig проверен в браузере, persist работает (guestName в sosiska:v1). Открытый UX-долг для S3: в фазе dig место ямы не отмечено визуально — SpotMarker скрывается после chooseSpot; в S3 показать деликатный маркер, гаснущий с ростом digProgress. Заметка по тест-окружению: клики инструмента панели (computer) не доходят до React-кнопок — проверять флоу синтетическими событиями через javascript_tool (elementFromPoint подтверждает разметку, .click()/PointerEvent работают).

- 2026-07-15 · S0.1 готов: git init на main, PLAN.md (копия утверждённого плана), PROGRESS.md создан. Дальше S0.2.
- 2026-07-15 · S1 завершён: сцена в браузере (desktop 1280 и портрет), консоль чистая, build зелёный. Грабли: (1) элементы лица утопали в капсуле — z смещения должны быть ≥ поверхности (0.45 при r капсулы 0.45 на оси); (2) toon-терминатор падал на центр лица — свет передвинут на (8,10,8); (3) mesh-декор избегает пятна маскота (0,1.3). CameraRig принимает phase как prop — в S2 подключить store. Дальше S2.1.
- 2026-07-15 · S0 завершён: Next 16.2.10 + react 19.2.7 (~пин) + fiber 9.6.1/drei 10.7.7/three 0.185.1 — всё по плану. Шрифты: fontsource (главные css с unicode-range! сабсетные css без range — их не использовать), TTF для satori скачаны с fonts.gstatic.com (полные, с кириллицей). Нюанс: имена пары нужны в двух падежах — добавлено coupleGenitive в конфиг. Build зелёный, сплэш проверен на десктопе и mobile 375px. Дальше S1.1.
