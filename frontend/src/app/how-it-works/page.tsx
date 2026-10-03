import CommerceFooter from "@/components/commerce-footer";
import WeddingBannerCarousel from "@/components/wedding-banner-carousel";
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
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  Music2,
  Pencil,
  Plus,
  Upload,
  Palette,
  Minus,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Сайт-приглашение на свадьбу онлайн за 10 минут",
  path: "/how-it-works",
  description:
    "Дизайнерские сайты-приглашения на свадьбу. Ваши фото и любимая музыка, ответы гостей в личном кабинете и выгрузка в Excel. Создайте бесплатно — оплатите публикацию.",
});

const steps = [
  {
    title: "Выберите дизайн",
    text: "Откройте понравившийся шаблон. Шрифты, цвета и композиция уже продуманы дизайнерами.",
  },
  {
    title: "Добавьте вашу историю",
    text: "Заполните детали свадьбы, загрузите фотографии и подключите музыку. Посмотрите результат бесплатно.",
  },
  {
    title: "Опубликуйте и отправьте",
    text: "Оплатите публикацию и отправьте ссылку в мессенджере. Ответы появятся в вашем личном кабинете.",
  },
];
function getQuestions(price: string): { question: string; answer: ReactNode }[] {
  return [
    {
      question: "Сложно ли собрать сайт самому?",
      answer:
        "Нет. Дизайн уже готов: вы заполняете имена, дату, место и программу дня, добавляете фото и музыку. Навыки дизайна или программирования не нужны. Если фотографии и детали под рукой, хватит 10–15 минут.",
    },
    {
      question: "Сколько стоит и когда нужно платить?",
      answer: `Собрать приглашение и посмотреть его можно бесплатно. Платите один раз — ${price} — когда решите опубликовать сайт и отправить ссылку гостям. Без подписки и доплат за правки, смену шаблона или ответы гостей.`,
    },
    {
      question: "Что увидят гости и нужно ли им что-то устанавливать?",
      answer:
        "Гости открывают ссылку в браузере — на телефоне или компьютере, прямо из мессенджера. Ничего устанавливать и регистрироваться не нужно. Приглашение не попадает в поисковики: его увидят только те, кому вы отправили ссылку.",
    },
    {
      question: "Какие вопросы можно задать гостям?",
      answer:
        "Кроме «Придёте ли вы?» можно добавить свои вопросы с вариантами ответа — например, про меню, напитки, трансфер или ночёвку. Если ответы не нужны, анкету можно отключить.",
    },
    {
      question: "Где смотреть ответы гостей?",
      answer:
        "В личном кабинете: там видно, кто придёт и что выбрал. Список можно выгрузить в Excel и передать ведущему, кейтерингу или организатору.",
    },
    {
      question: "Можно ли что-то изменить после публикации?",
      answer:
        "Да, сколько угодно раз и бесплатно: время, адрес, программу, фотографии и даже сам шаблон. Ссылка остаётся прежней — гости сразу увидят обновлённую версию, пересылать ничего не нужно.",
    },
    {
      question: "Как долго сайт будет доступен?",
      answer:
        "До дня свадьбы и ещё 10 дней после него — гости успеют вернуться к приглашению и после праздника. Список ответов лучше заранее выгрузить в Excel.",
    },
    {
      question: "Можно ли поставить свою песню?",
      answer:
        "Да. Выберите трек из каталога, загрузите свой аудиофайл или вставьте прямую ссылку на файл. Ссылка на страницу трека в музыкальном сервисе не подойдёт — нужна ссылка именно на аудиофайл.",
    },
    {
      question: "Как проходит оплата?",
      answer: (
        <>
          Картой или через СБП на защищённой странице Robokassa, чек придёт на почту. Сайт
          публикуется автоматически через несколько секунд после оплаты, а ссылка появляется в
          личном кабинете. Условия возврата — на странице{" "}
          <Link href="/payment-and-refund">«Оплата и возврат»</Link>.
        </>
      ),
    },
  ];
}
const featuredStyles = [
  { id: "clarity-editorial", caption: "Минимализм и фотографии" },
  { id: "chapter-ticket", caption: "Приглашение-билет" },
  { id: "skazka-lubok", caption: "Иллюстрации и орнаменты" },
];

