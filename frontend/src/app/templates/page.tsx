import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import CommerceFooter from "@/components/commerce-footer";
import ProductPageShell from "@/components/product-page-shell";
import TemplateCard from "@/components/template-card";
import { getEditorReadyTemplates } from "@/lib/invite-templates";
import { formatInviteSitePrice } from "@/lib/commerce";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Шаблоны приглашений",
  description:
    "Каталог шаблонов свадебных сайтов-приглашений: посмотрите живой превью и откройте редактор Send Invite.",
  path: "/templates",
});

type TemplatesPageProps = {
  searchParams: Promise<{ site?: string | string[] }>;
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const query = await searchParams;
  const siteId = Array.isArray(query.site) ? query.site[0] : query.site;
  const templates = getEditorReadyTemplates();

  return (
    <ProductPageShell className="marketing-page">
      <SiteHeader active="templates" />

      <main className="templates-page">
        <section className="templates-page__hero">
          <p className="marketing-eyebrow">
            {siteId ? "Смена оформления" : "Каталог"}
          </p>
          <h1>
            {siteId ? "Выберите новый шаблон" : "Выберите шаблон приглашения"}
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
            <strong>{formatInviteSitePrice()}</strong>
            <small>разовая оплата</small>
          </div>
        </section>

        <section aria-label="Список шаблонов" className="templates-page__grid">
          {templates.map((template, index) => (
            <TemplateCard
              eagerImage={index === 0}
              index={index}
              key={template.id}
              paletteCarousel
              siteId={siteId}
              template={template}
            />
          ))}
        </section>
      </main>
      <CommerceFooter />
    </ProductPageShell>
  );
}
