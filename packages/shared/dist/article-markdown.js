"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugifyArticleText = slugifyArticleText;
exports.parseArticleSpans = parseArticleSpans;
exports.parseArticleDocument = parseArticleDocument;
const article_schema_1 = require("./schemas/article.schema");
const FAQ_HEADINGS = new Set(["faq", "частые вопросы", "вопросы и ответы"]);
const CYRILLIC_TRANSLIT = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
/** Latin kebab-case id for anchors and slugs. */
function slugifyArticleText(value) {
    return value
        .toLowerCase()
        .split("")
        .map((char) => CYRILLIC_TRANSLIT[char] ?? char)
        .join("")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
/** Links come first so `[**text**](/href)` matches as a link instead of splitting on the bold. */
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
/** Only bold and links — everything else stays literal text. */
function parseArticleSpans(text) {
    const spans = [];
    let cursor = 0;
    INLINE_PATTERN.lastIndex = 0;
    for (let match = INLINE_PATTERN.exec(text); match; match = INLINE_PATTERN.exec(text)) {
        if (match.index > cursor) {
            spans.push({ text: text.slice(cursor, match.index) });
        }
        if (match[1] !== undefined && match[2] !== undefined) {
            spans.push({ href: match[2], text: match[1].replace(/\*\*/g, "") });
        }
        else if (match[3] !== undefined) {
            spans.push({ bold: true, text: match[3] });
        }
        cursor = match.index + match[0].length;
    }
    if (cursor < text.length) {
        spans.push({ text: text.slice(cursor) });
    }
    return spans.length > 0 ? spans : [{ text }];
}
function splitFrontmatter(source) {
    const normalized = source.replace(/\r\n/g, "\n");
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
    if (!match) {
        return { body: normalized, frontmatter: {} };
    }
    const frontmatter = {};
    for (const line of match[1].split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const separator = trimmed.indexOf(":");
        if (separator <= 0) {
            continue;
        }
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        frontmatter[key] = value;
    }
    return { body: normalized.slice(match[0].length), frontmatter };
}
function splitList(value) {
    if (!value) {
        return [];
    }
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const CTA_OPEN = /^:::cta\s+(.+?)\|(\S+)\s*$/;
const ORDERED_ITEM = /^\d+[.)]\s+(.+)$/;
const UNORDERED_ITEM = /^[-*]\s+(.+)$/;
function parseArticleBody(body) {
    const draft = { faq: [], intro: [], sections: [] };
    const lines = body.split("\n");
    let currentSection = null;
    let faqMode = false;
    let pendingQuestion = null;
    let paragraph = [];
    let quote = [];
    let listItems = [];
    let listOrdered = false;
    let cta = null;
    const usedIds = new Set();
    /** Anchors must stay unique: repeated headings would collide in the DOM and in the table of contents. */
    const nextSectionId = (heading) => {
        const base = slugifyArticleText(heading) || "razdel";
        let id = base;
        for (let suffix = 2; usedIds.has(id); suffix += 1) {
            id = `${base}-${suffix}`;
        }
        usedIds.add(id);
        return id;
    };
    const pushBlock = (block) => {
        // Inside the FAQ section only question/answer pairs survive; the rest is dropped.
        if (faqMode) {
            return;
        }
        (currentSection ? currentSection.blocks : draft.intro).push(block);
    };
    const flushParagraph = () => {
        if (paragraph.length === 0) {
            return;
        }
        const text = paragraph.join(" ").trim();
        paragraph = [];
        if (!text) {
            return;
        }
        if (faqMode && pendingQuestion) {
            draft.faq.push({ answer: text, question: pendingQuestion });
            pendingQuestion = null;
            return;
        }
        pushBlock({ kind: "paragraph", spans: parseArticleSpans(text) });
    };
    const flushQuote = () => {
        if (quote.length === 0) {
            return;
        }
        const text = quote.join(" ").trim();
        quote = [];
        if (text) {
            pushBlock({ kind: "quote", spans: parseArticleSpans(text) });
        }
    };
    const flushList = () => {
        if (listItems.length === 0) {
            return;
        }
        const items = listItems.map((item) => parseArticleSpans(item));
        listItems = [];
        pushBlock({ items, kind: "list", ordered: listOrdered });
    };
    const flushAll = () => {
        flushParagraph();
        flushQuote();
        flushList();
    };
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (cta) {
            if (line === ":::") {
                const text = cta.lines.join(" ").trim();
                if (text) {
                    pushBlock({
                        href: cta.href,
                        kind: "cta",
                        label: cta.label,
                        spans: parseArticleSpans(text),
                    });
                }
                cta = null;
            }
            else if (line) {
                cta.lines.push(line);
            }
            continue;
        }
        if (!line) {
            flushAll();
            continue;
        }
        const ctaOpen = CTA_OPEN.exec(line);
        if (ctaOpen) {
            flushAll();
            cta = { href: ctaOpen[2], label: ctaOpen[1].trim(), lines: [] };
            continue;
        }
        if (line.startsWith("## ")) {
            flushAll();
            const heading = line.slice(3).trim();
            faqMode = FAQ_HEADINGS.has(heading.toLowerCase());
            pendingQuestion = null;
            if (!faqMode) {
                currentSection = { blocks: [], heading, id: nextSectionId(heading) };
                draft.sections.push(currentSection);
            }
            continue;
        }
        if (line.startsWith("### ")) {
            flushAll();
            if (faqMode) {
                pendingQuestion = line.slice(4).replace(/\s*$/, "");
                continue;
            }
            paragraph.push(line.slice(4));
            continue;
        }
        const image = IMAGE_LINE.exec(line);
        if (image) {
            flushAll();
            pushBlock({
                alt: image[1] || "Иллюстрация",
                kind: "image",
                src: image[2],
                ...(image[3] ? { caption: image[3] } : {}),
            });
            continue;
        }
        if (line.startsWith("> ")) {
            flushParagraph();
            flushList();
            quote.push(line.slice(2).trim());
            continue;
        }
        const unordered = UNORDERED_ITEM.exec(line);
        const ordered = ORDERED_ITEM.exec(line);
        if (unordered || ordered) {
            flushParagraph();
            flushQuote();
            const nextOrdered = Boolean(ordered);
            if (listItems.length > 0 && listOrdered !== nextOrdered) {
                flushList();
            }
            listOrdered = nextOrdered;
            listItems.push((unordered ? unordered[1] : ordered[1]).trim());
            continue;
        }
        flushQuote();
        flushList();
        paragraph.push(line);
    }
    flushAll();
    // An unterminated fence would otherwise swallow the rest of the article without a trace.
    if (cta) {
        draft.error = `Незакрытая врезка ":::cta ${cta.label}" — добавьте ":::" в конце.`;
    }
    return draft;
}
function countTextWords(text) {
    return text.split(/\s+/).filter(Boolean).length;
}
function countSpanWords(spans) {
    return spans.reduce((total, span) => total + countTextWords(span.text), 0);
}
function countWords(blocks) {
    let words = 0;
    for (const block of blocks) {
        if (block.kind === "paragraph" || block.kind === "quote" || block.kind === "cta") {
            words += countSpanWords(block.spans);
        }
        else if (block.kind === "list") {
            for (const item of block.items) {
                words += countSpanWords(item);
            }
        }
    }
    return words;
}
/**
 * Parse an authored markdown file into the validated document stored in MongoDB.
 * `updatedAt` defaults to publish time so `dateModified` and the sitemap stay honest.
 */
