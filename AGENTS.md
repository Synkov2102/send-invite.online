# Инструкция для AI-агентов (Cursor, Codex, Claude Code)

Этот файл — **единый источник правил** для написания кода в репозитории. Перед изменениями прочитайте релевантный раздел.

## О проекте

**send-invite.online** — конструктор сайтов-приглашений с оплатой через Robokassa.

| Часть     | Стек                             | Путь               |
| --------- | -------------------------------- | ------------------ |
| Frontend  | Next.js 16, React 19, App Router | `frontend/`        |
| Backend   | NestJS 11, MongoDB, S3           | `backend/`         |
| Общий код | TypeScript, Zod                  | `packages/shared/` |

Монорепозиторий на npm workspaces. Сборка из корня: `npm run build`.

## Золотые правила

1. **Минимальный diff** — меняйте только то, что нужно для задачи. Не рефакторите «заодно».
2. **Следуйте существующим паттернам** — сначала прочитайте соседний код, затем пишите в том же стиле.
3. **Не переусложняйте** — без лишних абстракций, хелперов на одну строку и «на всякий случай» error handling.
4. **Не коммитьте** без явной просьбы пользователя. Не пушьте без просьбы.
5. **Не коммитьте секреты** — `.env.*` (кроме `*.example`) в git не попадают.
6. **Проверяйте сборку** — после нетривиальных изменений: `npm run build` или хотя бы `npm run build --workspace @invite/shared` + затронутый workspace.
7. **Комментарии** — только для неочевидной бизнес-логики, не для банальностей.
8. **Тесты** — для backend см. раздел «Тесты backend». Платежи/промо без тестов не оставляйте; остальное — по запросу или если ловят регрессию.

## Окружение

Env-файлы лежат **в корне репозитория** (не в `backend/` / `frontend/`):

| Файл                       | Назначение         |
| -------------------------- | ------------------ |
| `.env.backend.local`       | локальный backend  |
| `.env.frontend.local`      | локальный frontend |
| `.env.backend.production`  | VPS backend        |
| `.env.frontend.production` | VPS frontend       |

Шаблоны: `*.example` рядом с docker-compose. Docker local: frontend **8080**, backend **8081**. Подробности — `DEPLOYMENT.md`, `README.md`.

## Frontend (`frontend/`)

### Next.js — важно

**Это не классический Next.js из обучающих данных.** Версия 16 с breaking changes.

Перед правками App Router, Route Handlers, `proxy.ts`, `searchParams`, `cookies()` — читайте актуальную документацию в:

```
frontend/node_modules/next/dist/docs/
```

Не полагайтесь на устаревшие паттерны (Pages Router, старый middleware API и т.п.).

### Архитектура

- **App Router**: страницы в `src/app/`, API routes в `src/app/api/`.
- **Прокси на backend**: `next.config.ts` rewrites `/api/*` → NestJS. Nest принимает и `Authorization: Bearer`, и cookie `invite_session` (`getSessionToken`) — браузерный `fetch("/api/...")` через rewrite авторизуется без отдельного Route Handler. Явные handlers всё ещё полезны для своих 401/прокси-логики (checkout, OAuth).
- **Серверный код**: `import "server-only"` в `lib/auth.ts`, `lib/payments.ts` и т.п.
- **Клиент**: `"use client"` только где нужны хуки/события.
- **Импорт shared**: `@invite/shared` или тонкие re-export в `@/lib/invite-*-types.ts`. Не используйте `export *` из CJS `dist/` — Next transpile из `src` через `transpilePackages`.

### Редактор

Крупная логика вынесена из одного файла. UI — **папка на компонент** (tsx + css рядом):

```
frontend/src/editor/
  invitation-builder/
    invitation-builder.tsx
    invitation-builder.module.css
    index.ts
  use-invitation-builder.ts
  editor-context.tsx
  steps/
    media-step/
      media-step.tsx
      media-step.module.css
      index.ts
  components/
    music-library/
      music-library.tsx
      music-library.module.css
      index.ts
    index.ts                 # barrel re-export
```

Новые шаги/поля — в эту структуру, не раздувайте один файл и не кладите «плоские» `foo.tsx` + `foo.module.css` рядом в `components/` / `steps/`.

### Стили

