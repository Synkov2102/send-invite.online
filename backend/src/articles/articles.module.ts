import { Module } from "@nestjs/common";
import { S3StorageService } from "../storage/s3-storage.service";
import { ArticleStore } from "./article.store";
import { ArticlesController } from "./articles.controller";
import { BlogImagesController } from "./blog-images.controller";

@Module({
  controllers: [ArticlesController, BlogImagesController],
  providers: [ArticleStore, S3StorageService],
})
export class ArticlesModule {}