function parseArticleDocument(source, options = {}) {
    const now = options.now ?? new Date().toISOString();
    const { body, frontmatter } = splitFrontmatter(source);
    const draft = parseArticleBody(body);
    if (draft.error) {
        return { error: draft.error, ok: false };
    }
    const words = countWords(draft.intro) +
        draft.sections.reduce((total, section) => total + countWords(section.blocks), 0) +
        draft.faq.reduce((total, item) => total + countTextWords(item.answer), 0);
    const cover = frontmatter.cover
        ? { alt: frontmatter.coverAlt ?? frontmatter.title ?? "", src: frontmatter.cover }
        : null;
    const candidate = {
        cover,
        description: frontmatter.description ?? "",
        excerpt: frontmatter.excerpt ?? frontmatter.description ?? "",
        faq: draft.faq,
        intro: draft.intro,
        publishedAt: frontmatter.publishedAt ?? now,
        readingMinutes: Math.max(1, Math.ceil(words / 150)),
        related: splitList(frontmatter.related),
        sections: draft.sections,
        seoTitle: frontmatter.seoTitle ?? null,
        slug: frontmatter.slug ?? "",
        status: frontmatter.status ?? "published",
        tags: splitList(frontmatter.tags),
        title: frontmatter.title ?? "",
        updatedAt: frontmatter.updatedAt ?? now,
    };
    const parsed = article_schema_1.articleSchema.safeParse(candidate);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const path = issue.path.map(String).join(".");
        return { error: path ? `${path}: ${issue.message}` : issue.message, ok: false };
    }
    return { article: parsed.data, ok: true };
}
