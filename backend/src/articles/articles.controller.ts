import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ArticleStore } from "./article.store";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articleStore: ArticleStore) {}

  @Get()
  async listArticles(@Query("tag") tag?: string) {
    return { articles: await this.articleStore.listPublished(tag?.trim() || undefined) };
  }

  @Get("sitemap")
  async listSitemapEntries() {
    return { entries: await this.articleStore.listSitemapEntries() };
  }

  @Get(":slug")
  async getArticle(@Param("slug") slug: string) {
    const article = SLUG_PATTERN.test(slug)
      ? await this.articleStore.findPublished(slug)
      : null;

    if (!article) {
      throw new NotFoundException({ error: "Статья не найдена." });
    }

    return article;
  }
}
