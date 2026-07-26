import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

/**
 * Nest sits behind nginx + the Next.js BFF, so `req.ip` is the proxy address
 * unless X-Forwarded-For is trusted. Without this the throttler buckets every
 * visitor together and promo events log a useless IP.
 */
function getTrustProxy() {
  const value = process.env.TRUST_PROXY?.trim();

  if (!value) {
    return 1;
  }

  if (value === "false") {
    return false;
  }

  const hops = Number(value);

  return Number.isInteger(hops) && hops >= 0 ? hops : value;
}

function getCorsOrigin() {
  const value = process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN;

  if (!value) {
    return ["http://localhost:3000"];
  }

  if (value === "*") {
    if (process.env.NODE_ENV === "production") {
      const frontendOrigin = process.env.FRONTEND_ORIGIN;

      return frontendOrigin ? [frontendOrigin] : false;
    }

    return true;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const bodyLimit = process.env.JSON_BODY_LIMIT ?? "15mb";

  app.set("trust proxy", getTrustProxy());
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));
  app.enableCors({
    origin: getCorsOrigin(),
  });
  app.setGlobalPrefix("api");

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
