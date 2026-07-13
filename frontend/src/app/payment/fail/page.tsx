import type { Metadata } from "next";
import PaymentStatus from "@/components/payment-status";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";
import ProductPageShell from "@/components/product-page-shell";
import { createPageMetadata, privateRobots } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Оплата не завершена",
  description: "Оплата сайта-приглашения не была завершена.",
  path: "/payment/fail",
  robots: privateRobots,
});

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const query = await searchParams;
  const orderId = Array.isArray(query.order) ? query.order[0] : query.order;

  return (
    <ProductPageShell className="marketing-page payment-page">
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
    </ProductPageShell>
  );
}
