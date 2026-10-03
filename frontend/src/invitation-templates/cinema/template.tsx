"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { formatDate, formatMonth, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { SharedTemplateViewProps } from "@/invitation-templates/registry";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

function Photo({ src, alt, hero = false }: { src: string; alt: string; hero?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 560px) 100vw, 560px"
      loading={hero ? "eager" : "lazy"}
      quality={90}
      className={styles.photo}
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

export default function CinemaTemplate({
  invite,
  inviteVars,
  coverImage,
  portraitImage,
  venueImage,
  calendarDays,
  siteId,
}: SharedTemplateViewProps) {
  const reduceMotion = useReducedMotion();
  const date = parseDate(invite.date);
  const numericDate = invite.date
    ? new Intl.DateTimeFormat("ru-RU").format(date)
    : formatDate(invite.date);
  const rsvpShortDate = invite.rsvpDate
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
      }).format(parseDate(invite.rsvpDate))
    : "";
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={inviteVars}>
        <section className={styles.hero} data-invite-section="hero">
          <Photo src={coverImage} alt="Свадебный портрет пары" hero />
          <div className={styles.shade} />
          <p className={styles.heroEyebrow}>Свадебное приглашение</p>
          <motion.h1
            className={styles.names}
            initial={false}
            animate={{ y: reduceMotion ? 0 : [8, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span>{invite.groom}</span>
            <span className={styles.ampersand}>&amp;</span>
            <span>{invite.bride}</span>
          </motion.h1>
          <div className={styles.heroDate}>
            <p>Мы женимся</p>
            <time dateTime={invite.date}>{numericDate}</time>
          </div>
        </section>
        <section className={`${styles.section} ${styles.greeting}`} data-invite-section="greeting">
          <h2>Приглашение</h2>
          <p className={styles.copy}>{invite.lead}</p>
          {invite.showRsvp && (
            <>
              <span className={styles.rule} />
              <p className={styles.copy}>
                Подтвердите ваше присутствие
                {invite.rsvpDate && (
                  <>
                    <br />
                    до <time dateTime={invite.rsvpDate}>{rsvpShortDate}</time>
                  </>
                )}
              </p>
              <a className={styles.link} href="#rsvp">
                Заполнить анкету
              </a>
            </>
          )}
        </section>
        <div className={styles.filmStrip}>
          <Photo src={portraitImage} alt="Счастливые мгновения вдвоём" />
        </div>
        <section
          className={`${styles.section} ${styles.dateSection}`}
          data-invite-section="date when"
        >
          <h2>Наш день</h2>
          {invite.date ? (
            <>
              <time
                className={styles.dateLockup}
                dateTime={invite.date}
                aria-label={formatDate(invite.date)}
              >
                <span className={styles.dateDay}>{String(date.getDate()).padStart(2, "0")}</span>
                <span className={styles.dateMonth}>
                  {formatMonth(invite.date)}
                  <span>{date.getFullYear()}</span>
                </span>
              </time>
              <div className={styles.calendar}>
                {calendarDays.map((day) => (
                  <div
                    className={day.selected ? styles.selectedDay : styles.day}
                    key={`${day.label}-${day.day}`}
                  >
                    <span>{day.label}</span>
                    <strong>{day.day}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.copy}>{formatDate(invite.date)}</p>
          )}
          <p className={styles.startTime}>
            Начало в <time>{invite.time}</time>
          </p>
        </section>
        <section className={styles.section} data-invite-section="location where">
          <h2>Место встречи</h2>
          <h3 className={styles.venue}>{invite.venue}</h3>
          <p className={styles.copy}>
            {invite.address}
            <br />
            {invite.city}
          </p>
          {mapUrl && (
            <a className={styles.link} href={mapUrl} target="_blank" rel="noreferrer">
              Посмотреть на карте
            </a>
          )}
        </section>
        <div className={styles.venuePhoto}>
          <Photo src={venueImage} alt={`Место торжества: ${invite.venue}`} />
        </div>
        {invite.showSchedule && (
          <section className={styles.section} data-invite-section="schedule program">
            <h2>Программа дня</h2>
            <ol className={styles.schedule}>
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
          </section>
        )}
        {invite.showDressCode && (
          <section className={styles.section} data-invite-section="dress-code">
            <InvitationDressCodeBlock
              className={styles.shared}
              colors={invite.dressCodeColors}
              text={invite.dressCode}
              variant="aqua"
            />
          </section>
        )}
        {invite.showGroupChat && invite.groupChatUrl.trim() && (
          <section className={styles.section} data-invite-section="chat group-chat">
            <InvitationGroupChatBlock
              className={styles.shared}
              show={invite.showGroupChat}
              text={invite.groupChatText}
              url={invite.groupChatUrl}
              variant="aqua"
            />
          </section>
        )}
        {invite.showAdditionalInfo && invite.additionalInfo.trim() && (
          <section
            className={`${styles.section} ${styles.details}`}
            data-invite-section="info additional-info"
          >
            <h2>Детали</h2>
            <InvitationAdditionalInfoBlock
              className={styles.shared}
              show={invite.showAdditionalInfo}
              text={invite.additionalInfo}
              variant="aqua"
            />
          </section>
        )}
        {invite.showRsvp && (
          <section className={styles.section} data-invite-section="rsvp" id="rsvp">
            <h2>Ждём ваш ответ</h2>
            <p className={styles.copy}>{invite.rsvpText}</p>
            <p className={styles.deadline}>
              {invite.rsvpDate ? `До ${formatDate(invite.rsvpDate)}` : "Дата ответа уточняется"}
            </p>
            <InvitationRsvpForm
              className={styles.form}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
              variant="aqua"
            />
          </section>
        )}
        <section className={styles.closing} data-invite-section="portrait closing">
          <Photo src={portraitImage} alt="Портрет жениха и невесты" />
          <div className={styles.shade} />
          <div>
            <p>С любовью</p>
            <h2>
              {invite.groom} &amp; {invite.bride}
            </h2>
            <time dateTime={invite.date}>{numericDate}</time>
          </div>
        </section>
      </article>
    </>
  );
}
