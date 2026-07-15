# 🌭 Сосиска-диггер

Интерактивный сайт-ритуал: закопай сосиску перед свадьбой — и на свадьбе будет
хорошая погода. Гость проходит тактильный 3D-ритуал (выбрать место → выкопать
яму свайпами → уложить сосиску → засыпать → утоптать), смотрит церемонию с
радугой и получает именной «Сертификат гаранта хорошей погоды» с честным
порядковым номером. Пожелания попадают на общую стену почёта.

**Стек:** Next.js 16 (App Router) · React 19 · React Three Fiber 9 + three ·
zustand · Tailwind 4 · Upstash Redis · satori/next-og · WebAudio (звук без
ассетов, чистый синтез).

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:3000 — без env работает на in-memory БД
```

Полезные команды:

```bash
npm run build      # прод-сборка
npm run typecheck  # строгий TypeScript
npm run lint       # eslint
npm test           # vitest: машина фаз + модерация
```

## Персонализация свадьбы

Все данные пары — в одном файле
[`src/config/wedding.config.ts`](src/config/wedding.config.ts):

```ts
coupleLabel: "Маша и Дима",       // именительный: «Маша и Дима женятся»
coupleGenitive: "Маши и Димы",    // родительный: «свадьба Маши и Димы»
dateISO: "2026-09-12T14:00:00+03:00",
city: "Санкт-Петербург",
```

Тексты (реплики маскота, сертификат, канцелярит) — в
[`src/lib/strings.ru.ts`](src/lib/strings.ru.ts).

## Переменные окружения

Скопируйте `.env.example` → `.env.local`:

| Переменная | Зачем |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Общий счётчик сосисок и стена пожеланий. Без них — in-memory (данные до рестарта) |
| `ADMIN_SECRET` | Ключ для удаления пожеланий: `openssl rand -hex 24` |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL (share-ссылки) |

## Деплой на Vercel

1. Запушьте репозиторий на GitHub и импортируйте в [vercel.com/new](https://vercel.com/new) — настройки по умолчанию подходят.
2. Создайте бесплатную Redis-базу на [console.upstash.com](https://console.upstash.com) → вкладка REST → скопируйте URL и TOKEN.
3. В Vercel → Project → Settings → Environment Variables добавьте все 4 переменные (в `NEXT_PUBLIC_SITE_URL` — прод-домен).
4. Redeploy. Проверьте: ссылка `/s/<id>` в Telegram разворачивается карточкой-сертификатом (@WebpageBot умеет сбрасывать кэш превью).

## Модерация стены

Явная грязь режется автоматически (стоп-словари RU/EN с нормализацией
обходов: leet, латинские двойники, разрядка). Если что-то просочилось:

```bash
# id пожелания смотрим в GET /api/wall
curl -X DELETE "https://ваш-домен/api/admin/wish/<id>" -H "x-admin-key: $ADMIN_SECRET"
```

Сертификат гостя при этом остаётся действительным.

## Как устроено (карта для разработчика)

- **Машина ритуала** — [`src/store/ritualStore.ts`](src/store/ritualStore.ts):
  zustand + persist (гость с закопанной сосиской при повторном визите попадает
  в фазу `returned`). Переходы только через `advance()` с guard'ами.
- **Деформация земли** — [`src/components/scene/Terrain.tsx`](src/components/scene/Terrain.tsx):
  кисть по вершинам PlaneGeometry (cos²-falloff, бортик, трава→земля по
  глубине), прогресс = 80 % идеального объёма ямы.
- **Транзитные данные** (указатель, тряска камеры, церемония) — модульные
  шины в [`interactionBus.ts`](src/components/scene/interactionBus.ts), мимо React.
- **Сертификат** — один дизайн, два рендера:
  клиентский Canvas 2D ([`drawCertificate.ts`](src/lib/certificate/drawCertificate.ts))
  и серверный satori-OG ([`OgCertificate.tsx`](src/lib/certificate/OgCertificate.tsx));
  общие константы в [`spec.ts`](src/lib/certificate/spec.ts).
- **Звук** — [`src/lib/audio`](src/lib/audio): WebAudio-синтез, разблокировка
  первым касанием, mute мгновенно глушит и звук, и вибрацию.
- **Без WebGL** — [`Fallback2D`](src/components/fallback/Fallback2D.tsx):
  ритуал «силой мысли», тот же бэкенд-флоу и сертификат.
- **Шрифты** — браузеру woff2 через fontsource; satori требует TTF
  ([`src/assets/fonts`](src/assets/fonts), скачаны с Google Fonts, OFL).

Журнал реализации и грабли — в [PROGRESS.md](PROGRESS.md), план — в
[PLAN.md](PLAN.md).

## v2: публичная версия

Заложено: `wedding.config.ts` превращается в запись БД, `keys(scope)` уже
параметризован под `/w/[slug]`, тексты собраны в один словарь (i18n).
