import CommerceFooter from "@/components/commerce-footer";
import JsonLd from "@/components/json-ld";
import PageShellProvider from "@/components/page-shell";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import StickyTemplatesCta from "@/components/sticky-templates-cta";
import TemplateCard from "@/components/template-card";
import TrackedLink from "@/components/tracked-link";
import { getInviteSitePricing } from "@/lib/backend-api";
import { formatRubPrice, getSaleDiscountPercent } from "@/lib/commerce";
import { getEditorReadyTemplates } from "@/lib/invite-templates";
import {
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, ClipboardCheck, Eye, Timer } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Сайт-приглашение на свадьбу онлайн за 10 минут",
  path: "/",
  description:
    "Создайте сайт-приглашение на свадьбу за 10 минут: выберите шаблон, добавьте детали и соберите ответы гостей через RSVP. Разовая оплата.",
});

/** Формы для 1 / 2–4 / 5+ (шаблон, шаблона, шаблонов). */
function pluralizeRu(count: number, [one, few, many]: readonly [string, string, string]) {
  const rule = new Intl.PluralRules("ru").select(count);
  return rule === "one" ? one : rule === "few" ? few : many;
}

function getHeroStats(templateCount: number) {
  return [
    {
      value: String(templateCount),
      label: pluralizeRu(templateCount, [
        "готовый шаблон",
        "готовых шаблона",
        "готовых шаблонов",
      ]),
    },
    { value: "10 мин", label: "на сборку" },
    { value: "0 ₽", label: "до публикации" },
  ];
}

type Benefit = {
  icon: LucideIcon;
  imageSrc: string;
  title: string;
  text: string;
};

const benefits: Benefit[] = [
  {
    icon: Timer,
    imageSrc: "/images/brand/benefit-ready-10-min-v3.webp",
    title: "Быстрее, чем обзвонить гостей",
    text: "Выбрали шаблон, вписали имена, дату и место — ссылка готова.",
  },
  {
    icon: Eye,
    imageSrc: "/images/brand/benefit-live-preview-v4.webp",
    title: "Видите то же, что гости",
    text: "Меняете текст, фото и цвета — превью обновляется на лету.",
  },
  {
    icon: ClipboardCheck,
    imageSrc: "/images/brand/benefit-rsvp-v3.webp",
    title: "Ответы гостей — в одной таблице",
    text: "Кто придёт, с кем — и ответы на ваши вопросы. Без переписок и напоминаний.",
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className={styles.eyebrow}>
      <span />
      {children}
    </p>
  );
}

export default async function HomePage() {
  const templates = getEditorReadyTemplates();
  const pricing = await getInviteSitePricing();
  const discountPercent = getSaleDiscountPercent(pricing);

  return (
    <ProductPageShell className={styles.page}>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildWebSiteJsonLd(),
          buildWebApplicationJsonLd(),
        ]}
      />
      <SiteHeader active="home" />

      <main>
        <PageShellProvider as="section" className={styles.hero} id="hero" width="wide">
          <div className={styles.heroStage}>
            <div className={styles.heroContent}>
              <Eyebrow>Без дизайнера и программиста</Eyebrow>
              <h1>
                <span>Сайт-приглашение</span>
                <span>на свадьбу</span>
                <span>
                  <em>за 10 минут</em>
                </span>
              </h1>
              <p className={styles.heroLead}>
                Программа дня, место на карте, дресс-код и анкета для гостей — одной
                ссылкой, которую удобно отправить в любой мессенджер.
              </p>

              <div className={styles.heroRow}>
                <div className={styles.heroPrice}>
                  <span>Сайт под ключ</span>
                  <div className={styles.heroPriceValue}>
                    {discountPercent !== null ? (
                      <s className={styles.heroPriceOld}>
                        {formatRubPrice(pricing.originalPriceRub as number)}
                      </s>
                    ) : null}
                    <strong>{formatRubPrice(pricing.currentPriceRub)}</strong>
                    {discountPercent !== null ? (
                      <b className={styles.heroPriceBadge}>−{discountPercent}%</b>
                    ) : null}
                  </div>
                  <small>Разовая оплата, без подписки</small>
                </div>
                <TrackedLink
                  className={styles.primaryButton}
                  goal="hero_primary_click"
                  href="#templates"
                >
                  Выбрать шаблон <ArrowRight aria-hidden size={17} />
                </TrackedLink>
              </div>

              <p className={styles.heroTrust}>
                <Check aria-hidden size={14} />
                Собирайте бесплатно — платите, только когда решите опубликовать.
              </p>

              <div className={styles.heroStats}>
                {getHeroStats(templates.length).map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image
                alt="Невеста и жених рядом с маскотом сервиса приглашений"
                fill
                loading="eager"
                quality={90}
                sizes="(max-width: 899px) calc(100vw - 50px), 560px"
                src="/images/brand/homepage-mascot-delivery-clean.webp"
              />
              <div className={styles.heroVisualBadge}>
                <Check aria-hidden size={14} />
                Живой сайт
              </div>
              <div className={styles.heroVisualCaption}>
                <span>Так увидят гости</span>
                <strong>Красиво на любом экране</strong>
              </div>
            </div>
          </div>
        </PageShellProvider>

        <PageShellProvider
          aria-label="Преимущества сервиса"
          as="section"
          className={styles.benefits}
          width="wide"
        >
          <div className={styles.sectionIntro}>
            <Eyebrow>Возможности</Eyebrow>
            <h2>Всё в одной ссылке</h2>
            <p>
              Дата, место на карте, программа, дресс-код, музыка и чат гостей — на одной
              странице. Гости не звонят с вопросами «а во сколько?» и «а где парковка?».
            </p>
          </div>
          <div className={styles.benefitsGrid}>
            {benefits.map((item) => (
              <article className={styles.benefitCard} key={item.title}>
                <div aria-hidden className={styles.benefitImage}>
                  <Image
                    alt=""
                    fill
                    sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 899px) 300px, 390px"
                    src={item.imageSrc}
                  />
                  <span className={styles.benefitIcon}>
                    <item.icon aria-hidden size={18} strokeWidth={2.1} />
                  </span>
                </div>
                <div className={styles.benefitBody}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </PageShellProvider>

        <PageShellProvider as="section" className={styles.templates} id="templates" width="wide">
          <div className={styles.sectionIntro}>
            <Eyebrow>Шаблоны</Eyebrow>
            <h2>
              {templates.length}{" "}
              {pluralizeRu(templates.length, ["дизайн", "дизайна", "дизайнов"])} на выбор
            </h2>
            <p>
              От классики до авиабилета. Листайте карточку, чтобы примерить цвета, — и
              нажмите, чтобы начать заполнять.
            </p>
          </div>
          <div className={`templates-page__grid ${styles.templateGrid}`}>
            {templates.map((template, index) => (
              <TemplateCard
                eagerImage={index === 0}
                index={index}
                key={template.id}
                paletteCarousel
                pricing={pricing}
                template={template}
                titleAs="h3"
                trackingGoal="homepage_template_card_click"
              />
            ))}
          </div>
        </PageShellProvider>
      </main>

      <StickyTemplatesCta />
      <CommerceFooter />
    </ProductPageShell>
  );
}
