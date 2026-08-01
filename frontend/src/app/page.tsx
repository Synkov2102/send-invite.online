import CommerceFooter from "@/components/commerce-footer";
import JsonLd from "@/components/json-ld";
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
import {
  ArrowRight,
  Check,
  ClipboardList,
  Clock3,
  Eye,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Сайт-приглашение на свадьбу онлайн за 10 минут",
  path: "/",
  description:
    "Создайте сайт-приглашение на свадьбу за 10 минут: выберите шаблон, добавьте детали и соберите ответы гостей через RSVP. Разовая оплата.",
});

const HERO_STATS = [
  { value: "11", label: "готовых шаблонов" },
  { value: "10 мин", label: "до готовой ссылки" },
  { value: "1", label: "ссылка для гостей" },
] as const;

type Benefit = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const benefits: Benefit[] = [
  {
    icon: Clock3,
    title: "Готово за 10 минут",
    text: "Выберите шаблон и добавьте детали свадьбы.",
  },
  {
    icon: Eye,
    title: "Результат виден сразу",
    text: "Меняйте текст и цвета прямо в редакторе.",
  },
  {
    icon: ClipboardList,
    title: "RSVP без переписок",
    text: "Ответы гостей собираются в личном кабинете.",
  },
];

type Step = {
  title: string;
  text: string;
};

const steps: Step[] = [
  {
    title: "Выберите шаблон",
    text: "11 готовых вариантов оформления.",
  },
  {
    title: "Добавьте детали",
    text: "Дата, место, программа и фотографии.",
  },
  {
    title: "Отправьте ссылку",
    text: "Сайт готов для гостей сразу после публикации.",
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

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
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
        <section className={styles.hero} id="hero">
          <div className={styles.heroStage}>
            <div className={styles.heroContent}>
              <Eyebrow>Для вашей свадьбы</Eyebrow>
              <h1>
                <span>Индивидуальный</span>
                <span>
                  сайт <em>за 10 минут</em>
                </span>
              </h1>
              <p className={styles.heroLead}>
                Все детали свадьбы и RSVP — в одном редакторе.
              </p>

              <div className={styles.heroRow}>
                <div className={styles.heroPrice}>
                  <span>Один сайт</span>
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
                  <small>{discountPercent !== null ? "Ограниченная скидка" : "разовая оплата"}</small>
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
                Создайте бесплатно. Оплата — при публикации.
              </p>

              <div className={styles.heroStats}>
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image
                alt="Невеста и жених на свадебной площадке"
                fill
                loading="eager"
                sizes="(max-width: 899px) calc(100vw - 50px), 540px"
                src="/images/homepage-hero-editorial-v2.webp"
                unoptimized
              />
              <div aria-hidden className={styles.heroTemplateTitle}>
                <span>wedding</span>
                <strong>26—06</strong>
              </div>
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
        </section>

        <section aria-label="Преимущества сервиса" className={styles.benefits}>
          <div className={styles.sectionIntro}>
            <Eyebrow>Возможности</Eyebrow>
            <h2>Всё главное уже внутри</h2>
          </div>
          <div className={styles.benefitsGrid}>
            {benefits.map((item, index) => (
              <article className={styles.benefitCard} key={item.title}>
                <span className={styles.benefitIndex}>{formatIndex(index)}</span>
                <item.icon aria-hidden className={styles.benefitIcon} size={22} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Как это работает" className={styles.workflow}>
          <div className={styles.workflowVisual}>
            <Image
              alt=""
              fill
              sizes="(max-width: 899px) calc(100vw - 34px), 520px"
              src="/images/homepage-wedding-couple.webp"
            />
            <div className={styles.workflowVisualCopy}>
              <span>Без дизайнера и ожидания</span>
              <strong>Соберите приглашение сами.</strong>
            </div>
          </div>
          <div className={styles.workflowContent}>
            <div className={styles.sectionIntro}>
              <Eyebrow>Как это работает</Eyebrow>
              <h2>Три шага — и готово</h2>
            </div>
            <ol className={styles.stepsRow}>
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span>{formatIndex(index)}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.templates} id="templates">
          <div className={styles.sectionIntro}>
            <Eyebrow>Шаблоны</Eyebrow>
            <h2>Выберите свой дизайн</h2>
            <p>Посмотрите демо и начните редактировать.</p>
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
        </section>
      </main>

      <StickyTemplatesCta />
      <CommerceFooter />
    </ProductPageShell>
  );
}
