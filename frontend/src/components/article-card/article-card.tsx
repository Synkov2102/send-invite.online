import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@invite/shared";
import { formatArticleDate } from "@/lib/articles";
import styles from "./article-card.module.css";

export default function ArticleCard({
  article,
  headingLevel = "h2",
}: {
  article: ArticleSummary;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <Link className={styles.card} href={`/blog/${article.slug}`}>
      {article.cover ? (
        <Image
          alt={article.cover.alt}
          className={styles.image}
          height={630}
          sizes="(max-width: 760px) 100vw, 360px"
          src={article.cover.src}
          width={1200}
        />
      ) : null}
      <div className={styles.body}>
        <Heading>{article.title}</Heading>
        <p>{article.excerpt}</p>
        <div className={styles.meta}>
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
          <span>·</span>
          <span>{article.readingMinutes} мин чтения</span>
        </div>
      </div>
    </Link>
  );
}
