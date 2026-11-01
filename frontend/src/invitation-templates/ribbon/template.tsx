"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { Heart } from "lucide-react";
import { formatDate, formatInviteDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import { getSafeHttpUrl } from "@/lib/safe-url";
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
import { useRibbonScroll } from "./use-ribbon-scroll";

const countdownLabels = ["дней", "часов", "минут", "секунд"] as const;

function Bow() {
  return (
    <span className={styles.bow} data-ribbon-bow aria-hidden="true">
      <span />
    </span>
  );
}

function InitialName({ name }: { name: string }) {
  const letters = Array.from(name);
  return (
    <span>
      <em>{letters[0]}</em>
      {letters.slice(1).join("")}
    </span>
  );
}

function FlipDigit({ digit }: { digit: string }) {
  const [face, setFace] = useState({ value: digit, previous: digit });
  if (face.value !== digit) {
    setFace({ value: digit, previous: face.value });
  }
  return (
    <span className={styles.flipDigit}>
      <i className={styles.digitFace}>{digit}</i>
      {face.previous !== digit && (
        <>
          <i key={`previous-${digit}`} className={styles.digitPrevious}>
            {face.previous}
          </i>
          <i key={`top-${digit}`} className={styles.digitTop}>
            {face.previous}
          </i>
          <i key={`bottom-${digit}`} className={styles.digitBottom}>
            {digit}
          </i>
        </>
      )}
    </span>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const timestamp = new Date(date + "T" + time + ":00").getTime();
    const update = () =>
      setRemaining(
        Number.isFinite(timestamp) ? Math.max(0, Math.floor((timestamp - Date.now()) / 1000)) : 0,
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [date, time]);
  const seconds = remaining ?? 0;
  const parts = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return (
    <section className={styles.countdown} data-reveal aria-label="Обратный отсчёт до свадьбы">
      <h2>
        Увидимся с вами
        <br />
        через...
      </h2>
      <div
        className={styles.digits}
        style={{
          gridTemplateColumns:
            (remaining === null ? 2 : String(parts[0]).padStart(2, "0").length) + "fr 2fr 2fr 2fr",
        }}
        role="timer"
        aria-live="off"
        aria-label={
          remaining === null
            ? "Загрузка отсчёта"
            : parts.map((part, index) => part + " " + countdownLabels[index]).join(", ")
        }
      >
        {parts.map((value, index) => (
          <div key={index} aria-hidden="true">
            <span className={styles.number}>
              {Array.from(remaining === null ? "––" : String(value).padStart(2, "0")).map(
                (digit, place) => (
                  <FlipDigit key={place} digit={digit} />
                ),
              )}
            </span>
            <small>{countdownLabels[index]}</small>
          </div>
        ))}
      </div>
      <Bow />
    </section>
  );
}

function Photo({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 560px) 90vw, 500px"
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

export default function RibbonTemplate({
  invite,
  inviteVars,
  calendarDays,
  coverImage,
  portraitImage,
  venueImage,
  siteId,
}: SharedTemplateViewProps) {
  const rootRef = useScrollReveal(invite);
  useRibbonScroll(rootRef, invite);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const activeColor =
    selectedColor && invite.dressCodeColors.includes(selectedColor) ? selectedColor : null;
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const showChat = invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl));
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article ref={rootRef} className={styles.shell} style={inviteVars}>
        <section className={styles.hero} data-invite-section="hero">
          <h1 data-reveal>
            <InitialName name={invite.bride} />
            <i>&amp;</i>
            <InitialName name={invite.groom} />
          </h1>
          <div className={styles.collage} data-reveal>
            <div className={styles.envelope} data-ribbon-envelope aria-hidden="true">
              <span className={styles.envelopeBack} />
              <span className={styles.envelopeFront} />
              <span className={styles.envelopeFlap} />
              <span className={styles.envelopeSeal}>
                <Heart fill="currentColor" />
                <i>&amp;</i>
              </span>
            </div>
            <div className={styles.handwriting} aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index}>I love you I love you I love you I love you</span>
              ))}
            </div>
            <figure>
              <Photo src={coverImage} alt={`${invite.bride} и ${invite.groom}`} priority />
            </figure>
            <figure>
              <Photo src={portraitImage} alt="Наша история любви" priority />
            </figure>
          </div>
        </section>
        <section className={styles.greeting} data-invite-section="greeting">
          <h2 data-reveal>
            <em>М</em>ы женимся!
          </h2>
          <p data-reveal>{invite.lead}</p>
        </section>
        <section className={styles.when} data-reveal data-invite-section="when">
          <h2>наш день</h2>
          <p className={styles.month}>
            {formatInviteDate(invite.date, { month: "long" })}
            <br />
            {formatInviteDate(invite.date, { year: "numeric" }).replace(" г.", "")}
          </p>
          <time className={styles.eventTime} dateTime={invite.date + "T" + invite.time}>
            в {invite.time}
          </time>
          <div className={styles.calendar} aria-label={formatDate(invite.date)}>
            {calendarDays.slice(1, 6).map((day, index) => (
              <div key={index} className={day.selected ? styles.selected : undefined}>
                <span>
                  {day.selected && (
                    <>
                      <Heart aria-hidden="true" fill="currentColor" />
                      <svg
                        className={styles.heartTrace}
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          pathLength="1"
                          d="M12 21C9 18.4 2 13.4 2 8a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 5.4-7 10.4-10 13Z"
                        />
                      </svg>
                    </>
                  )}
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </section>
        {invite.showSchedule && (
          <section className={styles.program} data-invite-section="schedule">
            <h2 className={styles.srOnly}>Программа дня</h2>
            <span className={styles.timelineRunner} aria-hidden="true">
              <Heart fill="currentColor" size={18} />
            </span>
            <ol data-ribbon-timeline>
              {invite.schedule.map((item, index) => (
                <li key={index} data-timeline-item>
                  <Heart
                    className={styles.marker}
                    size={13}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  <time>{item.time}</time>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}
        <section className={styles.location} data-reveal data-invite-section="location">
          <h2>Ждём вас</h2>
          <h3>{invite.venue}</h3>
          <p className={styles.addressLabel}>по адресу:</p>
          <address>{[invite.city, invite.address].filter(Boolean).join(", ")}</address>
          <figure>
            <Photo src={venueImage} alt={`Место торжества — ${invite.venue}`} />
          </figure>
          {mapUrl && (
            <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
              посмотреть на карте
            </a>
          )}
        </section>
        {invite.showDressCode && (
          <section
            className={styles.dress}
            data-invite-section="dress-code"
            data-reveal
            style={
              {
                "--ribbon-swatch-count": Math.min(invite.dressCodeColors.length, 8),
              } as CSSProperties
            }
          >
            <Bow />
            <InvitationDressCodeBlock
              className={styles.shared}
              text={invite.dressCode}
              colors={invite.dressCodeColors}
              variant="alpine"
              onColorSelect={setSelectedColor}
              selectedColor={activeColor}
            />
            <output className={styles.colorHint} aria-live="polite">
              {activeColor ? activeColor.toUpperCase() : "Нажмите на цвет, чтобы увидеть его код"}
            </output>
          </section>
        )}
        {(showInfo || showChat) && (
          <section className={styles.details} data-reveal data-invite-section="chat info">
            <InvitationAdditionalInfoBlock
              className={styles.info}
              show={invite.showAdditionalInfo}
              text={invite.additionalInfo}
              title="Детали"
              variant="alpine"
            />
            <InvitationGroupChatBlock
              className={styles.chat}
              show={invite.showGroupChat}
              url={invite.groupChatUrl}
              text={invite.groupChatText}
              title="Чат"
              variant="alpine"
            />
          </section>
        )}
        {invite.showRsvp && (
          <section className={styles.rsvp} data-reveal data-invite-section="rsvp">
            <h2>Будете с нами?</h2>
            <p>{invite.rsvpText}</p>
            <p className={styles.deadline}>Ответьте до {formatDate(invite.rsvpDate)}</p>
            <InvitationRsvpForm
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
              variant="alpine"
            />
          </section>
        )}
        <section className={styles.closing} data-reveal data-invite-section="portrait">
          <figure>
            <Photo src={coverImage} alt={`${invite.bride} и ${invite.groom}`} />
          </figure>
          <p className={styles.signature}>
            <span>{invite.bride}</span>
            <i>&amp;</i>
            <span>{invite.groom}</span>
          </p>
          <time dateTime={invite.date}>{formatDate(invite.date)}</time>
        </section>
        <Countdown date={invite.date} time={invite.time} />
      </article>
    </>
  );
}
