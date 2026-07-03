import type { Metadata } from "next";
import PaymentStatus from "@/components/payment-status";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";

export const metadata: Metadata = {
  title: "Оплата не завершена",
  robots: { index: false, follow: false },
};

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const query = await searchParams;
  const orderId = Array.isArray(query.order) ? query.order[0] : query.order;

  return (
    <div className="marketing-page payment-page">
      <SiteHeader />
      <main className="payment-shell">
        {orderId ? (
          <PaymentStatus failed orderId={orderId} />
        ) : (
          <section className="payment-panel is-failed">
            <h1>Оплата не завершена</h1>
            <p>Вернитесь в личный кабинет и повторите оплату.</p>
          </section>
        )}
      </main>
      <CommerceFooter />
    </div>
  );
}
