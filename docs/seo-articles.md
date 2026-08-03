# SEO-статьи: архитектура

Раздел `/blog` — источник органического трафика по информационным запросам вокруг свадебных
приглашений, с перелинковкой на `/templates` и редактор.

## Решение в одном абзаце

Исходник статьи — markdown-файл в `content/articles/`, лежит в git. CLI-скрипт парсит его,
валидирует Zod-схемой из `@invite/shared` и кладёт **разобранный на блоки** документ в MongoDB
(коллекция `articles`). Бэкенд отдаёт статьи публичным read-only API, фронтенд рендерит их
серверными компонентами с ISR. Админки нет: публикация — та же схема, что у цен
(`backend/scripts/set-price.mjs`) и промокодов.

```
content/articles/*.md            → node backend/scripts/publish-article.mjs
        (git, исходник)               ↓ Zod-валидация + разбор в блоки
                                  MongoDB: articles
                                      ↓ GET /api/articles, /api/articles/:slug
                                  Next.js RSC + ISR → /blog, /blog/[slug]
```

### Почему так

| Решение                            | Причина                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mongo как рантайм-хранилище        | Правка текста/даты статьи не требует пересборки и деплоя фронта — достаточно прогнать скрипт, ISR подхватит за 5 минут.                                             |
| Markdown в git как исходник        | История правок, ревью, дифф. Mongo — производный снапшот, его можно пересобрать из файлов в любой момент.                                                           |
| Тело статьи — типизированные блоки | Нет `dangerouslySetInnerHTML`, нет markdown-парсера в рантайме и новых зависимостей. Всё, что попало в БД, уже прошло Zod. Спаны ссылок дают контроль перелинковки. |
| API только на чтение               | Не нужны роли/админ-авторизация, которых в проекте нет. Запись — только с VPS через скрипт с доступом к `MONGODB_URI`.                                              |

## Модель данных

`packages/shared/src/schemas/article.schema.ts`, лимиты — `ARTICLE_FIELD_LIMITS` в
`field-limits.ts` (схемы импортируют только его, как и для приглашений).

```ts
Article {
  slug: string                  // латиница-кебаб, уникален, часть URL — не меняется после индексации
  title: string                 // H1
  seoTitle?: string             // <title>, если должен отличаться от H1
  description: string           // meta description
  excerpt: string               // карточка в листинге
  cover?: { src, alt }          // /images/blog/*.webp, он же og:image
  tags: string[]                // тематический кластер
  readingMinutes: number        // считается при публикации
  intro: Block[]                // абзацы до первого ##
  sections: [{ id, heading, blocks: Block[] }]   // id = якорь, из него строится оглавление
  faq: [{ question, answer }]   // отдельно от sections → FAQPage JSON-LD
  related: string[]             // slug'и связанных статей
  status: "draft" | "published"
  publishedAt: string           // ISO, datePublished
  updatedAt: string             // ISO, dateModified и lastModified в sitemap
}

Block =
  | { kind: "paragraph"; spans: Span[] }
  | { kind: "list"; ordered: boolean; items: Span[][] }
  | { kind: "quote"; spans: Span[] }
  | { kind: "image"; src, alt, caption? }
  | { kind: "cta"; label, href, spans: Span[] }

Span = { text: string; bold?: boolean; href?: string }
```

Индексы коллекции `articles`: `{ slug: 1 }` unique, `{ status: 1, publishedAt: -1 }`,
`{ status: 1, tags: 1 }`.

## Формат исходника

`content/articles/<slug>.md`:

```markdown
---
slug: kak-sdelat-sajt-priglashenie
title: Как сделать сайт-приглашение на свадьбу
description: Пошаговый разбор: что написать, какие блоки нужны, как собрать за вечер.
excerpt: Что должно быть на свадебном сайте-приглашении и в каком порядке.
tags: приглашения, подготовка
cover: /images/blog/kak-sdelat.webp
coverAlt: Экран свадебного сайта-приглашения
related: rsvp-na-svadbe
publishedAt: 2026-08-01
status: published
---

Вводный абзац — попадает в `intro`.

## Что написать в приглашении

Текст с **акцентом** и [ссылкой на шаблоны](/templates).

- пункт списка
- ещё пункт

> Цитата.

![Подпись к картинке](/images/blog/example.webp)

:::cta Выбрать шаблон|/templates
Соберите сайт-приглашение и опубликуйте по ссылке.
:::

## FAQ

### Сколько времени занимает сборка?

Обычно вечер: тексты, фотографии и палитра.
```

Правила парсера (`packages/shared/src/article-markdown.ts`):

- `##` открывает секцию, якорь `id` транслитерируется из заголовка; повторяющиеся заголовки получают суффикс (`detali`, `detali-2`), чтобы якоря оставались уникальными;
- секция с заголовком `FAQ` / `Частые вопросы` / `Вопросы и ответы` разбирается особым образом:
  `###` — вопрос, следующий абзац — ответ, и попадает в `faq`, а не в `sections`;
