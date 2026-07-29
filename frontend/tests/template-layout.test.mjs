/**
 * Проверка раскладки шаблонов на экстремальных данных.
 *
 * Стресс-данные приходят из `?fixture=` (frontend/src/app/templates/capture/[id]/fixtures.ts),
 * страница рендерится без рамки телефона, замеры делает Playwright.
 *
 *   npm run test:templates                       # chapter-ticket на запущенном сервере
 *   TEMPLATE_TEST_IDS=all npm run test:templates # все шаблоны каталога
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const { inviteTemplateCatalog } = require("@invite/shared");
const frontendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const fallbackPort = process.env.TEMPLATE_TEST_PORT ?? "3997";
const requestedIds = process.env.TEMPLATE_TEST_IDS ?? "chapter-ticket";
const editorReady = inviteTemplateCatalog.filter((template) => template.editorReady);
const templates =
  requestedIds === "all"
    ? editorReady
    : requestedIds
        .split(",")
        .map((id) => id.trim())
        .map((id) => {
          const template = editorReady.find((item) => item.id === id);

          if (!template) {
            throw new Error(`Неизвестный шаблон: ${id}`);
          }

          return template;
        });

const fixtures = [
  { name: "minimal", title: "минимум данных, опциональные блоки выключены" },
  { name: "overflow", title: "длинные слова без переносов" },
  { name: "limits", title: "верхняя граница схемы" },
];

const viewports = [
  { height: 720, name: "narrow 320", width: 320 },
  { height: 844, name: "mobile 390", width: 390 },
  { height: 1024, name: "tablet 768", width: 768 },
  { height: 900, name: "desktop 1280", width: 1280 },
];

let baseUrl = "";
let browser;
let server;

async function isReachable(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });

    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, attempts = 90) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await isReachable(url)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/** Собирает нарушения раскладки внутри отрисованного шаблона. */
const collectLayoutProblems = () => {
  const root = document.querySelector("[data-template-capture]");

  if (!root) {
    return { fatal: "Шаблон не отрисован" };
  }

  // Границы считаем по карточке приглашения, а не по окну: разъезд внутри окна тоже дефект.
  const card = root.querySelector("article") ?? root.firstElementChild ?? root;
  const cardRect = card.getBoundingClientRect();
  const escaping = [];
  const clipped = [];
  const brokenImages = [];

  const describeNode = (node) => {
    const className =
      typeof node.className === "string" && node.className
        ? `.${node.className.trim().split(/\s+/).slice(0, 2).join(".")}`
        : "";
    const text = (node.textContent ?? "").trim().slice(0, 40);

    return `${node.tagName.toLowerCase()}${className}${text ? ` «${text}…»` : ""}`;
  };

  // Элемент внутри overflow:hidden обрезан осознанно — такие поддеревья пропускаем.
  const isInsideClippingBox = (node) => {
    let parent = node.parentElement;

    while (parent && parent !== root && parent !== card.parentElement) {
      if (getComputedStyle(parent).overflowX !== "visible") {
        return true;
      }

      parent = parent.parentElement;
    }

    return false;
  };

  for (const node of card.querySelectorAll("*")) {
    const style = getComputedStyle(node);

    if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") {
      continue;
    }

    const rect = node.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      continue;
    }

    if (
      (rect.right > cardRect.right + 1 || rect.left < cardRect.left - 1) &&
      !isInsideClippingBox(node)
    ) {
      escaping.push(describeNode(node));
    }

    const isLeafText =
      node.children.length === 0 && (node.textContent ?? "").trim().length > 0;
    const wraps = !["nowrap", "pre"].includes(style.whiteSpace);

    if (isLeafText && wraps && node.scrollWidth > node.clientWidth + 1) {
      clipped.push(describeNode(node));
    }

    if (node.tagName === "IMG" && (!node.complete || node.naturalWidth === 0)) {
      brokenImages.push(node.getAttribute("src") ?? "(без src)");
    }
  }

  return {
    brokenImages,
    clipped,
    documentOverflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    escaping,
    forms: root.querySelectorAll("form").length,
    text: (root.textContent ?? "").replace(/\s+/g, " ").trim(),
  };
};

const normalize = (value) => value.replace(/\s+/g, " ").trim();

