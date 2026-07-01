import BrandLockup from "@/components/brand-lockup";
import SiteHeader from "@/components/site-header";
import TemplateCard from "@/components/template-card";
import WaterBackground from "@/invitation-templates/aqua/water-background";
import { brand } from "@/lib/brand";
import { defaultInviteTemplates } from "@/lib/invite-templates";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  LayoutTemplate,
  MessageCircle,
  Palette,
  Send,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./page.module.css";

const HERO_CHECKS = ["Без кода", "Адаптивно", "RSVP внутри"] as const;

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

const benefits: FeatureItem[] = [
  {
    icon: LayoutTemplate,
    title: "Дизайн с характером",
    text: "Современные шаблоны, которые выглядят как работа студии, а не конструктор.",
  },
  {
    icon: Palette,
    title: "Ваши цвета и детали",
    text: "Настройте палитру, фотографии, тексты и атмосферу именно вашего дня.",
  },
  {
    icon: MessageCircle,
    title: "RSVP без переписок",
    text: "Ответы гостей, пожелания и важные детали собираются в одном месте.",
  },
  {
    icon: Send,
    title: "Одна красивая ссылка",
    text: "Отправьте приглашение в мессенджере — оно идеально откроется на любом экране.",
  },
];

const steps: FeatureItem[] = [
  {
    icon: LayoutTemplate,
    title: "Выберите основу",
    text: "Найдите дизайн, который совпадает с настроением свадьбы.",
  },
  {
    icon: Wand2,
    title: "Добавьте свою историю",
    text: "Заполните детали дня, загрузите фотографии и настройте цвета.",
  },
  {
    icon: Send,
    title: "Поделитесь с гостями",
    text: "Опубликуйте сайт и отправьте одну аккуратную ссылку.",
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

function formatSectionIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function HomePage() {
  const featured = defaultInviteTemplates.slice(0, 3);

  return (
    <div className={styles.page}>
      <WaterBackground className={styles.liquidBackground} {...LANDING_BACKGROUND} />
      <SiteHeader active="home" />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <Eyebrow>Сайты-приглашения для свадьбы</Eyebrow>
            <h1>
              Ваш день.
              <span>В одном красивом сайте.</span>
            </h1>
            <p className={styles.heroLead}>
              Создайте современное приглашение с программой, адресом, дресс-кодом
              и RSVP. Без дизайнера, кода и десятков сообщений.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/templates">
                Создать приглашение <ArrowRight aria-hidden size={17} />
              </Link>
              <Link
                className={styles.secondaryButton}
                href={`/editor?template=${featured[0].id}`}
              >
                Открыть редактор
              </Link>
            </div>
            <ul className={styles.heroChecks} aria-label="Преимущества сервиса">
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
                  src="/images/wedding-mountain-cover.png"
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
              <strong>Сохрани дату</strong>
            </div>
            <div className={styles.rsvpBadge}>
              <span className={styles.rsvpIcon}>
                <Check aria-hidden size={14} />
              </span>
              <div>
                <strong>Гость ответил</strong>
                <span>Буду с радостью</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.benefits} aria-label={`Возможности ${brand.name}`}>
          {benefits.map((benefit, index) => (
            <article key={benefit.title}>
              <span className={styles.benefitNumber}>{formatSectionIndex(index)}</span>
              <benefit.icon aria-hidden size={20} />
              <h2>{benefit.title}</h2>
              <p>{benefit.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.templates}>
          <div className={styles.sectionHeading}>
            <div>
              <Eyebrow>Коллекция</Eyebrow>
              <h2>
                Начните с дизайна,
                <br />
                который уже всё чувствует.
              </h2>
            </div>
            <Link href="/templates">
              Все шаблоны <ArrowRight aria-hidden size={16} />
            </Link>
          </div>
          <div className={styles.templateGrid}>
            {featured.map((template, index) => (
              <TemplateCard
                className={styles.templateCard}
                imageSizes="(max-width: 760px) 92vw, 31vw"
                index={index}
                key={template.id}
                template={template}
                titleAs="h3"
              />
            ))}
          </div>
        </section>

        <section className={styles.workflow}>
          <div className={styles.workflowIntro}>
            <Eyebrow>Три простых шага</Eyebrow>
            <h2>От идеи до ссылки — за один вечер.</h2>
            <p>
              Редактор ведёт по шагам и сразу показывает результат. Вы занимаетесь
              свадьбой, а не настройками сайта.
            </p>
            <Link href="/templates">
              Начать с шаблона <ArrowRight aria-hidden size={16} />
            </Link>
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
              src="/images/wedding-mountain-portrait.png"
            />
          </div>
          <div className={styles.storyCopy}>
            <Heart aria-hidden size={22} />
            <Eyebrow>Больше, чем приглашение</Eyebrow>
            <h2>Первое впечатление от вашего дня.</h2>
            <p>
              Гости почувствуют атмосферу свадьбы ещё до праздника. Все важные
              детали будут рядом — красиво, понятно и в вашем стиле.
            </p>
            <ul>
              <li>
                <Check aria-hidden size={15} /> Программа и адрес площадки
              </li>
              <li>
                <Check aria-hidden size={15} /> Дресс-код и пожелания
              </li>
              <li>
                <Check aria-hidden size={15} /> Ответы гостей через RSVP
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.cta}>
          <Sparkles aria-hidden size={22} />
          <p>Ваше приглашение может быть готово сегодня</p>
          <h2>Создайте красивое начало вашей истории.</h2>
          <Link href="/templates">
            Выбрать шаблон <ArrowRight aria-hidden size={17} />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link aria-label={brand.homeAriaLabel} href="/">
          <BrandLockup showDomain />
        </Link>
        <p>Современные сайты-приглашения для вашего самого важного дня.</p>
        <nav aria-label="Навигация в подвале">
          <Link href="/templates">Шаблоны</Link>
          <Link href="/auth">Войти</Link>
        </nav>
      </footer>
    </div>
  );
}