- инлайн поддерживается только `**жирный**` и `[текст](url)` — этого достаточно для перелинковки. Ссылка разбирается раньше жирного, поэтому `[**текст**](/href)` даёт ссылку, а не обломки разметки (жирность внутри ссылки не сохраняется);
- `:::cta Подпись|/href … :::` — врезка с кнопкой; незакрытая врезка — ошибка публикации, а не молчаливая потеря остатка статьи;
- всё остальное — параграфы, списки (`-`, `1.`), цитаты (`>`), картинки (`![alt](src)`).

Подмножество намеренно узкое: любой неподдерживаемый синтаксис не «молча ломается», а
остаётся текстом, а Zod на выходе не пропускает пустые/переросшие поля.

## API (backend)

`backend/src/articles/` — модуль по образцу `sites`: `article.store.ts` + `articles.controller.ts`.

| Метод | Путь                    | Ответ                                                               |
| ----- | ----------------------- | ------------------------------------------------------------------- |
| GET   | `/api/articles`         | `{ articles: ArticleSummary[] }` — только `published`, новые сверху |
| GET   | `/api/articles/:slug`   | `Article` или 404 (черновики скрыты)                                |
| GET   | `/api/articles/sitemap` | `{ entries: [{ slug, updatedAt }] }` — лёгкий список для sitemap    |

Записи в API нет. `ArticleSummary` — без тела (`intro`/`sections`/`faq`), чтобы листинг не тянул
килобайты. Троттлинг — общий глобальный `ThrottlerGuard`.

## Фронтенд

```
frontend/src/lib/articles.ts                    server-only фетчеры, next.revalidate = 300
frontend/src/app/blog/page.tsx                  листинг
frontend/src/app/blog/[slug]/page.tsx           статья, generateMetadata, notFound() на 404
frontend/src/components/article-body/           рендер блоков + оглавление + FAQ (CSS Module)
frontend/src/components/article-card/           карточка в листинге
```

Страницы — серверные компоненты внутри `ProductPageShell` (токены палитры + `SiteHeader`/
`CommerceFooter`, как у `/templates`). Свои стили — colocated CSS Module, монолит
`styles/product.module.css` не растёт.

ISR: `revalidate = 300` на фетчах. Правка статьи через скрипт видна максимум через 5 минут без
редеплоя.

## SEO-разметка

- `createPageMetadata({ type: "article" })` — canonical, OG, Twitter; для статьи `title` = `seoTitle ?? title`, `images` = обложка.
- JSON-LD (новые билдеры в `lib/seo.ts`):
  - `/blog` → `Blog` + `BreadcrumbList`;
  - `/blog/[slug]` → `BlogPosting` (headline, description, image, datePublished, dateModified, author/publisher = Organization, mainEntityOfPage) + `BreadcrumbList` + `FAQPage`, если `faq` не пуст.
- `sitemap.ts` становится асинхронным: статические маршруты + `/blog` + каждая статья с `lastModified = updatedAt`.
- `robots.txt` менять не нужно — `/blog` под общим `Allow: /`.
- Заголовки: один `H1` (title), секции — `H2`, блок FAQ — `H2` + `dl/dt/dd`. Оглавление из `sections[].id` даёт якорные ссылки.
- Перелинковка: ссылка на `/blog` в футере, блок «Читайте также» из `related`, CTA-врезки на `/templates` внутри текста.

## Кластеры контента

Ядро — коммерческие страницы (`/`, `/templates`), вокруг информационные статьи, каждая ведёт на
`/templates`:

| Кластер     | Примеры тем                                                                              |
| ----------- | ---------------------------------------------------------------------------------------- |
| Приглашения | как сделать сайт-приглашение, электронное приглашение vs бумажное, что написать в тексте |
| RSVP        | как собрать ответы гостей, какие вопросы задавать, дедлайн ответов                       |
| Организация | тайминг дня, дресс-код, список гостей                                                    |
| Инструменты | сравнение конструкторов, сколько стоит свадебный сайт                                    |

Один запрос — одна страница; при пересечении интента расширяем существующую статью, а не
создаём вторую (каннибализация). Теги в модели уже есть — страницы-хабы `/blog/tema/[tag]`
имеет смысл добавлять, когда в кластере наберётся 5+ статей.

## Публикация

```bash
node backend/scripts/publish-article.mjs --file=content/articles/kak-sdelat-sajt-priglashenie.md
node backend/scripts/publish-article.mjs --all
node backend/scripts/publish-article.mjs --list
node backend/scripts/publish-article.mjs --unpublish=<slug>
```

Скрипт читает env из `.env.backend.local` / `.env.backend.production` (как `set-price.mjs`),
валидирует документ и делает upsert. Ошибка валидации — ненулевой exit code, БД не трогается.
Картинки статей кладутся в `frontend/public/images/blog/` и едут обычным деплоем.

## Что осознанно не делаем сейчас

- Админку и роли — публикация редкая, скрипт дешевле.
- Страницы тегов, пагинацию, RSS — до накопления объёма.
- Полноценный markdown (таблицы, вложенные списки, HTML) — расширяем подмножество по мере нужды.
- Комментарии, лайки, поиск по блогу.
