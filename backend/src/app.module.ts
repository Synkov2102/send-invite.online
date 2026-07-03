import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { SitesModule } from "./sites/sites.module";
import { PaymentsModule } from "./payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../.env.backend.local", "../.env.backend.production"],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 120, ttl: 60_000 }],
    }),
    DatabaseModule,
    AuthModule,
    PaymentsModule,
    SitesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
