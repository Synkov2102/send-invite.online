import type { Metadata } from "next";
import PaymentStatus from "@/components/payment-status";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";
import {
  confirmRobokassaSuccessRedirect,
  readRobokassaSearchParam,
} from "@/lib/payments";

export const metadata: Metadata = {
  title: "Статус оплаты",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] } & Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const orderId = Array.isArray(query.order) ? query.order[0] : query.order;
  const shpOrder = readRobokassaSearchParam(query, "Shp_order", "shp_order");
  const outSum = readRobokassaSearchParam(query, "OutSum", "outSum");
  const invId = readRobokassaSearchParam(query, "InvId", "InvID", "invoiceID");
  const signature = readRobokassaSearchParam(query, "SignatureValue", "signatureValue");
  const confirmedOrderId =
    shpOrder && orderId && shpOrder !== orderId ? null : (shpOrder ?? orderId);

  if (confirmedOrderId && outSum && invId && signature) {
    await confirmRobokassaSuccessRedirect({
      invId,
      orderId: confirmedOrderId,
      outSum,
      signature,
    });
  }

  return (
    <div className="marketing-page payment-page">
      <SiteHeader />
      <main className="payment-shell">
        {orderId ? (
          <PaymentStatus orderId={orderId} />
        ) : (
          <section className="payment-panel is-failed">
            <h1>Заказ не найден</h1>
            <p>Вернитесь в личный кабинет и проверьте состояние сайта.</p>
          </section>
        )}
      </main>
      <CommerceFooter />
    </div>
  );
}
