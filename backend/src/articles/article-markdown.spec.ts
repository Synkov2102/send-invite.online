import { parseArticleDocument, slugifyArticleText } from "@invite/shared";

const frontmatter = [
  "---",
  "slug: kak-sdelat-sajt-priglashenie",
  "title: Как сделать сайт-приглашение",
  "description: Пошаговый разбор сборки свадебного сайта-приглашения.",
  "excerpt: Что должно быть на сайте-приглашении.",
  "tags: приглашения, подготовка",
  "related: rsvp-na-svadbe",
  "publishedAt: 2026-08-01",
  "---",
].join("\n");

function parse(body: string) {
  return parseArticleDocument(`${frontmatter}\n\n${body}`, {
    now: "2026-08-03T00:00:00.000Z",
  });
}

describe("parseArticleDocument", () => {
  it("splits intro, sections and inline spans", () => {
    const result = parse(
      [
        "Вступление к статье.",
        "",
        "## Что написать",
        "",
        "Текст с **акцентом** и [ссылкой](/templates).",
      ].join("\n"),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.article.intro).toEqual([
      { kind: "paragraph", spans: [{ text: "Вступление к статье." }] },
    ]);
    expect(result.article.sections).toHaveLength(1);
    expect(result.article.sections[0].id).toBe("chto-napisat");
    expect(result.article.sections[0].blocks[0]).toEqual({
      kind: "paragraph",
      spans: [
        { text: "Текст с " },
        { bold: true, text: "акцентом" },
        { text: " и " },
        { href: "/templates", text: "ссылкой" },
        { text: "." },
      ],
    });
    expect(result.article.tags).toEqual(["приглашения", "подготовка"]);
    expect(result.article.related).toEqual(["rsvp-na-svadbe"]);
    expect(result.article.updatedAt).toBe("2026-08-03T00:00:00.000Z");
  });

  it("parses lists, quotes, images and cta blocks", () => {
    const result = parse(
      [
        "## Блоки",
        "",
        "- первый",
        "- второй",
        "",
        "1. шаг",
        "",
        "> Цитата.",
        "",
        '![Экран приглашения](s3://invite-media/blog-images/2f0a.webp "Подпись")',
        "",
        ":::cta Выбрать шаблон|/templates",
        "Соберите сайт за вечер.",
        ":::",
      ].join("\n"),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.article.sections[0].blocks).toEqual([
      { items: [[{ text: "первый" }], [{ text: "второй" }]], kind: "list", ordered: false },
      { items: [[{ text: "шаг" }]], kind: "list", ordered: true },
      { kind: "quote", spans: [{ text: "Цитата." }] },
      {
        alt: "Экран приглашения",
        caption: "Подпись",
        kind: "image",
        src: "s3://invite-media/blog-images/2f0a.webp",
      },
      {
        href: "/templates",
        kind: "cta",
        label: "Выбрать шаблон",
        spans: [{ text: "Соберите сайт за вечер." }],
      },
    ]);
  });

  it("collects the FAQ section separately from the body", () => {
    const result = parse(
      [
        "## Раздел",
        "",
        "Текст.",
        "",
        "## FAQ",
        "",
        "### Сколько времени занимает сборка?",
        "",
        "Обычно вечер.",
      ].join("\n"),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.article.sections).toHaveLength(1);
    expect(result.article.faq).toEqual([
      { answer: "Обычно вечер.", question: "Сколько времени занимает сборка?" },
    ]);
  });

  it("rejects a document without a slug", () => {
    const source = `${frontmatter.replace(/^slug: .+\n/m, "")}\n\n## Раздел\n\nТекст.`;
    const result = parseArticleDocument(source, { now: "2026-08-03T00:00:00.000Z" });

    expect(result).toEqual({ error: expect.stringContaining("slug"), ok: false });
  });

  it("keeps section anchors unique when headings repeat", () => {
    const result = parse(
      ["## Детали", "", "Раз.", "", "## Детали", "", "Два."].join("\n"),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.article.sections.map((section) => section.id)).toEqual([
      "detali",
      "detali-2",
    ]);
  });

  it("parses a link whose text is bold instead of splitting it", () => {
    const result = parse(["## Раздел", "", "Смотрите [**шаблоны**](/templates) тут."].join("\n"));

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.article.sections[0].blocks[0]).toEqual({
      kind: "paragraph",
      spans: [
        { text: "Смотрите " },
        { href: "/templates", text: "шаблоны" },
        { text: " тут." },
      ],
    });
  });

  it("rejects an unterminated cta fence instead of dropping the rest of the article", () => {
    const result = parse(
      [
        "## Раздел",
        "",
        ":::cta Выбрать шаблон|/templates",
        "Соберите сайт за вечер.",
        "",
        "## Второй раздел",
        "",
        "Этот текст потерялся бы молча.",
      ].join("\n"),
    );

    expect(result).toEqual({ error: expect.stringContaining(":::"), ok: false });
  });

  it("rejects a javascript: link", () => {
    const result = parse(["## Раздел", "", "[клик](javascript:alert(1))"].join("\n"));

    expect(result.ok).toBe(false);
  });

  it("transliterates headings into latin anchors", () => {
    expect(slugifyArticleText("Что написать в приглашении?")).toBe(
      "chto-napisat-v-priglashenii",
    );
  });
});
