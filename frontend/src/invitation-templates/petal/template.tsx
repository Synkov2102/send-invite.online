"use client";

import Image from "next/image";
import { MoveUpRight } from "lucide-react";
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

function Flower({ className }: Readonly<{ className: string }>) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 300 300">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="150"
          cy="84"
          rx="30"
          ry="82"
          transform={`rotate(${angle} 150 150)`}
        />
      ))}
    </svg>
  );
}

function Photo({
  src,
  alt,
  priority = false,
}: Readonly<{ src: string; alt: string; priority?: boolean }>) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, 600px"
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

function Doodle({
  className,
  name,
}: Readonly<{
  className: string;
  name: "calendar" | "glasses" | "cake" | "heart";
}>) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.illustration} ${className}`}
      style={{
        WebkitMaskImage: `url("/images/petal-icons/${name}.webp")`,
        maskImage: `url("/images/petal-icons/${name}.webp")`,
      }}
    />
  );
}

export default function PetalTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: SharedTemplateViewProps) {
  const ref = useScrollReveal(invite);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const names = `${invite.groom} и ${invite.bride}`;

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={inviteVars} ref={ref}>
        <div className={styles.folio}>
          <span>Приглашение на свадьбу</span>
          <span>{formatInviteDate(invite.date, { year: "numeric" })}</span>
        </div>
        <section className={styles.hero}>
          <div className={styles.cover}>
            <Photo src={coverImage} alt={names} priority />
          </div>
          <div className={styles.heroTitle}>
            <p>Это любовь!</p>
            <h1
              className={
                invite.groom.length + invite.bride.length > 40 ? styles.heroTitleLong : undefined
              }
            >
              <span>{invite.groom}</span>
              <em>&</em>
              <span>{invite.bride}</span>
            </h1>
          </div>
          <div className={styles.dateSticker} data-reveal>
            <Flower className={styles.stickerFlower} />
            <div>
              <span>Свадьба</span>
              <time dateTime={invite.date}>
                {formatInviteDate(invite.date, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </time>
            </div>
          </div>
        </section>

        <section className={styles.greeting} data-reveal>
          <p className={styles.eyebrow}>Вместе — самое важное</p>
          <h2>
            Дорогие
            <br />
            друзья!
          </h2>

          <p>{invite.lead}</p>
          <Doodle className={styles.doodle} name="calendar" />
        </section>

        <section className={styles.when} data-reveal>
          <Flower className={styles.pinkFlower} />
          <div className={styles.content}>
            <p className={styles.eyebrow}>Тот самый день</p>
            <h2>{formatInviteDate(invite.date, { month: "long" })}</h2>
            <div className={styles.calendar}>
              {calendarDays.map((day) => (
                <div
                  key={`${day.label}-${day.day}`}
                  className={day.selected ? styles.selected : undefined}
                >
                  <span>{day.label}</span>
                  <strong>{day.day}</strong>
                  {day.selected ? <Doodle className={styles.calendarHeart} name="heart" /> : null}
                </div>
              ))}
            </div>
            <time dateTime={`${invite.date}T${invite.time}`}>
              {formatDate(invite.date)} · {invite.time}
            </time>
          </div>
        </section>

        <section className={styles.location} data-reveal>
          <div className={styles.locationText}>
            <p className={styles.eyebrow}>Место нашей встречи</p>
            <h2>
              Здесь будет
              <br />
              наша история
            </h2>
            <h3>{invite.venue}</h3>
            <address>{[invite.city, invite.address].filter(Boolean).join(", ")}</address>
            {mapUrl ? (
              <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
                Построить маршрут <MoveUpRight aria-hidden size={16} />
              </a>
            ) : null}
          </div>
          <figure className={styles.venuePhoto}>
            <Photo src={venueImage} alt={`Место проведения — ${invite.venue}`} />
          </figure>
        </section>

        {invite.showSchedule ? (
          <section className={styles.program} data-reveal>
            <Doodle className={styles.programDoodle} name="glasses" />
            <p className={styles.eyebrow}>От первого объятия до последнего танца</p>
            <h2>
              Этот день
              <br />
              <em className={styles.scriptAccent}>по минутам</em>
            </h2>
            <ol>
              {invite.schedule.map((item, index) => (
                <li key={`${item.time}-${index}`} data-reveal>
                  <time>{item.time}</time>
                  <span className={styles.scheduleNumber} aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
            <Doodle className={styles.cake} name="cake" />
          </section>
        ) : null}

        {invite.showDressCode ? (
          <section className={styles.dressCode} data-reveal>
            <Flower className={styles.dressFlower} />
            <InvitationDressCodeBlock
              className={styles.sharedBlock}
              colors={invite.dressCodeColors}
              text={invite.dressCode}
            />
          </section>
        ) : null}

        {invite.showAdditionalInfo ? (
          <section className={styles.details} data-reveal>
            <Flower className={styles.orangeFlower} />
            <InvitationAdditionalInfoBlock
              className={styles.sharedBlock}
              show={invite.showAdditionalInfo}
              text={invite.additionalInfo}
            />
            <Doodle className={styles.doodle} name="glasses" />
          </section>
        ) : null}

        {invite.showGroupChat ? (
          <section className={styles.chat} data-reveal>
            <InvitationGroupChatBlock
              className={styles.sharedBlock}
              show={invite.showGroupChat}
              text={invite.groupChatText}
              url={invite.groupChatUrl}
            />
          </section>
        ) : null}

        {invite.showRsvp ? (
          <section className={styles.rsvp} data-reveal>
            <p className={styles.eyebrow}>Праздник начинается с вас</p>
            <h2>Вы с нами?</h2>
            <p>{invite.rsvpText}</p>
            <p className={styles.deadline}>
              Ждём ответ до <time dateTime={invite.rsvpDate}>{formatDate(invite.rsvpDate)}</time>
            </p>
            <InvitationRsvpForm
              className={styles.form}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
            />
          </section>
        ) : null}

        <section className={styles.closing} data-reveal>
          <Photo src={portraitImage} alt={names} />
          <div className={styles.closingText}>
            <h2>
              Будем ждать вас
              <br />с нетерпением!
            </h2>
            <p>С любовью, {names}</p>
            <Doodle className={styles.closingHeart} name="heart" />
            <time className={styles.closingDate} dateTime={invite.date}>
              {formatInviteDate(invite.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
            </time>
          </div>
        </section>
      </article>
    </>
  );
}
