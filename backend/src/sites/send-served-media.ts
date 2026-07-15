import type { Response } from "express";
import type { ServedMedia } from "./sites-media";

export function sendServedMedia(response: Response, media: ServedMedia) {
  response
    .set({
      "Cache-Control": media.cacheControl,
      "Content-Type": media.contentType,
    })
    .send(media.buffer);
}
