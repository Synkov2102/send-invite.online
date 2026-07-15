import { Body, Controller, Get, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { getSessionToken } from "./bearer-token";
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
  async getCurrentUser(
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    if (!user) {
      throw new UnauthorizedException("Session is not active.");
    }

    return { user };
  }

  @Post("logout")
  logout(
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    return this.authService.logout(getSessionToken(authorization, cookieHeader));
  }
}
