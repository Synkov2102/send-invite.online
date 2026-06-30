import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

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
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const bodyLimit = process.env.JSON_BODY_LIMIT ?? "15mb";

  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));
  app.enableCors({
    origin: getCorsOrigin(),
  });
  app.setGlobalPrefix("api");

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
