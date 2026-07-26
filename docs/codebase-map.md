# Карта кодовой базы (навигационная, не правила)

> Правила и конвенции — в `AGENTS.md` (единый источник, авто-загружается через `CLAUDE.md`). Этот файл — только карта директорий/файлов, чтобы не тратить контекст на повторный `find`/`glob` в начале сессии. Структура могла измениться — при сомнении сверяйтесь с `find <dir> -type f`.

Обновлено: 2026-07-26.

## Монорепо (npm workspaces)

```
frontend/          Next.js 16 / React 19 — App Router
backend/            NestJS 11 API
packages/shared/    @invite/shared — Zod-схемы, типы, каталог шаблонов
docs/               invite-template-ai-prompt.md + этот файл
.cursor/rules/*.mdc  краткие правила по областям (дублируют разделы AGENTS.md)
```

Корневые скрипты (package.json): `dev:frontend` (:3000), `dev:backend` (:3001, билдит shared), `build`, `lint`, `test:backend`.

## backend/src (NestJS, prefix `/api`)

| Модуль                     | Файлы                                                                                                                                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.module.ts`, `main.ts` | сборка приложения, CORS, `ThrottlerGuard`, `RequestLoggerMiddleware`                                                                                                                                                                                                                                                                  |
| `auth/`                    | `auth.controller/service/store.ts`, `yandex-id.service.ts` (OAuth), `bearer-token.ts`, `auth.types.ts`                                                                                                                                                                                                                                |
| `sites/`                   | `sites.controller/service.ts`, `invite-site.store.ts`, `invite-template.store.ts`, `invite-response.store.ts`, `catalog-music.controller.ts`, медиа: `media-url.ts`, `media-utils.ts`, `send-served-media.ts`, `site-image-slots.ts`, `sites-media.ts`, `excel-sanitize.ts`, `rsvp-response.parser.ts`                                |
| `payments/`                | `payments.controller/service.ts`, `payment-order.store.ts`, `promo.service.ts` + `promo-code.store.ts` + `promo-user-usage.store.ts` + `promo-code-event.store.ts`, `robokassa-signature.ts`, `robokassa-payload.ts`, `robokassa-exception.filter.ts`. Тесты colocated (`*.spec.ts`), моки в `payments/test/mongo-collection.mock.ts` |
| `database/`                | `mongodb.service.ts`, `database.module.ts`, `lazy-once.ts`                                                                                                                                                                                                                                                                            |
| `storage/`                 | `s3-storage.service.ts`                                                                                                                                                                                                                                                                                                               |
| `logging/`, `logs/`        | `request-logger.middleware.ts`, `log.store.ts`                                                                                                                                                                                                                                                                                        |

## frontend/src

### `app/` (роуты Next.js App Router)

- `page.tsx` — лендинг; `layout.tsx`, `globals.css`, `manifest.ts`, `sitemap.ts`, `robots.txt`, `not-found.tsx`
- `editor/` — редактор приглашений (UI в `src/editor/`)
- `dashboard/`, `dashboard/actions/sites/[id]/{route.ts,visibility/route.ts}` — кабинет пользователя, Route Handlers
- `downloads/sites/[id]/responses` — экспорт откликов гостей
- `invite/sites/[id]` — опубликованная страница приглашения (публичная)
- `templates/`, `templates/capture/[id]` — каталог шаблонов + захват выбора
- `auth/`, `contacts/`, `offer/`, `payment/{success,fail}/`, `payment-and-refund/`, `privacy/` — статика/сервисные страницы
- `api/` — Route Handlers: `auth/{logout,me,yandex/{start,callback}}`, `payments/{checkout,orders/[id]/status,robokassa/result}`, `sites/[id]/responses/export`

### `lib/` — серверный код и утилиты (много с `import "server-only"`)

`auth.ts`, `payments.ts`, `backend-api.ts` (fetch к Nest), `server-api-base-url.ts`, `request-origin.ts`, `commerce.ts`, `invite-state.ts`, `invite-site-types.ts`, `invite-templates.ts`, `invite-template-contract.ts`, `invite-theme.ts`, `invite-palette-catalog.ts`, `template-palettes.ts`, `invite-date.ts`, `invite-map.ts`, `seo.ts`, `brand.ts`, `home-value-props.ts`, `yandex-oauth.ts`; `lib/api/{payments,sites}.ts` — клиентские обёртки над `/api/*`.

### `editor/` — конструктор приглашений

Топ-уровень: `editor-context.tsx`, `use-invitation-builder.ts`, `editor-draft.ts`, `types.ts`, `validation.ts`, `constants.ts`, `music-tracks.ts`, `template-presets.ts`, `use-compact-editor-viewport.ts`.

- `invitation-builder/` — корневой компонент шелла редактора
- `steps/` — по папке на шаг: `content-step/`, `design-step/`, `guests-step/`, `media-step/`, `publish-step/`, `schedule-step/` (каждая: `*.tsx` + `*.module.css` + `index.ts`)
- `components/` — переиспользуемые части редактора, тоже папка-на-компонент: `color-field/`, `color-picker/`, `editor-sidebar/`, `editor-sidebar-header/`, `editor-preview-panel/`, `editor-step-panel/`, `editor-step-actions/`, `editor-toggle/`, `editor-loading/`, `editor-invite-overrides/`, `field-group/`, `fullscreen-preview/`, `mobile-preview-frame/`, `music-library/`, `payment-summary/`, `text-field/`, `text-area-field/`, `text-input/`

Конвенция: новые шаги/поля — в эту структуру папка-на-компонент, не плоские файлы. Стили — только CSS Modules, colocated.

### `invitation-templates/` — движки шаблонов приглашений (публичный рендер)

Папка на "kind": `alpine/`, `aqua/`, `chrome/`, `clarity/`, `crimson/`, `editorial/`, `electric/`, `minimal/`, `silk/` — каждая обычно `index.ts` + `template.tsx` + доп. сцены/анимации (напр. `alpine/wedding-rings-scene.tsx`, `motion.ts`). Общее — `components/` (напр. `invite-intro/envelope/`).

Каталог шаблонов (метаданные, привязка kind → пресеты) — `packages/shared/src/invite-template-catalog.ts`. Новый шаблон на существующем движке = запись в каталоге + скриншот в `frontend/public/images/templates/`. Новый движок = новая папка здесь + `registry.ts`.

### `components/`, `styles/`

`components/template-card/` — карточка шаблона в каталоге. `styles/` — глобальные продуктовые листы (`product.module.css`, `page.module.css` и т.п.), НЕ для стилей редактора.

## packages/shared/src (@invite/shared)

```
index.ts                        публичный barrel-export
invite-state.ts                 InviteState + логика
invite-site-types.ts            типы сайта/payload
invite-templates.ts             хелперы шаблонов
invite-template-catalog.ts      каталог шаблонов (kind → presets, музыка)
invite-field-limits.ts          реэкспорт field-limits (не путать с ↓)
field-limits.ts                 INVITE_FIELD_LIMITS (источник правды по лимитам)
commerce.ts, promo.ts           коммерция/промокоды
template-kind.ts                enum/union видов шаблонов
schemas/
  invite-state.schema.ts        inviteStateShapeSchema / inviteStateSchema (Zod)
  invite-site.schema.ts         payload сайта
  invite-palette.schema.ts      палитра
  invite-template.schema.ts     шаблон
  invite-validators.ts          parseCreateInviteSitePayload, type guards
  checkout.schema.ts            checkoutBodySchema, promoPreviewBodySchema
  zod-helpers.ts
```

Правило: схемы импортируют только `field-limits.ts` (не `invite-field-limits.ts` — иначе циклический импорт). Runtime-валидация — только Zod, без ручных `isRecord`/`typeof`-цепочек. После правок: `npm run build --workspace @invite/shared`.

## Точки входа при типовых задачах

| Задача                         | Начать с                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Новый шаг/поле в редакторе     | `frontend/src/editor/steps/`, `editor/types.ts`, `editor/validation.ts`, схема в `packages/shared/src/schemas/invite-state.schema.ts` |
| Новый шаблон приглашения       | `frontend/src/invitation-templates/<kind>/`, `packages/shared/src/invite-template-catalog.ts`                                         |
| Платежи/Robokassa              | `backend/src/payments/*`, `frontend/src/app/api/payments/*`, `frontend/src/lib/payments.ts`                                           |
| Промокоды                      | `backend/src/payments/promo*.ts`, `packages/shared/src/promo.ts`                                                                      |
| Auth (Yandex OAuth)            | `backend/src/auth/*`, `frontend/src/app/api/auth/*`, `frontend/src/lib/auth.ts`                                                       |
| Медиа (S3/фото/музыка)         | `backend/src/storage/s3-storage.service.ts`, `backend/src/sites/*media*`, `frontend/src/editor/music-tracks.ts`                       |
| Публичная страница приглашения | `frontend/src/app/invite/sites/[id]`, `invitation-templates/`                                                                         |
| Экспорт откликов гостей        | `frontend/src/app/downloads/sites/[id]/responses`, `backend/src/sites/rsvp-response.parser.ts`, `excel-sanitize.ts`                   |

## Прочая документация

- `AGENTS.md` — правила кода, стиль, платежи, тесты backend (главный файл, читается автоматически)
- `README.md` — запуск, env
- `DEPLOYMENT.md` — VPS/Docker/Robokassa деплой
- `docs/invite-template-ai-prompt.md` — промпт для генерации новых шаблонов
- `.cursor/rules/*.mdc` — те же правила, короче, для Cursor
