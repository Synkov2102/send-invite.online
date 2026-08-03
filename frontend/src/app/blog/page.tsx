import type { Metadata } from "next";
import ArticleCard from "@/components/article-card";
import CommerceFooter from "@/components/commerce-footer";
import JsonLd from "@/components/json-ld";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/articles";
import { buildBlogJsonLd, buildBreadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import styles from "./blog.module.css";

const description =
  "Статьи о свадебных приглашениях: что написать гостям, как собрать RSVP и подготовить сайт-приглашение.";

export const metadata: Metadata = createPageMetadata({
  title: "Блог о свадебных приглашениях",
  description,
  path: "/blog",
});

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader active="blog" />

      <main className={styles.page}>
        <header className={styles.hero}>
          <p className="marketing-eyebrow">Блог</p>
          <h1>Свадебные приглашения: как собрать и что написать</h1>
          <p>{description}</p>
        </header>

        {articles.length > 0 ? (
          <section aria-label="Список статей" className={styles.grid}>
            {articles.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </section>
        ) : (
          <p className={styles.empty}>Статьи скоро появятся.</p>
        )}
      </main>

      <CommerceFooter />

      <JsonLd
        data={[
          buildBlogJsonLd(articles),
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Блог", path: "/blog" },
          ]),
        ]}
      />
    </ProductPageShell>
  );
}
