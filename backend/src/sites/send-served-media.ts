import type { Response } from "express";
import type { ServedMedia } from "./sites-media";

export function sendServedMedia(response: Response, media: ServedMedia) {
  response
    .set({
      "Cache-Control": media.cacheControl,
      "Content-Type": media.contentType,
      // Content type comes from stored user uploads — never let the browser sniff it.
      "X-Content-Type-Options": "nosniff",
    })
    .send(media.buffer);
}
