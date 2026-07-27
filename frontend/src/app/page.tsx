import CommerceFooter from "@/components/commerce-footer";
import JsonLd from "@/components/json-ld";
import ProductPageShell from "@/components/product-page-shell";
import SiteHeader from "@/components/site-header";
import StickyTemplatesCta from "@/components/sticky-templates-cta";
import TemplateCard from "@/components/template-card";
import TrackedLink from "@/components/tracked-link";
import ValuePropsCarousel from "@/components/value-props-carousel";
import WaterBackground from "@/invitation-templates/aqua/water-background";
import { brand } from "@/lib/brand";
import { defaultInviteTemplates } from "@/lib/invite-templates";
import { formatInviteSitePrice } from "@/lib/commerce";
import {
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  LayoutTemplate,
  Send,
  Sparkles,
  Wand2,
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

const HERO_CHECKS = [
  "Сборка примерно за 10 минут",
  "Удобно на телефоне и компьютере",
  "RSVP и ответы в одном месте",
] as const;

const LANDING_BACKGROUND = {
  deep: "#fffaf7",
  foam: "#ff5f7f",
  shallow: "#efd7de",
} as const;

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const steps: FeatureItem[] = [
  {
    icon: LayoutTemplate,
    title: "Выберите шаблон",
    text: "Найдите оформление под настроение свадьбы — от минимализма и editorial до живых фото и анимации.",
  },
  {
    icon: Wand2,
    title: "Заполните детали",
    text: "Добавьте дату, адрес, программу, фотографии и пожелания. Палитру и тексты можно менять в любой момент.",
  },
  {
    icon: Send,
    title: "Опубликуйте и отправьте",
    text: "После оплаты получите персональную ссылку — одну, аккуратную, готовую для мессенджера.",
  },
];

const faqItems = [
  {
    question: "Что входит в сайт-приглашение на свадьбу?",
    answer:
      "В приглашении можно разместить дату и программу дня, адрес с картой, фотографии, дресс-код, пожелания и форму RSVP. Ответы гостей собираются в личном кабинете.",
  },
  {
    question: "Нужно ли уметь делать сайты?",
    answer:
      "Нет. Вы выбираете готовый шаблон и заполняете понятные поля, а изменения сразу видны в превью. Код, отдельный хостинг и помощь дизайнера не нужны.",
  },
  {
    question: "Как отправить готовое приглашение гостям?",
    answer:
      "После публикации вы получите персональную ссылку. Её можно отправить в мессенджере, по почте или в SMS — приглашение адаптируется к телефону, планшету и компьютеру.",
  },
  {
    question: "Сколько действует ссылка на приглашение?",
    answer:
      "Опубликованный сайт доступен до даты торжества и ещё 10 дней после неё, чтобы гости успели открыть приглашение и подтвердить присутствие.",
  },
] as const;

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className={styles.eyebrow}>
      <span />
      {children}
    </p>
  );
}

function formatSectionIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function HomePage() {
  const featured = defaultInviteTemplates.slice(0, 3);

  return (
    <ProductPageShell className={styles.page}>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildWebSiteJsonLd(),
          buildWebApplicationJsonLd(),
        ]}
      />
      <WaterBackground className={styles.liquidBackground} {...LANDING_BACKGROUND} />
      <SiteHeader active="home" />

      <main>
        <section className={styles.hero} id="hero">
          <div className={styles.heroCopy}>
            <Eyebrow>Свадебные сайты-приглашения</Eyebrow>
            <h1>
              Сайт-приглашение на свадьбу,
              <span>которое хочется открыть.</span>
            </h1>
            <p className={styles.heroLead}>
              Соберите сайт с программой, адресом, дресс-кодом и формой RSVP.
              Редактор показывает результат сразу — без дизайнера, кода и бесконечных
              правок в переписке.
            </p>
            <div className={styles.heroPrice}>
              <span>Создание и публикация одного сайта-приглашения</span>
              <strong>{formatInviteSitePrice()}</strong>
              <small>разовая оплата · электронная услуга</small>
            </div>
            <div className={styles.heroActions}>
              <TrackedLink
                className={styles.primaryButton}
                goal="hero_primary_click"
                href="/templates"
              >
                Выбрать шаблон <ArrowRight aria-hidden size={17} />
              </TrackedLink>
              <TrackedLink
                className={styles.secondaryButton}
                goal="hero_secondary_click"
                href={`/editor?template=${featured[0].id}&preview=1`}
              >
                Посмотреть шаблон
              </TrackedLink>
            </div>
            <p className={styles.heroTrust}>
              Результат видно в редакторе бесплатно — платите только за публикацию.
            </p>
            <ul className={styles.heroChecks} aria-label="Ключевые преимущества">
              {HERO_CHECKS.map((item) => (
                <li key={item}>
                  <Check aria-hidden size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.previewWindow}>
              <div className={styles.previewBar}>
                <span />
                <span />
                <span />
                <p>
                  {brand.domain}/{brand.exampleInviteSlug}
                </p>
              </div>
              <div className={styles.previewPhoto}>
                <Image
                  alt="Свадебное приглашение Анны и Максима"
                  fill
                  priority
                  sizes="(max-width: 899px) 92vw, 48vw"
                  src="/images/homepage-wedding-couple.webp"
                />
                <div className={styles.previewShade} />
                <div className={styles.previewCopy}>
                  <small>мы женимся</small>
                  <strong>
                    Анна <i>&</i> Максим
                  </strong>
                  <time dateTime="2026-09-14">14 · 09 · 2026</time>
                </div>
              </div>
            </div>
            <div className={styles.dateBadge}>
              <CalendarDays aria-hidden size={17} />
              <span>14 сентября</span>
              <strong>Сохраните дату</strong>
            </div>
            <div className={styles.rsvpBadge}>
              <span className={styles.rsvpIcon}>
                <Check aria-hidden size={14} />
              </span>
              <div>
                <strong>Гость ответил</strong>
                <span>Приду с радостью</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.valueProps} aria-label="Преимущества сервиса">
          <div className={styles.valuePropsPanel}>
            <div className={styles.valuePropsIntro}>
              <Eyebrow>Почему {brand.name}</Eyebrow>
              <h2>Всё нужное — без лишних хлопот</h2>
              <p>
                Вы сами собираете приглашение за вечер, видите каждую деталь до
                публикации, собираете ответы гостей в одном месте и отправляете одну
                ссылку. Без подрядчиков, долгих согласований и сюрпризов в финале.
              </p>
            </div>
            <ValuePropsCarousel
              cardClassName={styles.valuePropsCard}
              gridClassName={styles.valuePropsGrid}
              iconClassName={styles.valuePropsIcon}
              numberClassName={styles.valuePropsNumber}
            />
          </div>
        </section>

        <section className={styles.templates}>
          <div className={styles.sectionHeading}>
            <div>
              <Eyebrow>Шаблоны</Eyebrow>
              <h2>
                Выберите настроение —
                <br />
                остальное подстроите сами.
              </h2>
            </div>
            <TrackedLink goal="templates_section_cta_click" href="/templates">
              Смотреть все шаблоны <ArrowRight aria-hidden size={16} />
            </TrackedLink>
          </div>
          <div className={styles.templateGrid}>
            {featured.map((template, index) => (
              <TemplateCard
                className={styles.templateCard}
                imageSizes="min(300px, 100vw)"
                index={index}
                key={template.id}
                template={template}
                titleAs="h3"
                trackingGoal="homepage_template_card_click"
              />
            ))}
          </div>
        </section>

        <section className={styles.workflow}>
          <div className={styles.workflowIntro}>
            <Eyebrow>Как это работает</Eyebrow>
            <h2>Три шага до готовой ссылки</h2>
            <p>
              Редактор не перегружает деталями: понятные этапы, живое превью и
              возможность вернуться к любому полю. Вы готовите свадьбу — а не
              разбираетесь в настройках сайта.
            </p>
            <TrackedLink goal="workflow_cta_click" href="/templates">
              Начать с шаблона <ArrowRight aria-hidden size={16} />
            </TrackedLink>
          </div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <article key={step.title}>
                <span>{formatSectionIndex(index)}</span>
                <div>
                  <step.icon aria-hidden size={20} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.story}>
          <div className={styles.storyPhoto}>
            <Image
              alt="Молодожёны в день свадьбы"
              fill
              sizes="(max-width: 899px) 92vw, 42vw"
              src="/images/homepage-wedding-story.webp"
            />
          </div>
          <div className={styles.storyCopy}>
            <Heart aria-hidden size={22} />
            <Eyebrow>Что получат гости</Eyebrow>
            <h2>Не просто дата — целое настроение дня</h2>
            <p>
              Гости сразу понимают, чего ждать: где собраться, во что одеться,
              как ответить. А вы собираете RSVP без бесконечных сообщений
              «а во сколько?» и «где это?».
            </p>
            <ul>
              <li>
                <Check aria-hidden size={15} /> Программа дня и адрес с картой
              </li>
              <li>
                <Check aria-hidden size={15} /> Дресс-код, пожелания и детали
              </li>
              <li>
                <Check aria-hidden size={15} /> Форма RSVP с ответами в личном кабинете
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.faq}>
          <div className={styles.faqIntro}>
            <Eyebrow>Частые вопросы</Eyebrow>
            <h2>Что важно знать перед созданием приглашения</h2>
            <p>
              Коротко о наполнении, публикации и сроке работы свадебного
              сайта-приглашения.
            </p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <Sparkles aria-hidden size={22} />
          <p>Начните сегодня — первый шаблон уже ждёт</p>
          <h2>Соберите приглашение, которым захочется поделиться</h2>
          <TrackedLink goal="final_cta_click" href="/templates">
            Выбрать шаблон <ArrowRight aria-hidden size={17} />
          </TrackedLink>
        </section>
      </main>

      <StickyTemplatesCta />
      <CommerceFooter />
    </ProductPageShell>
  );
}
