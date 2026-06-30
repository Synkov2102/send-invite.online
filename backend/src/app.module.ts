import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { SitesModule } from "./sites/sites.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env.local", ".env", "../.env.local", "../.env"],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 120, ttl: 60_000 }],
    }),
    DatabaseModule,
    AuthModule,
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
