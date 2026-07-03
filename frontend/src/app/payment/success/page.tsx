import type { Metadata } from "next";
import PaymentStatus from "@/components/payment-status";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";

export const metadata: Metadata = {
  title: "Статус оплаты",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({
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
