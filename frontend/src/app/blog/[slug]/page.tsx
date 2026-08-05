import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/article-body";
import ArticleCard from "@/components/article-card";
import CommerceFooter from "@/components/commerce-footer";
import JsonLd from "@/components/json-ld";
import PageShellProvider from "@/components/page-shell";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import { formatArticleDate, getArticle, getArticles, getRelatedArticles } from "@/lib/articles";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import styles from "../blog.module.css";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "Статья не найдена",
      path: `/blog/${slug}`,
      robots: { index: false, follow: true },
    });
  }

  return createPageMetadata({
    title: article.seoTitle ?? article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    type: "article",
    ...(article.cover ? { images: [article.cover.src] } : {}),
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, await getArticles());

  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader active="blog" />

      {article.cover ? (
        <PageShellProvider as="div" className={styles.bannerShell} width="wide">
          <Image
            alt={article.cover.alt}
            className={styles.banner}
            height={630}
            priority
            sizes="(max-width: 1280px) 100vw, 1240px"
            src={article.cover.src}
            width={1600}
          />
        </PageShellProvider>
      ) : null}

      <PageShellProvider as="main" className={styles.article} width="narrow">
        <nav aria-label="Хлебные крошки" className={styles.breadcrumbs}>
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/blog">Блог</Link>
        </nav>

        <article>
          <header className={styles.articleHeader}>
            <p className="marketing-eyebrow">
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
              {" · "}
              {article.readingMinutes} мин чтения
            </p>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
          </header>

          <ArticleBody article={article} />

          {article.tags.length > 0 ? (
            <div className={styles.tags}>
              {article.tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        {related.length > 0 ? (
          <section className={styles.related}>
            <h2>Читайте также</h2>
            <div className={styles.grid}>
              {related.map((item) => (
                <ArticleCard article={item} headingLevel="h3" key={item.slug} />
              ))}
            </div>
          </section>
        ) : null}
      </PageShellProvider>

      <CommerceFooter />

      <JsonLd
        data={[
          buildArticleJsonLd(article),
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Блог", path: "/blog" },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
          ...(article.faq.length > 0 ? [buildFaqJsonLd(article.faq)] : []),
        ]}
      />
    </ProductPageShell>
  );
}
