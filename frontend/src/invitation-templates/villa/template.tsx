"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatInviteDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import { getSafeHttpUrl } from "@/lib/safe-url";
import type { SharedTemplateViewProps } from "@/invitation-templates/registry";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
  useScrollReveal,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

function dateLabel(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
) {
  // parseDate("") подставляет сегодняшнюю дату — гостю её показывать нельзя.
  return value ? formatInviteDate(value, options).replace(" г.", "") : "Дата уточняется";
}

function OvalTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h2 className={styles.ovalTitle}>
      <span>{children}</span>
    </h2>
  );
}

function Photo({ src, alt }: Readonly<{ src: string; alt: string }>) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, 640px"
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

export default function VillaTemplate({
  invite,
  inviteVars,
  coverImage,
  portraitImage,
  venueImage,
  calendarDays,
  siteId,
}: SharedTemplateViewProps) {
  const shellRef = useScrollReveal(invite);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const showDetails =
    (invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim())) ||
    (invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl)));

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={inviteVars} ref={shellRef}>
        <section className={styles.hero} data-invite-section="hero">
          <p className={styles.eyebrow}>Приглашение на свадьбу</p>
          <h1 className={styles.names}>
            <span>{invite.groom}</span>
            <i>&</i>
            <span>{invite.bride}</span>
          </h1>
          <time dateTime={invite.date} className={styles.heroDate}>
            {dateLabel(invite.date)}
          </time>
          <p className={styles.heroCity}>{invite.city}</p>
          <a className={styles.heroLink} href="#villa-date">
            Открыть приглашение <span aria-hidden>↓</span>
          </a>
        </section>
        <section className={styles.greeting} data-invite-section="greeting" data-reveal>
          <p className={styles.eyebrow}>В кругу самых близких</p>
          <OvalTitle>Дорогие гости</OvalTitle>
          <p className={styles.lead}>{invite.lead}</p>
          <p className={styles.signature}>
            {invite.groom} & {invite.bride}
          </p>
        </section>
        <section className={styles.dateScene} data-invite-section="date" id="villa-date">
          <Photo src={venueImage} alt={`Сад — ${invite.venue}`} />
          <div className={styles.flower}>
            <svg className={styles.flowerShape} viewBox="0 0 400 400" aria-hidden>
              <path d="M200 54C250-25 337 28 302 110C389 89 429 183 347 218C413 278 344 355 273 314C261 405 158 416 144 325C65 372-9 292 57 233C-30 199 7 99 95 115C61 27 153-17 200 54Z" />
            </svg>
            <div className={styles.flowerCopy}>
              <p className={styles.eyebrow}>Наш день</p>
              <h2>{dateLabel(invite.date, { day: "numeric", month: "long" })}</h2>
              {invite.time && <p>Сбор гостей в {invite.time}</p>}
              <ul className={styles.calendar} aria-label="Неделя торжества">
                {calendarDays.map((day, index) => (
                  <li
                    className={day.selected ? styles.selected : undefined}
                    key={`${day.day}-${index}`}
                  >
                    <small>{day.label}</small>
                    <strong>{day.day}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        {invite.showSchedule && (
          <section className={styles.program} data-invite-section="schedule" data-reveal>
            <p className={styles.eyebrow}>От первого объятия до последнего танца</p>
            <h2 className={styles.sectionTitle}>Программа дня</h2>
            <ol className={styles.timeline}>
              {invite.schedule.map((item, index) => (
                <li key={`${item.time}-${index}`}>
                  <time>{item.time}</time>
                  <div>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <span className={styles.star} aria-hidden />
          </section>
        )}
        <section className={styles.location} data-invite-section="location" data-reveal>
          <OvalTitle>Место встречи</OvalTitle>
          <p className={styles.eyebrow}>{invite.city}</p>
          <h3>{invite.venue}</h3>
          <address>{invite.address}</address>
          <figure className={styles.locationPhoto}>
            <Photo src={coverImage} alt={`${invite.groom} и ${invite.bride}`} />
          </figure>
          {mapUrl && (
            <a className={styles.pill} href={mapUrl} target="_blank" rel="noreferrer">
              Открыть карту <ArrowUpRight size={15} aria-hidden />
            </a>
          )}
        </section>
        {invite.showDressCode && (
          <section className={styles.dress} data-invite-section="dress-code" data-reveal>
            <InvitationDressCodeBlock
              className={styles.dressBlock}
              text={invite.dressCode}
              colors={invite.dressCodeColors}
            />
          </section>
        )}
        {showDetails && (
          <section className={styles.details} data-invite-section="info chat" data-reveal>
            <OvalTitle>Маленькие детали</OvalTitle>
            <div className={styles.detailsGrid}>
              <InvitationAdditionalInfoBlock
                className={styles.detailBlock}
                show={invite.showAdditionalInfo}
                text={invite.additionalInfo}
              />
              <InvitationGroupChatBlock
                className={styles.detailBlock}
                show={invite.showGroupChat}
                text={invite.groupChatText}
                url={invite.groupChatUrl}
              />
            </div>
          </section>
        )}
        {invite.showRsvp && (
          <section className={styles.rsvp} data-invite-section="rsvp" id="rsvp" data-reveal>
            <p className={styles.eyebrow}>Ждём вашего ответа</p>
            <h2 className={styles.sectionTitle}>Вы будете с нами?</h2>
            <p className={styles.rsvpText}>{invite.rsvpText}</p>
            {invite.rsvpDate && (
              <time className={styles.deadline} dateTime={invite.rsvpDate}>
                Пожалуйста, ответьте до {dateLabel(invite.rsvpDate)}
              </time>
            )}
            <InvitationRsvpForm
              className={styles.form}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
            />
          </section>
        )}
        <section className={styles.closing} data-invite-section="portrait">
          <figure className={styles.closingPhoto}>
            <Photo src={portraitImage} alt={`${invite.groom} и ${invite.bride}`} />
          </figure>
          <div className={styles.closingCopy}>
            <p className={styles.eyebrow}>Всё начинается с любви</p>
            <p className={styles.signature}>
              {invite.groom} & {invite.bride}
            </p>
            <time dateTime={invite.date}>{dateLabel(invite.date)}</time>
            <span className={styles.star} aria-hidden />
          </div>
        </section>
      </article>
    </>
  );
}
