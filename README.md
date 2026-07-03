# Invite

Монорепозиторий с двумя приложениями:

- `frontend` - Next.js UI, редактор и опубликованные страницы приглашений.
- `backend` - NestJS API, MongoDB store и S3-compatible object storage.

## Запуск

Установить зависимости из корня:

```bash
npm install
```

Запустить приложения в двух терминалах:

```bash
npm run dev:backend
npm run dev:frontend
```

По умолчанию frontend работает на [http://localhost:3000](http://localhost:3000), backend API - на [http://localhost:3001/api](http://localhost:3001/api).

## Переменные окружения

Все env-файлы лежат в корне репозитория рядом с `docker-compose.*.yml`:

| Файл | Назначение |
|------|------------|
| `.env.backend.local` | локальная разработка backend |
| `.env.frontend.local` | локальная разработка frontend |
| `.env.backend.production` | VPS, backend |
| `.env.frontend.production` | VPS, frontend |

Создайте локальные файлы из example-шаблонов:

```bash
cp .env.backend.local.example .env.backend.local
cp .env.frontend.local.example .env.frontend.local
```

**`.env.backend.local`:**

```bash
FRONTEND_ORIGIN=http://localhost:3000
JSON_BODY_LIMIT=30mb

MONGODB_URI=

YANDEX_CLIENT_ID=
YANDEX_CLIENT_SECRET=

ROBOKASSA_MERCHANT_LOGIN=
ROBOKASSA_TEST_MODE=true
ROBOKASSA_HASH_ALGORITHM=md5
ROBOKASSA_TEST_PASSWORD1=
ROBOKASSA_TEST_PASSWORD2=
ROBOKASSA_PASSWORD1=
ROBOKASSA_PASSWORD2=

S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

**`.env.frontend.local`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001

YANDEX_CLIENT_ID=
YANDEX_REDIRECT_URI=http://localhost:3000/api/auth/yandex/callback
```

Для входа через Yandex ID значения `YANDEX_CLIENT_ID` во frontend и backend должны совпадать, а `YANDEX_CLIENT_SECRET` обязателен только для backend.

На VPS используйте `.env.backend.production` и `.env.frontend.production` из соответствующих `.example` файлов.

## Хранилище файлов

Загруженные музыка и фото отправляются в S3-compatible bucket при публикации. В MongoDB сохраняются только `s3://...` ссылки, а гостям файлы отдаются через Nest endpoints:

- `GET /api/sites/:id/music`
- `GET /api/sites/:id/images/:slot`

Под Yandex Object Storage достаточно приватного bucket с сервисным аккаунтом, которому выданы права на чтение и запись.

## Скрипты

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
```
