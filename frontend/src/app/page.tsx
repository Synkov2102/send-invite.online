import SiteHeader from "@/components/site-header";
import { defaultInviteTemplates } from "@/lib/invite-templates";
import {
  ArrowRight,
  CalendarHeart,
  Check,
  Heart,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const steps = [
  {
    icon: Palette,
    title: "Выберите настроение",
    text: "Начните с готового дизайна и палитры, которые подходят именно вашей истории.",
  },
  {
    icon: Wand2,
    title: "Добавьте ваши детали",
    text: "Имена, дата, программа, дресс-код и контакты — всё меняется прямо в редакторе.",
  },
  {
    icon: Sparkles,
    title: "Пригласите гостей",
    text: "Отправьте одну красивую ссылку и соберите ответы гостей в удобной RSVP-форме.",
  },
];

const assurances = ["Без кода", "Готово за один вечер", "RSVP уже внутри"];

export default async function HomePage() {
  const inviteTemplates = defaultInviteTemplates;
  const featured = inviteTemplates.slice(0, 3);

  return (
    <div className="marketing-page">
      <SiteHeader active="home" />

      <main>
        <section className="marketing-hero">
          <div className="marketing-hero__copy">
            <p className="marketing-eyebrow">Свадебные сайты-приглашения</p>
            <h1>
              Приглашение, с которого начинается
              <span> ваша свадьба</span>
            </h1>
            <p className="marketing-hero__lead">
              Соберите камерный и красивый сайт о вашем дне. Гости сразу увидят
              программу, адрес и дресс-код, а вы получите их ответы без лишних
              сообщений.
            </p>
            <div className="marketing-hero__actions">
              <Link className="marketing-button marketing-button--primary" href="/templates">
                Выбрать дизайн
                <ArrowRight aria-hidden size={16} />
              </Link>
              <Link
                className="marketing-button marketing-button--ghost"
                href={`/editor?template=${inviteTemplates[0].id}`}
              >
                Попробовать редактор
              </Link>
            </div>
            <ul className="marketing-assurances" aria-label="Преимущества сервиса">
              {assurances.map((item) => (
                <li key={item}>
                  <Check aria-hidden size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="marketing-hero__visual">
            <div className="marketing-hero__halo" />
            <figure className="marketing-hero__photo">
              <Image
                alt="Молодожёны идут по полю на фоне гор"
                fill
                priority
                sizes="(max-width: 899px) 88vw, 42vw"
                src="/images/wedding-mountain-cover.png"
              />
            </figure>
            <div className="marketing-date-card">
              <span>сентябрь</span>
              <strong>14</strong>
              <small>2026 · Алматы</small>
            </div>
            <div className="marketing-invite-card">
              <Heart aria-hidden size={15} />
              <p>Мы женимся</p>
              <strong>Владлен <i>&</i> Диана</strong>
              <span>Приглашаем разделить этот день с нами</span>
            </div>
          </div>
        </section>

        <section className="marketing-promise" aria-label="О сервисе">
          <p>Одна красивая ссылка вместо десятков сообщений</p>
          <div>
            <span><strong>5 минут</strong> на первые настройки</span>
            <span><strong>100%</strong> адаптивно для телефона</span>
            <span><strong>1 место</strong> для всех деталей дня</span>
          </div>
        </section>

        <section className="marketing-section marketing-section--featured">
          <div className="marketing-section__head marketing-section__head--split">
            <div>
              <p className="marketing-eyebrow">Коллекция</p>
              <h2>Дизайны с характером,<br />как и ваша история</h2>
            </div>
            <Link className="marketing-link" href="/templates">
              Смотреть все шаблоны
              <ArrowRight aria-hidden size={15} />
            </Link>
          </div>
          <div className="marketing-featured">
            {featured.map((template, index) => (
              <Link
                key={template.id}
                className="marketing-featured__card"
                href={`/editor?template=${template.id}`}
                style={
                  {
                    "--card-bg": template.preview.background,
                    "--card-surface": template.preview.surface,
                    "--card-ink": template.preview.ink,
                    "--card-accent": template.preview.accent,
                  } as CSSProperties
                }
              >
                <span className="marketing-featured__number">0{index + 1}</span>
                <div className="marketing-featured__art">
                  <span />
                  <span />
                  <Heart aria-hidden size={16} />
                </div>
                <div>
                  <small>{template.tags.join(" · ")}</small>
                  <h3>{template.name}</h3>
                  <span className="marketing-featured__action">
                    Открыть в редакторе <ArrowRight aria-hidden size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-process">
          <div className="marketing-process__intro">
            <p className="marketing-eyebrow">Всё просто</p>
            <h2>Вы занимаетесь свадьбой.<br /><span>Мы — приглашением.</span></h2>
            <p>
              Редактор устроен так, чтобы вы думали о гостях и атмосфере, а не о
              настройках сайта.
            </p>
          </div>
          <div className="marketing-steps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span className="marketing-steps__index">0{index + 1}</span>
                <div className="marketing-steps__icon">
                  <step.icon aria-hidden size={19} />
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-story">
          <div className="marketing-story__photo">
            <Image
              alt="Портрет молодожёнов в день свадьбы"
              fill
              sizes="(max-width: 899px) 100vw, 46vw"
              src="/images/wedding-mountain-portrait.png"
            />
          </div>
          <div className="marketing-story__copy">
            <CalendarHeart aria-hidden size={23} />
            <p className="marketing-eyebrow">Всё важное рядом</p>
            <h2>Гости почувствуют атмосферу ещё до праздника</h2>
            <p>
              Сайт открывается как небольшая история: знакомит с настроением дня,
              бережно рассказывает детали и помогает каждому гостю подготовиться.
            </p>
            <ul>
              <li><Check aria-hidden size={15} /> Программа и адрес площадки</li>
              <li><Check aria-hidden size={15} /> Дресс-код и пожелания</li>
              <li><Check aria-hidden size={15} /> Ответы гостей через RSVP</li>
            </ul>
          </div>
        </section>

        <section className="marketing-cta">
          <div>
            <p className="marketing-eyebrow">Начните с красивого</p>
            <h2>Создайте приглашение,<br />которое хочется сохранить</h2>
          </div>
          <Link className="marketing-button marketing-button--light" href="/templates">
            Выбрать шаблон
            <ArrowRight aria-hidden size={16} />
          </Link>
        </section>
      </main>
    </div>
  );
}
