"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Heart, MapPin, ArrowUpRight, Clock3 } from "lucide-react";
import { formatDate, formatInviteDate, getMonthCalendar, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import { getSafeHttpUrl } from "@/lib/safe-url";
import type { SharedTemplateViewProps } from "@/invitation-templates/registry";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";
import { useScrollReveal } from "@/invitation-templates/components/use-scroll-reveal";

function Photo({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 80vw, 500px"
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

function Ornament() {
  return (
    <div className={styles.ornament} aria-hidden>
      <span />
      <i className={styles.laceDivider} />
      <span />
    </div>
  );
}

function Monogram({ bride, groom }: { bride: string; groom: string }) {
  return (
    <div className={styles.monogram} aria-hidden>
      <div className={styles.monogramFrame} />
      <span>
        {bride.trim().charAt(0)}
        <i>{groom.trim().charAt(0)}</i>
      </span>
    </div>
  );
}

function Rosette() {
  return <div className={styles.rosette} aria-hidden />;
}

function LaceTrim() {
  return <div className={styles.laceTrim} aria-hidden />;
}

export default function LaceTemplate({
  invite,
  inviteVars,
  coverImage,
  portraitImage,
  venueImage,
  siteId,
}: SharedTemplateViewProps) {
  const shellRef = useScrollReveal(invite);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const date = parseDate(invite.date);
  const weeks = getMonthCalendar(invite.date);
  const longestName = Math.max(
    ...[invite.bride, invite.groom].flatMap((name) =>
      name
        .trim()
        .split(/\s+/)
        .map((word) => word.length),
    ),
    1,
  );
  const nameStyle = {
    "--name-size": `${Math.max(5.8, Math.min(11, 100 / longestName))}cqw`,
  } as CSSProperties;
  const hasInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const hasChat = invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl));

  return (
    <>
      <div className={styles.musicControls}>
        <InvitationMusicPlayer
          enabled={invite.musicEnabled}
          title={invite.musicTitle}
          url={invite.musicUrl}
        />
      </div>
      <article className={styles.shell} style={inviteVars} ref={shellRef}>
        <section className={styles.hero} data-invite-section="hero">
          <div className={styles.heroRails} aria-hidden />
          <p className={styles.heroHeading}>
            <span>Свадебное</span>приглашение
          </p>
          <figure className={styles.laceFrame}>
            <div className={styles.framePhoto}>
              <Photo src={coverImage} alt={`${invite.bride} и ${invite.groom}`} priority />
            </div>
            <div className={styles.laceArtwork} aria-hidden>
              <Image
                src="/images/lace-letter-frame.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 84vw, 540px"
              />
            </div>
          </figure>
          <h1 className={styles.names} style={nameStyle}>
            <span>{invite.bride}</span>
            <i>&amp;</i>
            <span>{invite.groom}</span>
          </h1>
          <Ornament />
          <time className={styles.heroDate} dateTime={invite.date}>
            {formatInviteDate(invite.date, { day: "numeric", month: "long", year: "numeric" })}
          </time>
        </section>

        <section className={styles.greeting} data-invite-section="greeting" data-reveal>
          <div className={styles.letter}>
            <Monogram bride={invite.bride} groom={invite.groom} />
            <p className={styles.eyebrow}>Нашим любимым людям</p>
            <h2 className={styles.heading}>
              Дорогие друзья
              <br />
              <em>и родные!</em>
            </h2>
            <p className={styles.bodyCopy}>{invite.lead}</p>
            <Ornament />
            <div className={styles.botanical} aria-hidden>
              <Image
                src="/images/lace-letter-tulip.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 60vw, 340px"
              />
            </div>
          </div>
        </section>

        <section
          className={`${styles.paper} ${styles.dateCard}`}
          data-invite-section="date"
          data-reveal
        >
          <LaceTrim />
          <p className={styles.eyebrow}>Сохраните эту дату</p>
          <h2 className={styles.heading}>
            Тот самый <em>день</em>
          </h2>
          <p className={styles.calendarMonth}>
            {formatInviteDate(invite.date, { month: "long", year: "numeric" })}
          </p>
          <table
            className={styles.calendar}
            aria-label={`Календарь: ${formatInviteDate(invite.date, { month: "long", year: "numeric" })}`}
          >
            <thead>
              <tr>
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                  <th key={day} scope="col">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, index) => (
                <tr key={index}>
                  {week.map((day, weekday) => (
                    <td key={weekday}>
                      {day !== null ? (
                        <span
                          className={day === date.getDate() ? styles.selectedDay : undefined}
                          aria-label={day === date.getDate() ? `${day} — день свадьбы` : undefined}
                        >
                          {day}
                          {day === date.getDate() ? <Heart aria-hidden /> : null}
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.dateNote}>
            <time dateTime={invite.date}>{formatInviteDate(invite.date, { weekday: "long" })}</time>
            <span>
              <Clock3 size={13} aria-hidden /> Ждём вас в {invite.time}
            </span>
          </div>
        </section>

        <section className={styles.location} data-invite-section="location" data-reveal>
          <p className={styles.eyebrow}>Место нашей встречи</p>
          <h2 className={styles.heading}>
            Там, где начинается
            <br />
            <em>любовь</em>
          </h2>
          <div className={styles.venueCard}>
            <figure className={styles.venuePhoto}>
              <Photo src={venueImage} alt={`Место проведения — ${invite.venue}`} />
            </figure>
            <div className={styles.locationCopy}>
              <h3>{invite.venue}</h3>
              <address>
                <span>{invite.city}</span>
                <span>{invite.address}</span>
              </address>
              {mapUrl ? (
                <a className={styles.mapLink} href={mapUrl} target="_blank" rel="noreferrer">
                  <MapPin size={15} aria-hidden /> Посмотреть карту{" "}
                  <ArrowUpRight size={14} aria-hidden />
                </a>
              ) : null}
              <div className={styles.locationFlower} aria-hidden>
                <Image src="/images/lace-letter-location-tulip.webp" alt="" fill sizes="100px" />
              </div>
            </div>
          </div>
        </section>

        {invite.showSchedule || invite.showDressCode ? (
          <div className={styles.capsule} data-reveal>
            {invite.showDressCode ? (
              <section className={styles.dress} data-invite-section="dress-code">
                <p className={styles.eyebrow}>Палитра нашего вечера</p>
                <InvitationDressCodeBlock
                  className={styles.dressBlock}
                  colors={invite.dressCodeColors}
                  text={invite.dressCode}
                  variant="aqua"
                />
              </section>
            ) : null}
            {invite.showDressCode && invite.showSchedule ? <Ornament /> : null}
            {invite.showSchedule ? (
              <section className={styles.program} data-invite-section="schedule">
                <p className={styles.eyebrow}>Моменты, которые мы запомним</p>
                <h2 className={styles.heading}>
                  <em>Программа</em>
                  <br />
                  нашего дня
                </h2>
                <ol className={styles.timeline}>
                  {invite.schedule.map((item, index) => (
                    <li key={`${item.time}-${index}`}>
                      <span className={styles.eventMedallion} aria-hidden>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.eventCopy}>
                        <time>{item.time}</time>
                        <h3>{item.title}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        ) : null}

        {hasInfo || hasChat ? (
          <div className={styles.details} data-reveal>
            {hasInfo ? (
              <section
                className={`${styles.paper} ${styles.detailCard}`}
                data-invite-section="info"
              >
                <Rosette />
                <InvitationAdditionalInfoBlock
                  className={styles.detailBlock}
                  show
                  text={invite.additionalInfo}
                  variant="aqua"
                />
                <div className={styles.closingFlower} aria-hidden>
                  <Image src="/images/lace-letter-closing-tulip.webp" alt="" fill sizes="110px" />
                </div>
              </section>
            ) : null}
            {hasChat ? (
              <section
                className={`${styles.paper} ${styles.detailCard}`}
                data-invite-section="chat"
              >
                <Ornament />
                <InvitationGroupChatBlock
                  className={styles.detailBlock}
                  show
                  text={invite.groupChatText}
                  url={invite.groupChatUrl}
                  variant="aqua"
                />
              </section>
            ) : null}
          </div>
        ) : null}

        {invite.showRsvp ? (
          <section className={styles.rsvp} data-invite-section="rsvp" data-reveal>
            <p className={styles.eyebrow}>Ваш ответ очень важен</p>
            <h2 className={styles.heading}>
              Будете <em>с нами?</em>
            </h2>
            <p className={styles.bodyCopy}>{invite.rsvpText}</p>
            <p className={styles.deadline}>
              Пожалуйста, ответьте до
              <br />
              <time dateTime={invite.rsvpDate}>{formatDate(invite.rsvpDate)}</time>
            </p>
            <div className={`${styles.paper} ${styles.formPaper}`}>
              <LaceTrim />
              <div className={styles.formHeading}>
                <Monogram bride={invite.bride} groom={invite.groom} />
                <p className={styles.eyebrow}>Ответ на приглашение</p>
              </div>
              <InvitationRsvpForm
                className={styles.rsvpForm}
                questions={invite.rsvpQuestions}
                rsvpDate={invite.rsvpDate}
                siteId={siteId}
                variant="aqua"
              />
            </div>
          </section>
        ) : null}

        <section className={styles.closing} data-invite-section="portrait" data-reveal>
          <div className={styles.closingFrame}>
            <LaceTrim />
            <figure className={styles.closingPhoto}>
              <Photo src={portraitImage} alt={`${invite.bride} и ${invite.groom}`} />
            </figure>
          </div>
          <h2 className={styles.heading}>
            Мы ждём вас
            <br />
            <em>с нетерпением!</em>
          </h2>
          <Ornament />
          <p className={styles.eyebrow}>С любовью</p>
          <p className={styles.signature} style={nameStyle}>
            <span>{invite.bride}</span>
            <i>&amp;</i>
            <span>{invite.groom}</span>
          </p>
          <time className={styles.closingDate} dateTime={invite.date}>
            {formatInviteDate(invite.date, { day: "numeric", month: "long", year: "numeric" })}
          </time>
        </section>
      </article>
    </>
  );
}
