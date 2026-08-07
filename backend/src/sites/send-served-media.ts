import type { Response } from "express";
import type { ServedMedia } from "./sites-media";

export function sendServedMedia(response: Response, media: ServedMedia) {
  const headers: Record<string, string> = {
    "Cache-Control": media.cacheControl,
    "Content-Type": media.contentType,
    // Content type comes from stored user uploads — never let the browser sniff it.
    "X-Content-Type-Options": "nosniff",
  };

  if (media.kind === "buffer") {
    response.set(headers).send(media.buffer);
    return;
  }

  // Accept-Ranges + ETag дают плееру перемотку и повторное использование кэша
  // вместо повторной загрузки трека целиком.
  headers["Accept-Ranges"] = "bytes";

  if (media.contentLength !== undefined) {
    headers["Content-Length"] = String(media.contentLength);
  }

  if (media.contentRange) {
    headers["Content-Range"] = media.contentRange;
  }

  if (media.etag) {
    headers.ETag = media.etag;
  }

  response.status(media.contentRange ? 206 : 200).set(headers);

  // Клиент может оборваться на середине трека — поток надо закрыть,
  // иначе соединение к S3 висит до таймаута.
  response.on("close", () => media.stream.destroy());
  media.stream.on("error", () => response.destroy());

  media.stream.pipe(response);
}
