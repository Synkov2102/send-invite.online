import type { Response } from "express";
import type { ServedMedia } from "./sites-media";

export function sendServedMedia(response: Response, media: ServedMedia) {
  if (media.kind === "redirect") {
    response.redirect(307, media.url);
    return;
  }

  response
    .set({
      "Cache-Control": media.cacheControl,
      "Content-Type": media.contentType,
    })
    .send(media.buffer);
}
