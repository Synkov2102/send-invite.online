import { Body, Controller, Get, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { getBearerToken } from "./bearer-token";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("yandex/callback")
  createYandexSession(@Body() body: unknown) {
    return this.authService.createYandexSession(body);
  }

  @Get("session")
  async getCurrentUser(@Headers("authorization") authorization?: string) {
    const user = await this.authService.getCurrentUser(getBearerToken(authorization));

    if (!user) {
      throw new UnauthorizedException("Session is not active.");
    }

    return { user };
  }

  @Post("logout")
  logout(@Headers("authorization") authorization?: string) {
    return this.authService.logout(getBearerToken(authorization));
  }
}
