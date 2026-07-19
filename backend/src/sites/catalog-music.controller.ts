import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { S3StorageService } from "../storage/s3-storage.service";
import { sendServedMedia } from "./send-served-media";

@Controller("catalog-music")
export class CatalogMusicController {
  constructor(private readonly s3Storage: S3StorageService) {}

  @Get(":trackId")
  async getTrack(@Param("trackId") trackId: string, @Res() response: Response) {
    try {
      const media = await this.s3Storage.getCatalogMusicObject(trackId);
      sendServedMedia(response, { ...media, kind: "buffer" });
    } catch {
      throw new NotFoundException("Track not found");
    }
  }
}
