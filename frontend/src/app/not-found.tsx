import Link from "next/link";
import type { Metadata } from "next";
import CommerceFooter from "@/components/commerce-footer";
import PageShellProvider from "@/components/page-shell";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import { createPageMetadata, privateRobots } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Страница не найдена",
  description: "Запрошенная страница не найдена на Send Invite.",
  path: "/404",
  robots: privateRobots,
});

export default function NotFoundPage() {
  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader />
      <PageShellProvider as="main" className="legal-shell" width="narrow">
        <header className="legal-hero">
          <p className="marketing-eyebrow">404</p>
          <h1>Страница не найдена</h1>
          <p>Возможно, ссылка устарела или страница была удалена.</p>
        </header>
        <div className="auth-actions">
          <Link className="marketing-button marketing-button--primary" href="/">
            На главную
          </Link>
          <Link className="marketing-button marketing-button--ghost" href="/templates">
            К шаблонам
          </Link>
        </div>
      </PageShellProvider>
      <CommerceFooter />
    </ProductPageShell>
  );
}
