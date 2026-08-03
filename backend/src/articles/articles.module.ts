import { Module } from "@nestjs/common";
import { ArticleStore } from "./article.store";
import { ArticlesController } from "./articles.controller";

@Module({
  controllers: [ArticlesController],
  providers: [ArticleStore],
})
export class ArticlesModule {}
