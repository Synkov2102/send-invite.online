"use client";

import Image from "next/image";
import { formatDate, formatInviteDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { SharedTemplateViewProps } from "../registry";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
  useScrollReveal,
} from "../components";
import styles from "./template.module.css";

function CircularText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className} aria-hidden>
      {Array.from(text).map((letter, index, letters) => (
        <span
          aria-hidden
          key={index}
          style={{ transform: `rotate(${(index * 360) / letters.length}deg)` }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={className} data-reveal>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 560px"
        unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
      />
    </figure>
  );
}

export default function SolTemplate({
  invite,
  inviteVars,
  calendarDays,
  coverImage,
  portraitImage,
  venueImage,
  siteId,
}: SharedTemplateViewProps) {
  const ref = useScrollReveal(invite);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const dateLabel = formatInviteDate(invite.date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const names = invite.groom + " и " + invite.bride;
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <div className={styles.scene} style={inviteVars}>
        <article className={styles.shell} style={inviteVars} ref={ref}>
          <section data-invite-section="hero">
            <div className={styles.hero} data-reveal>
              <div className={styles.stripeBody} aria-hidden />
              <div className={styles.stripeEdge} aria-hidden />
              <div className={styles.monogram}>
                <div className={styles.seal} aria-hidden />
                <CircularText
                  text={Array(3)
                    .fill(dateLabel + " · ")
                    .join("")}
                  className={styles.dateRing}
                />
                <h1 aria-label={names}>
                  {invite.groom.slice(0, 1)}
                  {invite.bride.slice(0, 1)}
                </h1>
              </div>
              <p className={styles.heroNames}>{names}</p>
            </div>
            <div className={styles.coverPanel}>
              <Photo src={coverImage} alt={names} className={styles.coverPhoto} />
            </div>
          </section>
          <section
            className={`${styles.paper} ${styles.greeting}`}
            data-reveal
            data-invite-section="greeting"
          >
            <h2>Дорогие и любимые!</h2>
            <p>{invite.lead}</p>
            <div className={styles.arrow} aria-hidden />
          </section>
          <section
            className={`${styles.paper} ${styles.datePanel}`}
            data-reveal
            data-invite-section="date"
          >
            <h2>Когда?</h2>
            <time dateTime={invite.date}>{formatDate(invite.date)}</time>
            <p>Сбор гостей — {invite.time}</p>
            <div className={styles.calendar}>
              {calendarDays.map((day) => (
                <div
                  className={day.selected ? styles.selected : undefined}
                  key={day.label + day.day}
                >
                  <span>{day.label}</span>
                  <strong>{day.day}</strong>
                </div>
              ))}
            </div>
          </section>
          <section
            className={`${styles.paper} ${styles.location}`}
            data-reveal
            data-invite-section="location"
          >
            <div className={styles.locationLabelFrame}>
              <h2 className={styles.locationLabel}>Где?</h2>
            </div>
            <div className={styles.venueDetails}>
              <h3>{invite.venue}</h3>
              <address>{[invite.city, invite.address].filter(Boolean).join(", ")}</address>
            </div>
            <Photo src={venueImage} alt={invite.venue} className={styles.venuePhoto} />
            {mapUrl ? (
              <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
                Маршрут
              </a>
            ) : null}
          </section>
          {invite.showSchedule ? (
            <section className={styles.sunny} data-reveal data-invite-section="schedule">
              <h2>Этот день</h2>
              <ol className={styles.schedule}>
                {invite.schedule.map((item, index) => (
                  <li key={index} data-reveal>
                    <time>{item.time}</time>
                    <div>
                      <h3>{item.title}</h3>
                      {item.description ? <p>{item.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {invite.showDressCode ? (
            <section
              className={`${styles.paper} ${styles.dressCode}`}
              data-reveal
              data-invite-section="dress-code"
            >
              <InvitationDressCodeBlock
                className={styles.shared}
                colors={invite.dressCodeColors}
                text={invite.dressCode}
                variant="vanilla"
              />
            </section>
          ) : null}
          {invite.showGroupChat ? (
            <section
              className={`${styles.paper} ${styles.chat}`}
              data-reveal
              data-invite-section="chat"
            >
              <InvitationGroupChatBlock
                className={styles.shared}
                show={invite.showGroupChat}
                text={invite.groupChatText}
                url={invite.groupChatUrl}
                variant="vanilla"
              />
            </section>
          ) : null}
          {invite.showAdditionalInfo ? (
            <section className={styles.wishes} data-reveal data-invite-section="info">
              <h2>Дополнительная информация</h2>
              <div className={styles.wishesCircles}>
                <div className={styles.envelope} aria-hidden />
                <InvitationAdditionalInfoBlock
                  className={styles.wishesFirst}
                  show
                  text={invite.additionalInfo}
                  variant="vanilla"
                />

                <div className={styles.gift} aria-hidden />
              </div>
            </section>
          ) : null}
          {invite.showRsvp ? (
            <section className={styles.rsvp} data-reveal data-invite-section="rsvp">
              <h2>Анкета гостя</h2>
              <p>{invite.rsvpText}</p>
              <p className={styles.deadline}>Ответьте до {formatDate(invite.rsvpDate)}</p>
              <InvitationRsvpForm
                className={styles.form}
                questions={invite.rsvpQuestions}
                rsvpDate={invite.rsvpDate}
                siteId={siteId}
                variant="vanilla"
              />
            </section>
          ) : null}
          <section className={styles.closing} data-reveal data-invite-section="closing portrait">
            <Photo src={portraitImage} alt={names} className={styles.portrait} />
            <p className={styles.caption}>С любовью и предвкушением</p>
            <h2>
              {invite.groom}
              <br />и {invite.bride}
            </h2>
            <time dateTime={invite.date}>{formatDate(invite.date)}</time>
          </section>
        </article>
      </div>
    </>
  );
}
