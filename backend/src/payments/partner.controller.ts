import { Controller, Get, Headers, Param, Query, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { getSessionToken } from "../auth/bearer-token";
import { PartnerStatsService } from "./partner-stats.service";

@Controller("partner")
export class PartnerController {
  constructor(
    private readonly authService: AuthService,
    private readonly partnerStats: PartnerStatsService,
  ) {}

  @Get("codes")
  async listCodes(
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.getUserOrThrow(authorization, cookieHeader);

    return this.partnerStats.listCodes(user.id);
  }

  @Get("codes/:id/stats")
  async getStats(
    @Param("id") id: string,
    @Query() query: Record<string, unknown>,
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.getUserOrThrow(authorization, cookieHeader);

    return this.partnerStats.getStats(user.id, id, query);
  }

  private async getUserOrThrow(authorization?: string, cookieHeader?: string) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт." });
    }

    return user;
  }
}
