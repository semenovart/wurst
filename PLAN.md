# «Сосиска-диггер» — интерактивный сайт «закопай сосиску перед свадьбой»

## Контекст

Есть поверье: закопаешь сосиску перед свадьбой — на свадьбу будет хорошая погода. Делаем сайт-игрушку для гостей конкретной свадьбы друзей (v1), с архитектурным заделом на публичную мультисвадебную версию (v2). Гость проходит тактильный многоэтапный ритуал закапывания сосиски в 3D-сцене и получает именной «Сертификат гаранта хорошей погоды». Требования: ультрасовременно, вау-эффект, красиво на десктопе и в мобильном вебе, текущие best practices.

Директория `/Users/semenov_a/Documents/sosiska_digger` пуста, git не инициализирован.

## Процесс ведения прогресса (требование пользователя: устойчивость к обрыву сессии)

В корне репозитория живут два файла, коммитятся вместе с кодом:

- **`PLAN.md`** — копия этого плана (создаётся на стейдже S0, дальше не меняется, только при смене решений).
- **`PROGRESS.md`** — живой журнал. Структура:
  1. Шапка: `Текущий стейдж: S3 · Следующий шаг: S3.4 DirtParticles`.
  2. Таблица стейджей S0–S8 со статусами (⬜ / 🔄 / ✅).
  3. Чеклист шагов внутри каждого стейджа (`[x]`/`[ ]`).
  4. Append-only журнал: `2026-07-15 14:30 · S3.2 готов: brush деформирует террейн; проблема: нормали моргают — решено dirty-флагом; дальше S3.3`.

**Правила:** после каждого завершённого шага — отметка в PROGRESS.md; коммит после каждого зелёного шага с сообщением вида `S3.2: terrain brush + vertex colors`. Известные проблемы и недоделки фиксируются в журнале сразу. Новая сессия начинает с чтения PROGRESS.md → продолжает с «Следующий шаг».

## Решения, зафиксированные с пользователем (гриль-сессия)

1. **Аудитория**: v1 под одну свадьбу → v2 публичная игрушка. Вся персонализация в `wedding.config.ts` (плейсхолдеры «Маша и Дима», дата, город) — в v2 конфиг станет записью БД с URL `/w/[slug]`.
2. **Механика**: многоэтапный ритуал — приветствие маскота (2–3 реплики о поверье, skippable) → имя гостя (опционально) → выбор места → копание свайпами (земля реально деформируется) → перенос сосиски в яму → засыпание → утаптывание тапами → церемония → сертификат.
3. **Визуал**: стилизованное low-poly 3D, toon-шейдинг, React Three Fiber. Все модели процедурные (без GLB и текстур). Дух Monument Valley / Crossy Road.
4. **Финал**: церемония (тучи расходятся, солнце, радуга) + именной сертификат с честным порядковым номером. Погода всегда «гарантированно хорошая», реального прогноза НЕТ.
5. **Бэкенд**: общий счётчик + стена пожеланий. **Одна сосиска на гостя** (localStorage; повторный визит — фаза `returned` со своим сертификатом).
6. **Стек**: Next.js 16 App Router + Vercel + Upstash Redis; динамические OG-превью `/s/[id]`.
7. **Арт**: милый маскот с глазками + псевдосерьёзные канцелярские тексты («Метеоритуальная служба»).
8. **Звук**: полный синтезированный звук (WebAudio, 0 байт ассетов) + вибрация; старт после первого касания, кнопка mute (persist).
9. **Модерация**: лимит 140 символов, серверный стоп-словарь RU/EN с нормализацией обходов, rate limit по IP, скрытый админ-DELETE по секретному ключу.
10. **UX-структура**: всё в одной сцене, без лендинга; стена и счётчик — выезжающая панель; обратный отсчёт до свадьбы.
11. **Язык**: русский, все строки в `strings.ru.ts` (i18n-ready).

## Зависимости (версии проверены по npm, июль 2026)

