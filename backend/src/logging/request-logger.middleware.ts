import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { LogStore } from "../logs/log.store";

// Медиа и витринную цену фронт дёргает постоянно; успешные ответы по ним
// топят в логах реальные события. Ошибки на этих путях логируются как обычно.
const quietPathPattern =
  /^\/api\/(?:catalog-music\/|blog-images\/|payments\/pricing\b|sites\/[^/]+\/(?:images\/|music\b))/;

@Injectable()
export class RequestLoggerMiddleware {
  constructor(private readonly logStore: LogStore) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers["x-request-id"] as string | undefined)?.trim();
    const finalRequestId = requestId || randomUUID();

    res.setHeader("x-request-id", finalRequestId);

    const start = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      const { method } = req;
      const path = req.originalUrl || req.url;
      const statusCode = res.statusCode;

      if (statusCode < 400 && quietPathPattern.test(path)) {
        return;
      }

      // Console log is enough for most cases; Mongo gets only failures.
      console.log(
        JSON.stringify({
          level: statusCode >= 500 ? "error" : "info",
          source: "http.request",
          requestId: finalRequestId,
          method,
          path,
          statusCode,
          durationMs,
        }),
      );

      if (statusCode >= 500) {
        void this.logStore.write({
          level: "error",
          message: "Request failed",
          source: "http.request",
          context: {
            requestId: finalRequestId,
            method,
            path,
            statusCode,
            durationMs,
          },
        });
      }
    });

    res.on("error", (error) => {
      const durationMs = Date.now() - start;
      const { method } = req;
      const path = req.originalUrl || req.url;

      console.error(
        JSON.stringify({
          level: "error",
          source: "http.request",
          requestId: finalRequestId,
          method,
          path,
          durationMs,
          message: error?.message ?? "unknown",
        }),
      );

      void this.logStore.write({
        level: "error",
        message: "Request error",
        source: "http.request",
        context: {
          requestId: finalRequestId,
          method,
          path,
          durationMs,
          error: error?.message ?? "unknown",
        },
      });
    });

    next();
  }
}

