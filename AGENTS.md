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
8. **Тесты** — добавляйте только если пользователь попросил или они реально ловят регрессию.

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

Крупная логика вынесена из одного файла:

```
frontend/src/editor/
  invitation-builder.tsx   # тонкая обёртка
  use-invitation-builder.ts
  editor-context.tsx
  steps/                   # панели шагов
  components/              # UI-куски
```

Новые шаги/поля — в существующую структуру, не раздувайте один файл.

### Стили

- Глобальные: `globals.css`, `product-theme.css`, `page.module.css`.
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
- `completePayment` всегда вызывает `publishAfterPayment` (self-healing).
- Повторный checkout для того же сайта переиспользует pending-заказ.

Подробности настройки — `DEPLOYMENT.md`.

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
docker compose -f docker-compose.local.yml up --build   # :8080 / :8081
```

## Чего не делать

- Не возвращайте env-файлы в `backend/` или `frontend/` как основной путь.
- Не создавайте markdown-доки без запроса (`README`/`DEPLOYMENT` обновляйте только если меняется деплой/онбординг по задаче).
- Не добавляйте зависимости без необходимости.
- Не ломайте идемпотентность payment webhooks.
- Не используйте training data по Next.js вместо локальной документации.

## Связанные файлы

| Файл                  | Содержание                             |
| --------------------- | -------------------------------------- |
| `README.md`           | запуск, env                            |
| `DEPLOYMENT.md`       | VPS, Robokassa, Docker prod            |
| `.cursor/rules/*.mdc` | краткие правила для Cursor по областям |