- `next` ^16.2 (route handlers, `next/og` — отдельный satori не нужен), `react`/`react-dom` **`~19.2.7` — пиновать тильдой**: peer fiber 9.6 требует `>=19 <19.3`.
- `three` ^0.185, `@react-three/fiber` ^9.6, `@react-three/drei` ^10.7 (только точечные импорты: `Float`, `Sparkles`, `PerformanceMonitor`, `AdaptiveDpr`).
- `zustand` ^5 (persist + subscribeWithSelector), `zod` ^4, `@upstash/redis` ^1.38, `@upstash/ratelimit` ^2.
- Dev: TypeScript ^5 strict (+`noUncheckedIndexedAccess`), Tailwind ^4.3 (CSS-first, только для HUD), ESLint 9 + eslint-config-next, vitest, `@types/three@0.185.x` (минор = three).
- **Сознательно не берём**: framer-motion (хватит CSS), физдвижок (скриптованные твины), xstate (enum + таблица переходов), postprocessing (убийца FPS на мобильных), html2canvas (рисуем Canvas 2D напрямую), howler (WebAudio-синтез).
- Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL`.

## Структура проекта (src/)

```
config/wedding.config.ts        — единственное место персонализации
app/layout.tsx                  — lang=ru, metadata, viewportFit:cover, preload шрифтов
app/globals.css                 — Tailwind v4 @theme, @font-face, safe-area, dvh, touch-action
app/page.tsx                    — серверная: метаданные + <Experience/>
app/opengraph-image.tsx         — общая OG-карточка сайта
app/s/[id]/page.tsx             — страница шаринга («Сосиска №N закопана!», CTA)
app/s/[id]/opengraph-image.tsx  — персональный OG-сертификат (ImageResponse)
app/api/{burial,wish,wall}/route.ts + api/admin/wish/[id]/route.ts
components/Experience.tsx       — детект WebGL → dynamic(Scene3D, ssr:false) | Fallback2D; splash
components/hud/*                — DialogueBubble, NameForm, PhaseHint(aria-live), ProgressRing(через ref),
                                  CountdownBadge, CounterBadge, MuteButton, WallPanel, WishForm, CertificateModal
components/scene/*              — Scene3D(Canvas dpr=[1,2]), CameraRig, Lights, SkyDome, Lawn, Terrain(ЯДРО),
                                  DirtMound, DirtParticles, SpotMarker, Shovel, Mascot, CloudField,
                                  SunAndRainbow, Ceremony, materials.ts
components/fallback/Fallback2D.tsx — SVG-сценка «закопать силой мысли» → тот же POST и сертификат
store/phases.ts + ritualStore.ts   — машина фаз (zustand)
lib/strings.ru.ts               — ВСЕ тексты (канцелярит)
lib/{redis,keys,ratelimit,moderation,validation,ids,burialApi,device,haptics}.ts
lib/audio/{engine,sfx}.ts       — WebAudio-синглтон + синтез всех звуков
lib/certificate/{spec.ts,drawCertificate.ts,OgCertificate.tsx,fonts.server.ts}
assets/fonts/*.ttf              — ТОЛЬКО для satori (WOFF2 не поддержан satori!)
public/fonts/*.woff2            — сабсеты cyrillic+latin для браузера
```

## Ключевые архитектурные решения

### Машина ритуала (zustand)
`loading → hello → chooseSpot → dig → place → fill → tamp → ceremony → certificate`, отдельный вход `returned` (persist содержит burial). `advance()` по таблице `NEXT` + guard'ы (dig→place только при digProgress≥1), невалидный переход — no-op. Persist partialize: `{guestName, burial, muted}`, ключ `sosiska:v1`. **Покадровые данные только в refs/атрибутах геометрии**; в store — квантованный прогресс (шаг 0.05); HUD-кольцо пишет в DOM через ref мимо React.

### Деформация земли (Terrain.tsx — главный риск, делать раньше всего остального)
`PlaneGeometry(14,14,96,96)` с запечённым `rotateX(-π/2)` (высота = Y атрибута), vertex colors (трава↔земля по глубине), `MeshToonMaterial({vertexColors:true})`. При выборе места предвычисляем `zoneIndices` (вершины зоны, ~200–300) — кисть итерирует только их. Ввод: R3F `onPointerDown/Move`, `e.point` — готовая мировая точка (свой raycaster не нужен), `setPointerCapture`, быстрые свайпы интерполируем сегментами. Кисть: cos²-falloff внутрь, бортик снаружи, clamp [-MAX_DEPTH, RIM_H], `mixDirtColor`. `computeVertexNormals` + пересчёт прогресса — не чаще раза за кадр по dirty-флагу. Засыпание — та же кисть dir=+1 до профиля «холмик»; куча DirtMound растёт/тает (иллюзия сохранения объёма). Утаптывание — тапы: сжатие бугра твином, пыль, camera shake.

### Частицы (DirtParticles.tsx)
InstancedMesh (icosahedron-0), пул 150, SoA Float32Array, спавн через модульный `fxBus` (не props — ноль ре-рендеров), гравитация в useFrame, матрицы через общий dummy-Object3D. Второй конфиг того же компонента = конфетти церемонии.

### Toon + свет + церемония
Один общий `DataTexture` градиент (3×1, NearestFilter) на все MeshToonMaterial; материалы-синглтоны в materials.ts. HemisphereLight + один DirectionalLight с тенью (mapSize 1024, ортобокс ±8); тени кастуют только маскот/лопата/деревья. Ceremony — таймлайн keyframes в useFrame: облака разъезжаются, фон/фог лерпится в золото, солнце пульсирует, радуга = 7 полуторов, Sparkles + конфетти.

### Камера (CameraRig)
Позы = f(фаза, aspect), сглаживание `lerp(goal, 1-exp(-4dt))`. **Портрет (aspect<0.9): дистанция ×1.35–1.5, камера выше, fov 62 vs 50.** Shake — шум поверх позы, 0 при reduced-motion.

### Бэкенд (Upstash Redis)
Ключи через `keys(scope='default')` — задел на v2: `s:{scope}:count` (INCR), `s:{scope}:burial:{id}` (HASH: n, name, ts, wish?, hidden?), `s:{scope}:wall` (ZSET по wishTs, cap 500 через ZREMRANGEBYRANK).
- POST `/api/burial` {name?≤40}: zod → ratelimit 5/10м по IP → модерация имени → INCR → id=10 hex из crypto → 201 {id,n}.
- POST `/api/wish` {id, wish≤140}: ratelimit 3/10м → HSETNX (одно пожелание на сосиску, повтор 409) → ZADD.
- GET `/api/wall`: count + ZRANGE REV 0 49 + pipeline HGETALL; `Cache-Control: s-maxage=15, swr=60`.
- DELETE `/api/admin/wish/[id]`: заголовок x-admin-key, сравнение `timingSafeEqual(sha256(...))`; ZREM+HDEL, сертификат остаётся жив.

**Деградация**: без env — in-memory реализация мини-интерфейса (dev без сети); на проде ошибки Redis НЕ маскируются (503 {degraded}). Клиентский `burialApi`: провал POST → локальный сертификат «№ ~N, уточняется» + фоновые ретраи с backoff. **Ритуал никогда не блокируется бэкендом** — POST уходит асинхронно в начале церемонии.

### Модерация (moderation.ts + vitest-тесты — обязательно)
Нормализация: lowercase → ё→е → латинские двойники в кириллицу → leet (0→о, 3→е, @→а…) → схлопывание повторов → удаление разделителей («х.у.й»). Корни-подстроки (хуй/пизд/бляд/ебан/пидор/fuck/…) + точные слова по границам (бля, сука, хер) + allowlist приоритетнее (оскорб-, употреб-, рубл-, команд-, истреб-). Тесты: срабатывания, обходы, ложные срабатывания.

### Сертификат: один дизайн — два рендера
`spec.ts` — источник правды: 1200×630 (клиент ×2), палитра из 3D-сцены, layout-константы, тексты («настоящим удостоверяется, что {имя} собственноручно закопал(а) сосиску установленного образца…», печать «ОДОБРЕНО • ОСАДКИ ОТМЕНЕНЫ»). Клиент: Canvas 2D после `document.fonts.ready`, toBlob → navigator.share({files}) → a[download] → фолбэк «зажми, чтобы сохранить». Сервер: `OgCertificate.tsx` (satori-JSX) в opengraph-image. **Шрифты**: Rubik 400/700 + Caveat 700 (кириллица, OFL); браузеру — woff2 через ручной @font-face (не next/font — канвасу нужны предсказуемые family-имена), satori — TTF из assets/fonts (fs.readFile + module-cache). В Next 15+ `params` роута — Promise (await).

### Звук (0 ассетов) и вибро
`engine.ts`: AudioContext-синглтон, unlock на первый pointerdown ({once,capture}), тихий буфер для iOS, шины sfx/amb→master, mute = ramp gain. `sfx.ts` — всё синтезом: digScrape (шум bandpass, питч от скорости свайпа), clodPlop, sausageSplat (синус-глиссандо + «бойнг»), pour, tampThump, fanfare (арпеджио с делэем), ambient (ветер-шум + случайные птички-FM). `haptics.ts`: navigator.vibrate паттерны (DIG [8], SPLAT [40,60,30], FANFARE [30,60,30,60,90]), троттлинг 50мс, выключается вместе с mute; iOS честно деградирует в ничто.

### Производительность / мобильный веб / a11y (best practices)
- DPR clamp [1,2] + PerformanceMonitor: onDecline → dpr 1.25, пул частиц 60, крайняя ступень — без теней; AdaptiveDpr.
- Ноль setState/аллокаций в useFrame; переиспользуемые Vector3; транзитные zustand-подписки.
- Ленивая загрузка: page серверная (метаданные/LCP), Experience клиентский, внутри `dynamic(import Scene3D, {ssr:false})` (в Next 15+/16 ssr:false только в клиентских компонентах); three — отдельный чанк (~220–280KB gz); пока грузится — серверный SVG-splash (быстрый LCP). drawCertificate — import() заранее на фазе tamp. Бюджет DOM-оболочки ~120–150KB gz по `next build`.
- prefers-reduced-motion: без тряски/конфетти, укороченные твины, ритуал полностью проходим.
- Фолбэк без WebGL: hasWebGL() до импорта + ErrorBoundary вокруг Canvas → Fallback2D (тот же POST-флоу, Canvas-2D сертификату WebGL не нужен).
- Мобайл: viewportFit cover + env(safe-area-inset-*), h-[100dvh], overscroll-behavior none, `touch-action:none` ТОЛЬКО на обёртке канваса, manipulation на кнопках, user-select none на HUD.
- A11y: PhaseHint в aria-live=polite, aria-label на иконках, фокус-ловушка в модалках, альтернатива жестам — кнопка «копать» с удержанием, контраст ≥4.5, aria-pressed на mute.

## Стейджи реализации (S0–S8)

Каждый стейдж заканчивается проверяемым результатом в браузере и коммитом. Шаги стейджа — чеклист в PROGRESS.md.

### S0 · Каркас
S0.1 `git init` + создать PLAN.md (копия плана) и PROGRESS.md (таблица стейджей). S0.2 `create-next-app` (ts, tailwind, src, app) в текущую директорию + deps. S0.3 strict tsconfig, eslint, vitest-конфиг. S0.4 `wedding.config.ts` + `strings.ru.ts`. S0.5 шрифты (woff2 в public, ttf в assets) + @font-face + preload. S0.6 layout (metadata, viewport cover) + globals.css (тема, safe-area, dvh). S0.7 серверный splash + CountdownBadge.
**DoD:** `npm run dev` → сплэш с именами пары и тикающим отсчётом; `npm run build` зелёный.

### S1 · Статичная 3D-сцена
S1.1 materials.ts (toon-градиент, палитра). S1.2 Experience + dynamic(Scene3D, ssr:false) + детект WebGL (заглушка фолбэка). S1.3 Lights + SkyDome + тени. S1.4 Lawn (instanced деревья/цветы) + CloudField. S1.5 Mascot idle (капсула, глаза, моргание, Float). S1.6 CameraRig с адаптацией под aspect + DPR clamp.
**DoD:** лужайка с дышащей сосиской; в эмуляции портрета камера дальше/выше; страница не скроллится.

### S2 · Машина ритуала + диалог + выбор места
S2.1 phases.ts (enum, NEXT, guard'ы) + vitest на переходы. S2.2 ritualStore (persist partialize, subscribeWithSelector). S2.3 Hud + DialogueBubble (skip) + NameForm. S2.4 SpotMarker + фиксация места (zoneIndices предвычисляются). S2.5 PhaseHint с aria-live.
**DoD:** флоу hello→chooseSpot кликабелен; имя переживает F5; невалидные переходы — no-op.

### S3 · Копание (главный риск — раньше всей мишуры)
S3.1 Terrain: геометрия, vertex colors, зона. S3.2 Кисть (cos²-falloff, бортик, mixDirtColor) + dirty-флаг + нормали раз в кадр. S3.3 Прогресс копания → store (квантованно) + ProgressRing через ref. S3.4 DirtParticles (InstancedMesh, fxBus, гравитация). S3.5 Shovel следует за указателем. S3.6 DirtMound растёт. S3.7 pointer capture, интерполяция свайпов, touch-action:none на обёртке канваса.
**DoD:** яма честно роется мышью и тачем, летят комья, прогресс→1 переводит в place; ≥50 FPS при копании на десктопе, ≥30 в мобильной эмуляции с CPU 4x.

### S4 · Сосиска, засыпка, утаптывание
S4.1 place: drag маскота по плоскости, магнитный снап, скриптованное падение + squash-and-stretch. S4.2 fill: кисть dir=+1 до профиля холмика, DirtMound тает. S4.3 tamp: тапы, сжатие бугра, пыль, camera shake.
**DoD:** полный ритуал офлайн от привета до утоптанного холмика.

### S5 · Церемония + сертификат (клиент)
S5.1 Ceremony timeline (облака, золотой свет, фог). S5.2 SunAndRainbow + Sparkles + конфетти (второй конфиг частиц). S5.3 certificate/spec.ts (дизайн, тексты, палитра). S5.4 drawCertificate.ts (Canvas 2D ×2, document.fonts.ready). S5.5 CertificateModal: превью, «Скачать PNG» (share files → a[download] → long-press фолбэк).
**DoD:** финал с расходящимися тучами; скачанный PNG с кириллицей, именем и печатью.

### S6 · Бэкенд + стена + share
S6.1 redis.ts (Upstash | in-memory для dev) + keys.ts. S6.2 validation.ts (zod) + ids.ts. S6.3 moderation.ts + vitest (мат/обходы/ложные). S6.4 ratelimit.ts. S6.5 роуты burial/wish/wall/admin. S6.6 burialApi.ts (асинхронный POST в начале церемонии, ретраи, «№ ~N» при деградации). S6.7 CounterBadge + WallPanel + WishForm. S6.8 `/s/[id]` (generateMetadata) + оба opengraph-image. S6.9 фаза returned (повторный визит).
**DoD:** curl-сценарий из раздела «Верификация» зелёный; повторный визит показывает свой сертификат; OG-роут отдаёт 200 image/png с кириллицей.

### S7 · Звук + вибро
S7.1 engine.ts (unlock на первый pointerdown, шины, iOS-буфер). S7.2 sfx.ts (dig/plop/splat/pour/thump/fanfare + ambient). S7.3 haptics.ts (паттерны, троттлинг). S7.4 MuteButton (persist, aria-pressed, глушит и вибро).
**DoD:** тишина до первого тапа; звук на каждом действии; mute мгновенный и переживает F5.

### S8 · Полировка + прод
S8.1 Fallback2D (SVG-сценка → тот же POST → Canvas-сертификат). S8.2 prefers-reduced-motion (без тряски/конфетти). S8.3 PerformanceMonitor-деградация (dpr → частицы → тени). S8.4 a11y-проход (aria, фокус-ловушки, кнопка «копать» удержанием). S8.5 README (setup Upstash, замена wedding.config, откуда шрифты). S8.6 деплой Vercel + env + прод-проверка OG в Telegram. S8.7 Lighthouse mobile (Perf ≥85, A11y ≥95) + реальные устройства.
**DoD:** прод-ссылка в Telegram разворачивается личной OG-карточкой; чек-лист верификации полностью зелёный.

## Верификация (сквозной чек-лист)

- `npm run dev` без env (memory-redis): полный ритуал; эмуляция iPhone-портрета + touch + CPU 4x — ≥30 FPS.
- `npx vitest run`: модерация (мат/«х у й»/leet/двойники; НЕ срабатывает на «оскорблять», «рубля», «команда») + переходы фаз.
- `npm run build`: strict, three в отдельном lazy-чанке, бюджет first-load.
- curl-сценарий: 6×POST burial → 429; wish с матом → 422; GET wall → count растёт; admin DELETE: 401/успех, /s/[id] жив.
- OG: `curl -sI /s/<id>/opengraph-image` → 200 image/png; глазами кириллица; на проде Telegram @WebpageBot.
- Lighthouse mobile: Perf ≥85, A11y ≥95.
- Спецрежимы: prefers-reduced-motion; `--disable-webgl` → Fallback2D до сертификата; прод без Upstash env → «№ ~N».
- Реальные устройства: iPhone Safari (safe-area, звук, share files), Android Chrome (вибро).

## Примечания

- Домен: сначала *.vercel.app, свой домен пара подключит позже.
- Перед свадьбой пользователь меняет только `wedding.config.ts` и env на Vercel.
