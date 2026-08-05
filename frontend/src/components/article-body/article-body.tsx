import Image from "next/image";
import Link from "next/link";
import type { Article, ArticleBlock, ArticleSpan } from "@invite/shared";
import styles from "./article-body.module.css";

function renderSpans(spans: ArticleSpan[], keyPrefix: string) {
  return spans.map((span, index) => {
    const key = `${keyPrefix}-${index}`;

    if (span.href) {
      return span.href.startsWith("/") ? (
        <Link href={span.href} key={key}>
          {span.text}
        </Link>
      ) : (
        <a href={span.href} key={key} rel="noopener noreferrer" target="_blank">
          {span.text}
        </a>
      );
    }

    return span.bold ? <strong key={key}>{span.text}</strong> : <span key={key}>{span.text}</span>;
  });
}

function ArticleBlockView({ block, blockKey }: { block: ArticleBlock; blockKey: string }) {
  if (block.kind === "paragraph") {
    return <p>{renderSpans(block.spans, blockKey)}</p>;
  }

  if (block.kind === "quote") {
    return <blockquote className={styles.quote}>{renderSpans(block.spans, blockKey)}</blockquote>;
  }

  if (block.kind === "list") {
    const items = block.items.map((item, index) => (
      <li key={`${blockKey}-${index}`}>{renderSpans(item, `${blockKey}-${index}`)}</li>
    ));

    return block.ordered ? (
      <ol className={styles.list}>{items}</ol>
    ) : (
      <ul className={styles.list}>{items}</ul>
    );
  }

  if (block.kind === "image") {
    return (
      <figure className={styles.figure}>
        <Image alt={block.alt} height={720} sizes="(max-width: 760px) 100vw, 720px" src={block.src} width={1280} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <aside className={styles.cta}>
      <p>{renderSpans(block.spans, blockKey)}</p>
      <Link className={styles.ctaButton} href={block.href}>
        {block.label}
      </Link>
    </aside>
  );
}

function renderBlocks(blocks: ArticleBlock[], keyPrefix: string) {
  return blocks.map((block, index) => (
    <ArticleBlockView
      block={block}
      blockKey={`${keyPrefix}-${index}`}
      key={`${keyPrefix}-${index}`}
    />
  ));
}

export default function ArticleBody({ article }: { article: Article }) {
  return (
    <div className={styles.body}>
      {renderBlocks(article.intro, "intro")}

      {article.sections.length > 1 ? (
        <nav aria-label="Содержание" className={styles.toc}>
          <p className={styles.tocTitle}>Содержание</p>
          <ol>
            {article.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {article.sections.map((section) => (
        <section className={styles.section} key={section.id}>
          <h2 id={section.id}>{section.heading}</h2>
          {renderBlocks(section.blocks, section.id)}
        </section>
      ))}

      {article.faq.length > 0 ? (
        <section className={styles.section}>
          <h2 id="faq">Частые вопросы</h2>
          <dl className={styles.faq}>
            {article.faq.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
