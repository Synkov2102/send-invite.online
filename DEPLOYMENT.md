# Деплой

Деплой устроен аналогично `Sobesedovalka`: GitHub Actions собирает два Docker-образа, публикует их в GHCR и по SSH перезапускает Compose-стек на VPS.

## Подготовка VPS

В каталоге `/opt/invite` должны находиться:

- `docker-compose.prod.yml`;
- `.env.backend.production`, созданный из `.env.backend.production.example`;
- `.env.frontend.production`, созданный из `.env.frontend.production.example`.

Если GHCR-пакеты приватные, один раз авторизуйте Docker на VPS:

```bash
docker login ghcr.io
```

Внешний reverse proxy должен направлять `https://send-invite.online` на `127.0.0.1:8090`. Backend доступен только локально на `127.0.0.1:8091`, если к нему нужен прямой доступ с VPS.

## GitHub Secrets

В настройках репозитория добавьте:

- `VPS_SSH_KEY_B64` — приватный SSH-ключ в base64;
- `VPS_SSH_HOST` — адрес VPS;
- `VPS_SSH_USER` — SSH-пользователь;
- `VPS_DEPLOY_PATH` — необязательно, по умолчанию `/opt/invite`.

Workflow запускается для веток `main` и `master`. Сейчас production Compose использует тег `master`; если основной веткой станет `main`, замените тег обоих образов в `docker-compose.prod.yml`.

## Локальная проверка контейнеров

Создайте `backend/.env.local` из `backend/.env.example` и `frontend/.env.local` из `frontend/.env.example`, затем выполните:

```bash
docker compose -f docker-compose.local.yml up --build
```

Frontend будет доступен на `http://localhost:8080`, backend — на `http://localhost:8081`.
