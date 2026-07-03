# Деплой

Деплой устроен аналогично `Sobesedovalka`: GitHub Actions собирает два Docker-образа, публикует их в GHCR и по SSH перезапускает Compose-стек на VPS.

## Подготовка VPS

В каталоге `/opt/invite` должны находиться:

- `docker-compose.prod.yml`;
- `.env.backend.production`, созданный из `.env.backend.production.example`;
- `.env.frontend.production`, созданный из `.env.frontend.production.example`.

Локально env-файлы тоже лежат в корне репозитория: `.env.backend.local` и
`.env.frontend.local`, созданные из `.env.backend.local.example` и
`.env.frontend.local.example`.

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

Workflow запускается для веток `main` и `master`. Production Compose использует образы репозитория `send-invite.online` с тегом `main`.

## Локальная проверка контейнеров

Создайте `.env.backend.local` и `.env.frontend.local` из example-шаблонов в корне репозитория, затем выполните:

```bash
docker compose -f docker-compose.local.yml up --build
```

Frontend будет доступен на `http://localhost:8080`, backend — на `http://localhost:8081`.

## Настройка Robokassa

В личном кабинете Robokassa:

- подключите сервис **Робочеки СМЗ** и разрешите интеграцию в приложении «Мой налог»;
- укажите ResultURL, метод POST и алгоритм подписи, совпадающий с `ROBOKASSA_HASH_ALGORITHM`.

В `.env.backend.production` заполните:

- `ROBOKASSA_MERCHANT_LOGIN`;
- `ROBOKASSA_PASSWORD1` и `ROBOKASSA_PASSWORD2`;
- `ROBOKASSA_TEST_PASSWORD1` и `ROBOKASSA_TEST_PASSWORD2`;
- `ROBOKASSA_HASH_ALGORITHM` — алгоритм из технических настроек магазина;
- `ROBOKASSA_TEST_MODE=true` для тестовых платежей или `false` для боевого режима.

В технических настройках магазина Robokassa укажите:

- ResultURL: `https://send-invite.online/api/payments/robokassa/result`;
- метод ResultURL: `POST`;
- алгоритм подписи, совпадающий с `ROBOKASSA_HASH_ALGORITHM`.

SuccessURL и FailURL передаются сайтом для каждого заказа. Перед включением боевого
режима выполните тестовую оплату, убедитесь, что ResultURL отвечает `OK<InvId>`,
сайт появляется в личном кабинете и публичная ссылка открывается только после оплаты.
