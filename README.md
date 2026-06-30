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

Backend читает `backend/.env.local`. Создайте его из `backend/.env.example` и заполните:

```bash
PORT=3001
CORS_ORIGIN=http://localhost:3000
JSON_BODY_LIMIT=30mb

MONGODB_URI=
MONGODB_DB=invite

S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_FORCE_PATH_STYLE=false
```

Frontend читает `frontend/.env.local`, создаваемый из `frontend/.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001
```

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
