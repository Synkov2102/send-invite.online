import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { sendServedMedia } from "../sites/send-served-media";
import { S3StorageService } from "../storage/s3-storage.service";

@Controller("blog-images")
export class BlogImagesController {
  constructor(private readonly s3Storage: S3StorageService) {}

  @Get(":imageId")
  async getImage(@Param("imageId") imageId: string, @Res() response: Response) {
    try {
      const media = await this.s3Storage.getBlogImageObject(imageId);
      sendServedMedia(response, { ...media, kind: "buffer" });
    } catch {
      throw new NotFoundException("Image not found");
    }
  }
}
