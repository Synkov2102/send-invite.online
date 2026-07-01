import SiteHeader from "@/components/site-header";
import TemplateCard from "@/components/template-card";
import { getEditorReadyTemplates } from "@invite/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Шаблоны приглашений",
  description: "Выберите стиль свадебного приглашения и откройте его в редакторе.",
};

type TemplatesPageProps = {
  searchParams: Promise<{ site?: string | string[] }>;
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const query = await searchParams;
  const siteId = Array.isArray(query.site) ? query.site[0] : query.site;
  const templates = getEditorReadyTemplates();

  return (
    <div className="marketing-page">
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
            Каждый шаблон открывается в редакторе с подходящей обложкой и цветовой
            темой. Палитру и тексты можно изменить в любой момент.
          </p>
        </section>

        <section aria-label="Список шаблонов" className="templates-page__grid">
          {templates.map((template, index) => (
            <TemplateCard
              index={index}
              key={template.id}
              siteId={siteId}
              template={template}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