- **Продуктовый UI** (лендинг, dashboard, редактор-chrome): чёрно-бело-розовая палитра через токены `--product-ink`, `--product-muted`, `--product-line`, `--product-paper`, `--product-soft`, `--product-accent` (`#ff4f72`), `--product-accent-soft`. Не вводите sage/olive/зелёные акценты в chrome.
- **Редактор и новые UI-компоненты**: только **CSS Modules**, colocated в папке компонента. Классы через `styles.*`, без BEM-строк вида `editor-foo__bar` в JSX (кроме редких global hooks для invite-preview overrides).
- Общий CSS без своего tsx (toggle, step-panel, text-field) — отдельная папка `components/<name>/<name>.module.css`, импорт из потребителей.
- Shell редактора подключает `product.module.css` `.scope` (токены + brand-lockup). Компактный логотип в topbar — класс `editor-brand` + стили в sidebar-header.
- Не восстанавливайте монолиты `styles/editor-studio.module.css` / `editor-responsive` / `editor-workflow` и не складывайте стили редактора обратно в `frontend/src/styles/`.
- Шаблоны приглашений (`invitation-templates/`, `invite-*`) живут отдельно; их стили не смешивать с editor chrome.
- Глобальные/продуктовые листы: `globals.css`, `product-theme.css`, `styles/product.module.css`, `page.module.css`.
- Иконки: `lucide-react`. UI-kit: HeroUI (`@heroui/react`).

### Платежи (frontend)

- Checkout: `POST /api/payments/checkout` → форма Robokassa.
- Success/fail: `payment-status.tsx` опрашивает **публичный** `/api/payments/orders/:id/status`.
- Result URL: `src/app/api/payments/robokassa/result/route.ts` проксирует на backend.
- В Route Handlers для cookie сессии используйте `request.cookies`, не только `cookies()` из `next/headers`.

## Backend (`backend/`)

### NestJS

- Глобальный префикс: `/api` (`main.ts`).
- Модули: `auth`, `sites`, `payments`, `database`, `storage`.
- Ошибки API для пользователя: `{ error: "Текст на русском." }` через Nest exceptions.
- Webhook Robokassa: `@SkipThrottle()`, ответ `text/plain`, фильтр `RobokassaExceptionFilter`.

### Данные

- MongoDB через `MongoDbService`, stores (`*.store.ts`) — доступ к коллекциям.
- Медиа в S3, в Mongo только `s3://` ссылки.
- Публикация сайта только после оплаты: `publishAfterPayment`, `isPaid` / `isPublished`.

### Платежи (backend)

- Конфиг: `ROBOKASSA_*` в `.env.backend.*`, `ROBOKASSA_TEST_MODE=true` для тестов.
- Result URL — Password2, Success redirect — Password1.
- `completePayment` публикует сайт **только** если заказ реально `paid` (после `markPaidIfPending` или уже paid); cancelled mid-flight — отказ, без publish.
- Повторный checkout с тем же promo-snapshot переиспользует pending; иначе cancel + release reserve + новый заказ.
- Промо: резерв слота на checkout (`usedCount` + `promo_user_usage`), confirm после оплаты, TTL pending 60 мин.

Подробности настройки — `DEPLOYMENT.md`.

## Тесты backend

Стек: **Jest 29** + **ts-jest** + **`@nestjs/testing`**. Файлы: `backend/src/**/*.spec.ts` (colocated).

### Команды

```bash
npm run test:backend              # из корня
npm test --workspace invite-backend
npm run test:watch --workspace invite-backend
```

### Husky

`pre-commit` → `lint-staged`. Если в коммите есть `backend/**/*.{ts,js,cjs,mjs}`, дополнительно запускается `npm run test:backend`. Падение suite блокирует коммит.

### Практика для AI / разработчиков

