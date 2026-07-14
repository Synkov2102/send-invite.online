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
- `VPS_DEPLOY_PATH` — необязательно, production-каталог, по умолчанию `/opt/invite`;
- `VPS_STAGE_DEPLOY_PATH` — необязательно, stage-каталог, по умолчанию `/opt/invite-dev`.

Workflow запускается для веток `main`, `master` и `dev`. Production Compose использует образы репозитория
`send-invite.online` с тегом `main`, а stage Compose — с тегом `dev`.

## Stage (`dev.send-invite.online`)

Push в ветку `dev` разворачивает отдельный Compose-стек из `docker-compose.stage.yml` в `/opt/invite-dev`.
Путь можно изменить GitHub Secret `VPS_STAGE_DEPLOY_PATH`. Stage использует отдельные порты `8092` (frontend)
и `8093` (backend), базу MongoDB `invite-dev` и принудительно включает тестовый режим Robokassa.

Перед первым деплоем создайте на VPS каталог `/opt/invite-dev` и положите в него отдельные файлы
`.env.backend.production` и `.env.frontend.production`. Их можно создать из production example-файлов;
доменные переменные Compose переопределяет значениями для `https://dev.send-invite.online`.

Добавьте DNS-запись `A` для `dev.send-invite.online`, указывающую на IP VPS. Во внешнем reverse proxy
направьте этот домен на `http://127.0.0.1:8092` и выпустите для него TLS-сертификат. Например, для nginx:

```nginx
server {
    listen 80;
    server_name dev.send-invite.online;

    location / {
        proxy_pass http://127.0.0.1:8092;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Также добавьте `https://dev.send-invite.online/api/auth/yandex/callback` в список разрешённых callback URL
приложения Yandex ID. Для проверки платежей stage использует ResultURL
`https://dev.send-invite.online/api/payments/robokassa/result`.

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

### Диагностика, если оплата «зависла» в pending

1. Проверьте, что ResultURL в кабинете Robokassa совпадает с production URL и метод **POST**.
2. Убедитесь, что `ROBOKASSA_TEST_MODE` и тестовые/боевые пароли соответствуют режиму оплаты.
3. `FRONTEND_ORIGIN` в `.env.backend.production` должен быть `https://send-invite.online` — от него строятся Success/Fail URL.
4. После оплаты Success URL может подтвердить платёж сразу (параметры `OutSum`, `InvId`, `SignatureValue` в адресной строке). Result URL остаётся основным серверным каналом.
5. На VPS смотрите логи backend: `docker compose -f docker-compose.prod.yml logs -f backend` — ищите `Payment completed` или `Invalid Result URL signature`.

Для локального Docker используйте `FRONTEND_ORIGIN=http://localhost:8080` и ResultURL `http://localhost:8080/api/payments/robokassa/result` (нужен туннель вроде ngrok, если Robokassa должна достучаться снаружи).
