import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SitesModule } from "../sites/sites.module";
import { PaymentOrderStore } from "./payment-order.store";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PromoCodeEventStore } from "./promo-code-event.store";
import { PromoCodeStore } from "./promo-code.store";
import { PromoService } from "./promo.service";
import { PromoUserUsageStore } from "./promo-user-usage.store";
import { RobokassaOpStateClient } from "./robokassa-op-state";
import { SitePricingStore } from "./site-pricing.store";

@Module({
  controllers: [PaymentsController],
  imports: [AuthModule, SitesModule],
  providers: [
    PaymentOrderStore,
    PaymentsService,
    PromoCodeEventStore,
    PromoCodeStore,
    PromoService,
    PromoUserUsageStore,
    RobokassaOpStateClient,
    SitePricingStore,
  ],
})
export class PaymentsModule {}
