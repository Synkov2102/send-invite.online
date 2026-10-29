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
    cardWidth: cardRect.width,
    cardCenterOffset: Math.abs((cardRect.left + cardRect.right) / 2 - document.documentElement.clientWidth / 2),
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

describe("Центрирование всех шаблонов каталога", () => {
  for (const template of editorReady) {
    for (const mode of ["published", "fullscreen", "editor"]) {
      it(`${template.id} · ${mode}`, async () => {
        const page = await browser.newPage({
          viewport: { width: 1280, height: 900 },
          reducedMotion: "reduce",
        });
        try {
          await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
          await page.addInitScript(() => {
            localStorage.setItem("invite.cookieNoticeSeen", "seen");
          });
          const url =
            mode === "published"
              ? `${baseUrl}/templates/capture/${template.id}?preview=1`
              : `${baseUrl}/editor?template=${template.id}${mode === "fullscreen" ? "&preview=1" : ""}`;
          const response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 120_000,
          });
          assert.equal(response?.status(), 200);
          if (mode === "editor") {
            await page
              .getByRole("button", { name: "Предпросмотр на компьютере", exact: true })
              .click();
          }
          const card = page.locator(".published-site article").first();
          await card.waitFor({ state: "visible" });
          for (const width of [1280, 768, 320]) {
            await page.setViewportSize({ width, height: 900 });
            await page.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            const bounds = await card.evaluate((element) => {
              const rect = element.getBoundingClientRect();
              const host = element.closest(".published-site").getBoundingClientRect();
              return {
                offset: Math.abs((rect.left + rect.right - host.left - host.right) / 2),
                width: rect.width,
                hostWidth: host.width,
              };
            });
            assert.ok(bounds.width > 0, "приглашение должно иметь ненулевую ширину");
            assert.ok(
              bounds.width <= bounds.hostWidth + 1,
              "приглашение не должно быть шире оболочки",
            );
            assert.ok(
              bounds.offset <= 1,
              `${width}px: смещение от центра оболочки ${bounds.offset}px`,
            );
          }
        } finally {
          await page.close();
        }
      });
    }
  }
});

