import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import type { NestModule } from "@nestjs/common";
import { MiddlewareConsumer } from "@nestjs/common";
import { ArticlesModule } from "./articles/articles.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { SitesModule } from "./sites/sites.module";
import { PaymentsModule } from "./payments/payments.module";
import { LogStore } from "./logs/log.store";
import { RequestLoggerMiddleware } from "./logging/request-logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../.env.backend.local", "../.env.backend.production"],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      // The hourly bucket is generous globally and tightened per route
      // (see RSVP in SitesController) to catch slow, sustained flooding.
      throttlers: [
        { name: "default", limit: 120, ttl: 60_000 },
        { name: "hourly", limit: 1_200, ttl: 3_600_000 },
      ],
    }),
    DatabaseModule,
    ArticlesModule,
    AuthModule,
    PaymentsModule,
    SitesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    LogStore,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("{*splat}");
  }
}
