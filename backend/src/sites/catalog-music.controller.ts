import {
  Controller,
  Get,
  Headers,
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
  async getTrack(
    @Param("trackId") trackId: string,
    @Res() response: Response,
    @Headers("range") range?: string,
  ) {
    let media;

    try {
      media = await this.s3Storage.getCatalogMusicStream(trackId, range);
    } catch {
      throw new NotFoundException("Track not found");
    }

    sendServedMedia(response, { ...media, kind: "stream" });
  }
}