describe("Анимации Бордового банта", () => {
  it("в закрытой фазе конверта фотографии не выглядывают наружу", async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    });
    try {
      await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
      await page.goto(`${baseUrl}/templates/capture/burgundy-ribbon?preview=1`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() =>
        document
          .getAnimations()
          .some((animation) => animation.animationName?.includes("cardUnsealLeft")),
      );
      await page.evaluate(() =>
        document.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = 200;
        }),
      );
      const cards = await page
        .locator('[data-invite-section="hero"] figure')
        .evaluateAll((nodes) => {
          const envelope = document.querySelector("[data-ribbon-envelope]").getBoundingClientRect();
          return nodes.map((node) => ({
            opacity: getComputedStyle(node).opacity,
            top: node.getBoundingClientRect().top,
            bottom: node.getBoundingClientRect().bottom,
            envelopeTop: envelope.top,
            envelopeBottom: envelope.bottom,
          }));
        });
      for (const card of cards) {
        assert.equal(card.opacity, "0", "фотографии скрыты до открытия клапана");
        assert.ok(
          card.top >= card.envelopeTop && card.bottom <= card.envelopeBottom,
          "начальная позиция карточки внутри конверта",
        );
      }
    } finally {
      await page.close();
    }
  });

  it("линия следует скроллу, события остаются открытыми, цвет можно выбрать", async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    });
    try {
      await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
      await page.addInitScript(() => localStorage.setItem("invite.cookieNoticeSeen", "seen"));
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${baseUrl}/templates/capture/burgundy-ribbon?preview=1`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("article[data-animate='on']");
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector("[data-ribbon-envelope]")).visibility ===
          "hidden",
      );
      await page.waitForFunction(
        () => document.querySelector("article").style.getPropertyValue("--ribbon-progress") !== "",
      );
      assert.equal(
        Number(
          await page
            .locator("article")
            .evaluate((node) => node.style.getPropertyValue("--ribbon-progress")),
        ),
        0,
      );
      await page.locator("[data-ribbon-timeline]").evaluate((node) => {
        window.scrollTo(
          0,
          window.scrollY + node.getBoundingClientRect().top - window.innerHeight * 0.45,
        );
      });
      await page.waitForFunction(() => {
        const progress = Number(
          document.querySelector("article").style.getPropertyValue("--ribbon-progress"),
        );
        return progress > 0 && progress < 1;
      });
      const reached = await page.locator("[data-timeline-item][data-revealed]").count();
      const total = await page.locator("[data-timeline-item]").count();
      assert.ok(reached > 0 && reached < total, "на середине линии открыта только часть событий");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(
        () =>
          Number(document.querySelector("article").style.getPropertyValue("--ribbon-progress")) ===
          1,
      );
      assert.equal(await page.locator("[data-timeline-item][data-revealed]").count(), total);
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal(await page.locator("[data-timeline-item][data-revealed]").count(), total);
      const swatch = page.getByRole("button", { name: /^Выбрать цвет/ }).first();
      const color = await swatch.getAttribute("title");
      await swatch.click();
      assert.equal(await swatch.getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator("output").textContent(), color.toUpperCase());
      assert.deepEqual(await page.locator('[data-invite-section="chat info"] h2').allTextContents(), ["Детали", "Чат"], "в блоках не должно быть дублирующих скрытых заголовков");
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });

  it("программа реагирует на скролл внутренней панели редактора", async () => {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "no-preference",
    });
    try {
      await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
      await page.addInitScript(() => localStorage.setItem("invite.cookieNoticeSeen", "seen"));
      await page.goto(`${baseUrl}/editor?template=burgundy-ribbon`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "Предпросмотр на компьютере", exact: true }).click();
      await page.waitForSelector("article[data-animate='on']");
      await page
        .locator("[data-ribbon-timeline]")
        .evaluate((node) => node.scrollIntoView({ block: "center" }));
      await page.waitForFunction(
        () =>
          Number(document.querySelector("article").style.getPropertyValue("--ribbon-progress")) > 0,
      );
      assert.ok((await page.locator("[data-timeline-item][data-revealed]").count()) > 0);
      assert.equal(
        await page.evaluate(() => window.scrollY),
        0,
        "прокручивается панель, а не окно",
      );
    } finally {
      await page.close();
    }
  });

  it("программа реагирует на прокрутку iframe мобильного превью", async () => {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "no-preference",
    });
    try {
      await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
      await page.addInitScript(() => localStorage.setItem("invite.cookieNoticeSeen", "seen"));
      await page.goto(`${baseUrl}/editor?template=burgundy-ribbon`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Предпросмотр на телефоне", exact: true }).click();
      const preview = page.frameLocator('iframe[title="Предпросмотр на телефоне"]');
      await preview.locator("[data-ribbon-timeline]").waitFor();
      await preview
        .locator("[data-ribbon-timeline]")
        .evaluate((node) => node.scrollIntoView({ block: "center" }));
      await preview.locator("article").evaluate(async (node) => {
        const view = node.ownerDocument.defaultView;
        for (let attempt = 0; attempt < 60; attempt++) {
          if (Number(node.style.getPropertyValue("--ribbon-progress")) > 0) return;
          await new Promise((resolve) => view.requestAnimationFrame(resolve));
        }
        throw new Error("линия не реагирует на прокрутку iframe");
      });
      assert.ok((await preview.locator("[data-timeline-item][data-revealed]").count()) > 0);
      assert.equal(await page.evaluate(() => window.scrollY), 0);
    } finally {
      await page.close();
    }
  });

  it("при уменьшении движения содержимое видно без скролл-анимаций", async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    try {
      await page.route("**/api/catalog-music/**", (route) => route.fulfill({ status: 204 }));
      await page.goto(`${baseUrl}/templates/capture/burgundy-ribbon?preview=1`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator("[data-ribbon-timeline]").waitFor();
      assert.equal(await page.locator("article").getAttribute("data-animate"), null);
      assert.ok(
        await page
          .locator("[data-timeline-item]")
          .evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).opacity === "1")),
      );
      await page.getByRole("timer").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => getComputedStyle(document.querySelector("[role='timer'] i")).animationName === "none",
      );
    } finally {
      await page.close();
    }
  });
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
            if (template.kind === "lace") {
              await page.waitForFunction(() => {
                const photos = document.querySelectorAll(
                  '[data-invite-section="location"] figure img, [data-invite-section="portrait"] figure img',
                );
                return photos.length === 2 && [...photos].every((photo) => photo.complete && photo.naturalWidth > 0);
              }, null, { timeout: 30_000 });
            }
            // Прокручиваем весь свиток: подгружаем ленивые фото и проверяем страницу целиком.
            await page.evaluate(async () => {
              document.querySelectorAll("details").forEach((panel) => {
                panel.open = true;
              });
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
            assert.ok(result.cardCenterOffset <= 1, "приглашение должно быть по центру экрана");
            if (template.kind === "petal") {
              assert.ok(result.cardWidth <= 601, "ширина «Лепестков» не должна превышать 600px");
            }
            if (template.kind === "lace") {
              assert.ok(result.cardWidth <= 641, "ширина «Кружевного письма» не должна превышать 640px");
            }
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
            if (template.kind === "sol") {
              const sections = await page.locator("article [data-invite-section]").evaluateAll((nodes) =>
                nodes.map((node) => node.getAttribute("data-invite-section").split(" ")[0]),
              );
              const expectedSections = ["hero", "greeting", "date", "location"];
              if (invite.showSchedule) expectedSections.push("schedule");
              if (invite.showDressCode) expectedSections.push("dress-code");
              if (invite.showGroupChat) expectedSections.push("chat");
              if (invite.showAdditionalInfo) expectedSections.push("info");
              if (invite.showRsvp) expectedSections.push("rsvp");
              expectedSections.push("closing");
              assert.deepEqual(sections, expectedSections, "блоки должны следовать контракту шаблона");
              const edges = await page.locator('article [data-invite-section="schedule"], article [data-invite-section="info"], article [data-invite-section="rsvp"]').evaluateAll((nodes) => nodes.map((node) => {
                const top = getComputedStyle(node, "::before");
                const bottom = getComputedStyle(node, "::after");
                return { top: parseFloat(top.height), bottom: parseFloat(bottom.height), width: node.closest("article").clientWidth, size: top.maskSize };
              }));
              for (const edge of edges) {
                assert.ok(Math.abs(edge.top - edge.width * 0.14) <= 1, "высота края должна зависеть только от ширины приглашения");
                assert.equal(edge.top, edge.bottom, "верхний и нижний края должны иметь одинаковую высоту");
                assert.ok(["100%", "100% auto"].includes(edge.size), "маска должна сохранять свои пропорции");
              }

              for (const section of ["hero", "location", "closing"]) {
                assert.equal(await page.locator('article [data-invite-section^="' + section + '"] img').count(), 1, "в секции должно быть своё фото");
              }
            }


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