/** Данные, которые пользователь ввёл, но шаблон не вывел. */
function findMissingContent(invite, renderedText) {
  const haystack = normalize(renderedText);
  const probe = (value) => normalize(String(value ?? "")).slice(0, 40);
  const expected = [
    ["имя невесты", invite.bride],
    ["имя жениха", invite.groom],
    ["площадку", invite.venue],
    ["адрес", invite.address],
    ["приветствие", invite.lead],
    ["дресс-код", invite.dressCode],
  ];

  if (invite.showAdditionalInfo) {
    expected.push(["доп. информацию", invite.additionalInfo]);
  }

  if (invite.showGroupChat) {
    expected.push(["текст чата", invite.groupChatText]);
  }

  if (invite.showRsvp) {
    expected.push(["текст RSVP", invite.rsvpText]);

    for (const [index, question] of invite.rsvpQuestions.entries()) {
      expected.push([`вопрос RSVP №${index + 1}`, question.title]);
      expected.push([`вариант ответа ${index + 1}.1`, question.options[0]]);
    }
  }

  for (const [index, item] of invite.schedule.entries()) {
    expected.push([`пункт программы №${index + 1}`, item.title]);
    expected.push([`время пункта №${index + 1}`, item.time]);
  }

  return expected
    .filter(([, value]) => probe(value).length > 0)
    .filter(([, value]) => !haystack.includes(probe(value)))
    .map(([label]) => label);
}

before(async () => {
  const candidate = (process.env.TEMPLATE_TEST_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (await isReachable(candidate)) {
    baseUrl = candidate;
  } else {
    if (!existsSync(path.join(frontendDir, ".next/BUILD_ID"))) {
      throw new Error(
        `На ${candidate} никто не отвечает, а сборки нет. Запустите "npm run dev:frontend" или "npm run build --workspace frontend".`,
      );
    }

    baseUrl = `http://localhost:${fallbackPort}`;
    server = spawn(
      process.execPath,
      [require.resolve("next/dist/bin/next"), "start", "-p", fallbackPort],
      { cwd: frontendDir, stdio: "ignore" },
    );

    if (!(await waitForServer(baseUrl))) {
      server.kill();
      throw new Error(`Не удалось поднять frontend на ${baseUrl}`);
    }
  }

  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.kill();
});

for (const template of templates) {
  describe(`Раскладка шаблона «${template.name}» (${template.id})`, () => {
    for (const fixture of fixtures) {
      for (const viewport of viewports) {
        it(`${fixture.name} · ${viewport.name}: ${fixture.title}`, async () => {
          const page = await browser.newPage({
            viewport: { height: viewport.height, width: viewport.width },
          });
          const pageErrors = [];
          const consoleErrors = [];
          const failedRequests = [];

          page.on("pageerror", (error) => pageErrors.push(error.message));
          page.on("console", (message) => {
            // Сообщения о неудачной загрузке точнее ловит слушатель ответов ниже.
            if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
              consoleErrors.push(message.text());
            }
          });
          page.on("response", (response) => {
            // /api/* обслуживает backend — в тестах раскладки его может не быть.
            if (response.status() >= 400 && !new URL(response.url()).pathname.startsWith("/api/")) {
              failedRequests.push(`${response.status()} ${response.url()}`);
            }
          });

          try {
            const url = `${baseUrl}/templates/capture/${template.id}?palette=${encodeURIComponent(
              template.defaultPaletteId,
            )}&fixture=${fixture.name}`;

            const response = await page.goto(url, {
              timeout: 120_000,
              waitUntil: "networkidle",
            });

            assert.equal(response?.status(), 200, "страница должна отвечать 200");
            await page.waitForSelector("[data-template-capture]", { timeout: 30_000 });
            // Прокручиваем весь свиток: подгружаем ленивые фото и проверяем страницу целиком.
            await page.evaluate(async () => {
              const step = Math.max(window.innerHeight, 400);

              for (let y = 0; y < document.body.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise((resolve) => setTimeout(resolve, 120));
              }

              window.scrollTo(0, 0);
            });
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(800);

            const result = await page.evaluate(collectLayoutProblems);

            assert.ok(!result.fatal, result.fatal);
            assert.deepEqual(pageErrors, [], "не должно быть ошибок выполнения");
            assert.deepEqual(consoleErrors, [], "не должно быть ошибок в консоли");
            assert.deepEqual(failedRequests, [], "статика шаблона должна отдаваться без ошибок");
            assert.ok(
              result.documentOverflow <= 1,
              `страница скроллится вбок на ${result.documentOverflow}px`,
            );
            assert.deepEqual(
              result.escaping.slice(0, 5),
              [],
              "элементы не должны выходить за пределы приглашения",
            );
            assert.deepEqual(
              result.clipped.slice(0, 5),
              [],
              "текст не должен обрезаться внутри своего блока",
            );
            assert.deepEqual(result.brokenImages, [], "все изображения должны загрузиться");

            if (fixture.name === "minimal") {
              assert.equal(result.forms, 0, "при showRsvp=false анкеты быть не должно");
            } else {
              assert.ok(result.forms >= 1, "при showRsvp=true анкета должна отрисоваться");
            }

            const invite = await page.evaluate(() => {
              const node = document.querySelector("#capture-fixture-invite");

              return node ? JSON.parse(node.textContent ?? "{}") : null;
            });

            assert.ok(invite, "фикстура должна быть отдана странице");

            for (const missing of findMissingContent(invite, result.text)) {
              assert.fail(`шаблон не показывает ${missing}`);
            }
          } finally {
            await page.close();
          }
        });
      }
    }
  });
}