export default async function HowItWorksPage() {
  const templates = getEditorReadyTemplates();
  const pricing = await getInviteSitePricing();
  const discount = getSaleDiscountPercent(pricing);
  const featured = featuredStyles.flatMap((style) => {
    const template = templates.find((item) => item.id === style.id);
    return template ? [{ template, caption: style.caption }] : [];
  });
  return (
    <ProductPageShell className={styles.page}>
      <JsonLd
        data={[buildOrganizationJsonLd(), buildWebSiteJsonLd(), buildWebApplicationJsonLd()]}
      />
      <SiteHeader active="how-it-works" />
      <main>
        <PageShellProvider as="section" className={styles.hero} id="hero" width="wide">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Сайт-приглашение на свадьбу</p>
            <h1>
              Приглашение
              <br />
              <em>с характером.</em>
            </h1>

            <p className={styles.heroDescription}>
              Дизайнерское оформление уже готово. Добавьте ваши фото и любимую музыку, отправьте
              ссылку гостям — и собирайте их ответы в личном кабинете.
            </p>
            <TrackedLink className={styles.cta} goal="wedding_hero_click" href="#templates">
              Найти свой дизайн <ArrowRight aria-hidden size={18} />
            </TrackedLink>
            <p className={styles.freeNote}>
              <Check aria-hidden size={15} /> Создание и просмотр — бесплатно
            </p>
            <div className={styles.heroPrice}>
              <span>
                {discount !== null && <s>{formatRubPrice(pricing.originalPriceRub!)}</s>}
                <strong>{formatRubPrice(pricing.currentPriceRub)}</strong>
                {discount !== null && <b>−{discount}%</b>}
              </span>
              <span>Разовая оплата · до даты свадьбы + 10 дней</span>
            </div>
          </div>
          <WeddingBannerCarousel />
          <ul className={styles.heroBenefits} aria-label="Что входит в приглашение">
            <li>
              <Palette aria-hidden size={20} />
              <span>
                <strong>Оформление от дизайнеров</strong>Шрифты, цвета и композиция уже подобраны
              </span>
            </li>
            <li>
              <Pencil aria-hidden size={20} />
              <span>
                <strong>Правки без ожидания</strong>Меняйте детали сами, даже после публикации
              </span>
            </li>
            <li>
              <FileSpreadsheet aria-hidden size={20} />
              <span>
                <strong>Гости — в одном списке</strong>Ответы в личном кабинете и выгрузка в Excel
              </span>
            </li>
          </ul>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.collection} id="templates" width="wide">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Коллекция / {templates.length} дизайнов</p>
              <h2>
                Найдите <em className={styles.styleAccent}>свой стиль</em>
              </h2>
            </div>
            <p>
              Каждый шаблон нарисован дизайнерами: от сочетания шрифтов до композиции и отступов.
              Вам не нужно собирать оформление с нуля или ждать согласований.
            </p>
          </div>
          <div className={`templates-page__grid ${styles.templateGrid}`}>
            {featured.map(({ template, caption }, index) => (
              <TemplateCard
                index={index}
                actionLabel="Пример"
                caption={caption}
                key={template.id}
                pricing={pricing}
                template={template}
                titleAs="h3"
                trackingGoal="wedding_template_card_click"
              />
            ))}
          </div>
          <div className={styles.collectionFooter}>
            <span className={styles.collectionDescription}>
              Все возможности включены в стоимость публикации
            </span>
            <span className={styles.swipeHint}>
              Листайте дизайны <ArrowRight aria-hidden size={15} />
            </span>
            <TrackedLink
              className={styles.collectionButton}
              data-landing-cta
              goal="wedding_all_templates_click"
              href="/templates"
            >
              Все дизайны ({templates.length}) <ArrowRight aria-hidden size={17} />
            </TrackedLink>
          </div>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.features} width="wide">
          <div className={styles.featureGrid}>
            <article className={styles.personalization}>
              <p className={styles.eyebrow}>Ваши детали</p>
              <h2>
                Готовый дизайн —
                <br />
                ваша история
              </h2>
              <p>
                Расскажите вашу историю и добавьте детали дня. Подключите любую любимую композицию:
                из каталога, файлом или по прямой ссылке на аудио.
              </p>
              <div className={styles.musicScene}>
                <Image
                  alt="Фотографии пары в свадебном приглашении"
                  src="/images/quiet-cinema-cover.webp"
                  fill
                  sizes="(max-width: 800px) 100vw, 50vw"
                />
                <span className={styles.photoCaption}>
                  Ваши фотографии.
                  <br />
                  Ваше настроение.
                </span>
                <div className={styles.musicDemo} aria-label="Варианты подключения музыки">
                  <span className={styles.musicIcon}>
                    <Music2 aria-hidden size={26} />
                  </span>
                  <div>
                    <strong>Пусть звучит ваша песня</strong>
                    <span>Музыка для вашего приглашения</span>
                  </div>
                  <div aria-hidden className={styles.waveform}>
                    {[12, 24, 18, 32, 22, 38, 16, 28, 20].map((height, index) => (
                      <span key={index} style={{ height }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.musicOptions}>
                <span>
                  <Music2 aria-hidden size={14} /> Каталог
                </span>
                <span>
                  <Upload aria-hidden size={14} /> Свой файл
                </span>
                <span>
                  <Plus aria-hidden size={14} /> Ссылка на аудио
                </span>
              </div>
              <div className={styles.editNote}>
                <Pencil aria-hidden size={19} />
                <p>
                  <strong>Правки — в ваших руках</strong>Меняйте время, адрес и программу сами, без
                  переписки и ожидания дизайнера.
                </p>
              </div>
            </article>
            <article className={styles.rsvp}>
              <p className={styles.eyebrow}>Забота о гостях</p>
              <h2>
                Ответы гостей —
                <br />в одном кабинете
              </h2>
              <p>
                Гости отвечают на анкету прямо в приглашении. Все ответы собраны в личном кабинете —
                список легко выгрузить в Excel и передать организатору.
              </p>
              <div className={styles.responses}>
                <div className={styles.responseHeading}>
                  <strong>Ответы гостей</strong>
                  <span>Демонстрационный пример</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Гость</th>
                      <th>Ответ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Анна и Максим", attending: true },
                      { name: "Екатерина", attending: false },
                      { name: "Дмитрий и Ольга", attending: true },
                    ].map((guest) => (
                      <tr key={guest.name}>
                        <td>{guest.name}</td>
                        <td>
                          <span className={guest.attending ? undefined : styles.declined}>
                            {guest.attending ? (
                              <Check aria-hidden size={13} />
                            ) : (
                              <Minus aria-hidden size={13} />
                            )}{" "}
                            {guest.attending ? "Придём" : "Не смогу"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.export}>
                  <FileSpreadsheet aria-hidden size={17} /> Все ответы можно выгрузить в Excel
                </div>
              </div>
            </article>
          </div>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.process} id="how-it-works" width="wide">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>От идеи до первой отправленной ссылки</p>
              <h2>Три шага — и можно приглашать</h2>
            </div>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.pricingSection} id="price" width="wide">
          <div className={styles.pricingCard}>
            <div>
              <p className={styles.eyebrow}>Сначала попробуйте бесплатно</p>
              <h2>
                Создайте бесплатно.
                <br />
                Оплатите публикацию.
              </h2>
              <p>
                Создайте приглашение и посмотрите его глазами гостей. Оплата понадобится, когда вы
                решите поделиться сайтом.
              </p>
            </div>
            <div className={styles.priceOffer}>
              <span>Публикация сайта</span>
              <div className={styles.priceValue}>
                {discount !== null && <s>{formatRubPrice(pricing.originalPriceRub!)}</s>}
                <strong>{formatRubPrice(pricing.currentPriceRub)}</strong>
                {discount !== null && <b>−{discount}%</b>}
              </div>
              <p>Разовая оплата, без подписки</p>
              <p>Сайт доступен до даты свадьбы и ещё 10 дней после неё.</p>
              <ul>
                {[
                  "Выбранный дизайнерский шаблон",
                  "Ваши фотографии и музыка",
                  "Сбор ответов и выгрузка в Excel",
                ].map((text) => (
                  <li key={text}>
                    <Check aria-hidden size={15} />
                    {text}
                  </li>
                ))}
              </ul>
              <TrackedLink
                data-landing-cta
                className={styles.cta}
                goal="wedding_pricing_click"
                href="/templates"
              >
                Начать бесплатно <ArrowRight aria-hidden size={18} />
              </TrackedLink>
            </div>
          </div>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.faq} width="wide">
          <div>
            <p className={styles.eyebrow}>Остались вопросы?</p>
            <h2>
              Всё, что нужно
              <br />
              перед началом
            </h2>
          </div>
          <div>
            {getQuestions(formatRubPrice(pricing.currentPriceRub)).map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus aria-hidden size={18} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </PageShellProvider>
        <PageShellProvider as="section" className={styles.finalCta} width="wide">
          <h2>
            Выберите дизайн
            <br />и попробуйте бесплатно
          </h2>
          <TrackedLink
            data-landing-cta
            className={styles.cta}
            goal="wedding_bottom_cta_click"
            href="/templates"
          >
            Выбрать шаблон <ArrowRight aria-hidden size={18} />
          </TrackedLink>
        </PageShellProvider>
      </main>
      <StickyTemplatesCta goal="wedding_sticky_cta_click" inlineCtaSelector="[data-landing-cta]" />
      <CommerceFooter />
    </ProductPageShell>
  );
}
