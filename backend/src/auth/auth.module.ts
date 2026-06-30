import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStore } from "./auth.store";
import { YandexIdService } from "./yandex-id.service";

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, AuthStore, YandexIdService],
})
export class AuthModule {}
