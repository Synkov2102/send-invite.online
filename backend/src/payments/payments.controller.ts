import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Ip,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseFilters,
} from "@nestjs/common";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { getSessionToken } from "../auth/bearer-token";
import { PaymentsService } from "./payments.service";
import { RobokassaExceptionFilter } from "./robokassa-exception.filter";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly authService: AuthService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get("pricing")
  getPricing() {
    return this.paymentsService.getPricing();
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post("promo/preview")
  async previewPromo(
    @Body() body: unknown,
    @Ip() ip: string,
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт." });
    }

    return this.paymentsService.previewPromo(body, user, ip || null);
  }

  @Post("checkout")
  async createCheckout(
    @Body() body: unknown,
    @Ip() ip: string,
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт для оплаты." });
    }

    return this.paymentsService.createCheckout(body, user, ip || null);
  }

  @Get("orders/:id/status")
  getPublicOrderStatus(@Param("id") id: string) {
    return this.paymentsService.getPublicOrderStatus(id);
  }

  @Get("orders/:id")
  async getOrder(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string,
    @Headers("cookie") cookieHeader?: string,
  ) {
    const user = await this.authService.getCurrentUser(
      getSessionToken(authorization, cookieHeader),
    );

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт." });
    }

    return this.paymentsService.getOwnedOrder(id, user.id);
  }

  @SkipThrottle()
  @UseFilters(RobokassaExceptionFilter)
  @Post("robokassa/success")
  @Header("Content-Type", "text/plain; charset=utf-8")
  confirmSuccess(@Body() body: unknown) {
    return this.paymentsService.processSuccessRedirect(body);
  }

  @SkipThrottle()
  @UseFilters(RobokassaExceptionFilter)
  @Post("robokassa/result")
  @Header("Content-Type", "text/plain; charset=utf-8")
  processResultPost(@Req() request: Request, @Body() body: Record<string, unknown>) {
    const payload = Object.keys(body).length > 0 ? body : request.query;
    return this.paymentsService.processResult(payload);
  }

  @SkipThrottle()
  @UseFilters(RobokassaExceptionFilter)
  @Get("robokassa/result")
  @Header("Content-Type", "text/plain; charset=utf-8")
  processResultGet(@Query() query: Record<string, unknown>) {
    return this.paymentsService.processResult(query);
  }
}
