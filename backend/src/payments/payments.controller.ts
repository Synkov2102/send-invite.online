import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { getBearerToken } from "../auth/bearer-token";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly authService: AuthService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post("checkout")
  async createCheckout(
    @Body() body: unknown,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.authService.getCurrentUser(getBearerToken(authorization));

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт для оплаты." });
    }

    return this.paymentsService.createCheckout(body, user);
  }

  @Get("orders/:id/status")
  getPublicOrderStatus(@Param("id") id: string) {
    return this.paymentsService.getPublicOrderStatus(id);
  }

  @Get("orders/:id")
  async getOrder(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string,
  ) {
    const user = await this.authService.getCurrentUser(getBearerToken(authorization));

    if (!user) {
      throw new UnauthorizedException({ error: "Войдите в аккаунт." });
    }

    return this.paymentsService.getOwnedOrder(id, user.id);
  }

  @Post("robokassa/result")
  @Header("Content-Type", "text/plain; charset=utf-8")
  processResultPost(@Body() body: Record<string, unknown>) {
    return this.paymentsService.processResult(body);
  }

  @Get("robokassa/result")
  @Header("Content-Type", "text/plain; charset=utf-8")
  processResultGet(@Query() query: Record<string, unknown>) {
    return this.paymentsService.processResult(query);
  }
}