1. **Unit-first** — тестируйте сервисы и чистые функции; Mongo stores / S3 / Robokassa HTTP мокайте.
2. Модуль: `Test.createTestingModule({ providers: [Service, { provide: Dep, useValue: mock }] }).compile()`.
3. Не зовите `module.init()` без нужды (`PaymentsService` поднимает interval на `OnModuleInit`).
4. Платежные тесты: в `beforeEach` задайте `ROBOKASSA_TEST_MODE=true`, `ROBOKASSA_TEST_PASSWORD1/2`, `ROBOKASSA_MERCHANT_LOGIN`; в `afterEach` восстановите env.
5. Покрывайте критичные флоу: checkout (цена / promo / free / смена snapshot), Result URL (paid / cancel race / mismatch / bad sign), reserve/release/TTL, per-user store, public status без `promoCode`, подпись Robokassa. Store-моки — `payments/test/mongo-collection.mock.ts`.
6. Стиль: Arrange–Act–Assert, фабрики `makeOrder`/`makePromo` в spec, без `.only` в коммите.
7. E2E (supertest + реальная Mongo) — только по явной просьбе.

Краткое правило Cursor: `.cursor/rules/backend-testing.mdc`.

## Shared (`packages/shared/`)

### Валидация — только Zod

Runtime-валидация **только через Zod** в `packages/shared/src/schemas/`:

| Схема                       | Назначение                                                            |
| --------------------------- | --------------------------------------------------------------------- |
| `invite-state.schema.ts`    | `inviteStateShapeSchema` (структура) / `inviteStateSchema` (+ лимиты) |
| `invite-palette.schema.ts`  | палитра                                                               |
| `invite-site.schema.ts`     | payload сайта                                                         |
| `invite-template.schema.ts` | шаблон                                                                |
| `invite-validators.ts`      | `parseCreateInviteSitePayload`, type guards                           |

Типы экспортируются через `z.infer`. **Не добавляйте** ручные `isRecord` / длинные `typeof`-цепочки.

Лимиты полей: `field-limits.ts` → `INVITE_FIELD_LIMITS`. Схемы импортируют **только** `field-limits.ts`, не `invite-field-limits.ts` (избегайте циклических импортов).

Публичный API для backend/frontend:

- `parseCreateInviteSitePayload`
- `isInviteState`, `isPublishedInviteSite`, `isInviteTemplate`
- типы `InviteState`, `CreateInviteSitePayload`, …

После изменений в shared: `npm run build --workspace @invite/shared`.

### Шаблоны

Каталог шаблонов: `invite-template-catalog.ts`. Новый шаблон на существующем движке — запись в `inviteTemplateCatalog` + скриншот в `frontend/public/images/templates/`. Новый движок — папка `frontend/src/invitation-templates/<kind>/` + `registry.ts`.

У каждого шаблона — **уникальный** демо-трек в `templateMusicTrackIds` (`frontend/src/editor/music-tracks.ts`). Новые треки заливать в S3: `node frontend/scripts/mirror-catalog-music-to-s3.mjs` (VPN до Pixabay), URL вида `/api/catalog-music/{id}`.

## Безопасность

- Сессия: httpOnly cookie `invite_session` на frontend; backend принимает Bearer **или** эту cookie (`getSessionToken`). Server Components / BFF обычно шлют Bearer.
- Не ослабляйте проверку подписи Robokassa.
- Публичный status заказа — только по UUID (capability URL), без лишних PII.
- Не логируйте пароли и полные payment payload с секретами.

## Типичные команды

```bash
npm install
npm run dev:frontend      # :3000
npm run dev:backend       # :3001, предварительно собирает shared
npm run build
npm run lint
npm run test:backend
docker compose -f docker-compose.local.yml up --build   # :8080 / :8081
```

## Чего не делать

- Не возвращайте env-файлы в `backend/` или `frontend/` как основной путь.
- Не создавайте markdown-доки без запроса (`README`/`DEPLOYMENT` обновляйте только если меняется деплой/онбординг по задаче).
- Не добавляйте зависимости без необходимости.
- Не ломайте идемпотентность payment webhooks.
- Не используйте training data по Next.js вместо локальной документации.

## Связанные файлы

| Файл                                | Содержание                                          |
| ----------------------------------- | --------------------------------------------------- |
| `README.md`                         | запуск, env                                         |
| `DEPLOYMENT.md`                     | VPS, Robokassa, Docker prod                         |
| `.cursor/rules/*.mdc`               | краткие правила для Cursor по областям              |
| `.cursor/rules/frontend-styles.mdc` | colocated CSS Modules, палитра, структура editor UI |
| `.cursor/rules/backend-testing.mdc` | Jest/Nest unit-тесты, husky, паттерны               |
| `backend/jest.config.cjs`           | конфиг Jest                                         |
