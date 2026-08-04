import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";
import PageShellProvider from "@/components/page-shell";
import ProductPageShell from "@/components/product-page-shell";
import TemplateCard from "@/components/template-card";
import { getInviteSitePricing } from "@/lib/backend-api";
import { getEditorReadyTemplates } from "@/lib/invite-templates";
import { formatRubPrice, getSaleDiscountPercent } from "@/lib/commerce";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Шаблоны сайтов-приглашений на свадьбу",
  description:
    "Выберите шаблон свадебного сайта-приглашения, посмотрите живое превью и настройте тексты, фотографии, палитру и RSVP в редакторе.",
  path: "/templates",
});

type TemplatesPageProps = {
  searchParams: Promise<{ site?: string | string[] }>;
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const query = await searchParams;
  const siteId = Array.isArray(query.site) ? query.site[0] : query.site;
  const templates = getEditorReadyTemplates();
  const pricing = await getInviteSitePricing();
  const discountPercent = getSaleDiscountPercent(pricing);

  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader active="templates" />

      <PageShellProvider as="main" className="templates-page" width="wide">
        <section className="templates-page__hero">
          <p className="marketing-eyebrow">
            {siteId ? "Смена оформления" : "Каталог"}
          </p>
          <h1>
            {siteId
              ? "Выберите новый шаблон"
              : "Шаблоны свадебных сайтов-приглашений"}
          </h1>
          <p>
            Сначала посмотрите живой сайт на весь экран, затем откройте редактор —
            обложку, палитру и тексты можно изменить в любой момент.
          </p>
          <p className="templates-page__service">
            Услуга: создание и публикация одного сайта-приглашения с уникальной ссылкой,
            редактором, шаблоном и формой RSVP.
          </p>
          <div className="templates-page__price">
            <span>Создание и публикация одного сайта</span>
            <strong>
              {discountPercent !== null ? (
                <s>{formatRubPrice(pricing.originalPriceRub as number)}</s>
              ) : null}
              {formatRubPrice(pricing.currentPriceRub)}
            </strong>
            <small>{discountPercent !== null ? `Скидка −${discountPercent}%` : "разовая оплата"}</small>
          </div>
        </section>

        <section aria-label="Список шаблонов" className="templates-page__grid">
          {templates.map((template, index) => (
            <TemplateCard
              eagerImage={index === 0}
              index={index}
              key={template.id}
              paletteCarousel
              pricing={pricing}
              siteId={siteId}
              template={template}
            />
          ))}
        </section>
      </PageShellProvider>
      <CommerceFooter />
    </ProductPageShell>
  );
}
