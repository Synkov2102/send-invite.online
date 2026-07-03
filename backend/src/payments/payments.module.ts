import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SitesModule } from "../sites/sites.module";
import { PaymentOrderStore } from "./payment-order.store";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  controllers: [PaymentsController],
  imports: [AuthModule, SitesModule],
  providers: [PaymentOrderStore, PaymentsService],
})
export class PaymentsModule {}
