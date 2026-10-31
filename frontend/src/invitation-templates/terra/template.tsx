"use client";

import Image from "next/image";
import { Fragment, useEffect, useState, type CSSProperties } from "react";
import { Heart } from "lucide-react";
import { formatDate, formatInviteDate, formatMonth } from "@/lib/invite-date";
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

const countdownLabels = ["дни", "часы", "мин", "сек"] as const;

// Привязывает предлоги и союзы из 1–2 букв к следующему слову, чтобы они не висели в конце строки.
const tie = (text: string) => text.replace(/(?<=^|[\s(«"„])([а-яё]{1,2}) +/gimu, "$1 ");

function Ticker() {
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div>
        {Array.from({ length: 2 }, (_, group) => (
          <span key={group}>
            {Array.from({ length: 6 }, (_, index) => (
              <i key={index}>вместе навсегда</i>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function Photo({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 560px) 90vw, 500px",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
    />
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  // Дата и время в схеме — свободные строки: без валидного момента отсчёт не показываем
  const timestamp = new Date(date + "T" + time + ":00").getTime();
  useEffect(() => {
    if (!Number.isFinite(timestamp)) {
      return;
    }
    const update = () => setRemaining(Math.max(0, Math.floor((timestamp - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [timestamp]);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  const seconds = remaining ?? 0;
  const parts = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  if (remaining === 0) {
    return <p className={styles.script}>мы поженились!</p>;
  }
  return (
    <>
      <p className={styles.script}>до свадьбы осталось</p>
      <div
        className={styles.digits}
        role="timer"
        aria-live="off"
        aria-label={
          remaining === null
            ? "Загрузка отсчёта"
            : parts.map((part, index) => part + " " + countdownLabels[index]).join(", ")
        }
      >
        {parts.map((value, index) => (
          <Fragment key={index}>
            {index > 0 && <b aria-hidden="true">:</b>}
            <div aria-hidden="true">
              {/* key по значению — span пересоздаётся и цифра «перекатывается» */}
              <span key={value}>{remaining === null ? "––" : String(value).padStart(2, "0")}</span>
              <small>{countdownLabels[index]}</small>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export default function TerraTemplate({
  invite,
  inviteVars,
  calendarDays,
  coverImage,
  portraitImage,
  venueImage,
  siteId,
}: SharedTemplateViewProps) {
  const rootRef = useScrollReveal(invite);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const activeColor =
    selectedColor && invite.dressCodeColors.includes(selectedColor) ? selectedColor : null;
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const showChat = invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl));
  const shortDate = formatInviteDate(invite.date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article ref={rootRef} className={styles.shell} style={inviteVars}>
        <Ticker />
        <section className={styles.hero} data-invite-section="hero cover">
          <h1>
            <span className={styles.nameLine}>
              <span>{invite.groom}</span>
            </span>{" "}
            <span className={styles.nameLine}>
              <span>&amp;&nbsp;{invite.bride}</span>
            </span>
          </h1>
          <p className={styles.heroNote}>
            Совсем скоро начнётся новая глава нашей жизни, и мы хотим открыть её вместе с вами!
          </p>
          <figure className={styles.cover}>
            <Photo src={coverImage} alt={`${invite.groom} и ${invite.bride}`} priority />
            <span className={styles.coverScript} aria-hidden="true">
              мы женимся
            </span>
            <time dateTime={invite.date}>{shortDate}</time>
          </figure>
        </section>

        <section className={styles.block}>
          <div className={styles.greeting} data-reveal data-invite-section="greeting">
            <h2>
              Дорогие родные
              <br />и друзья!
            </h2>
            {invite.lead && <p>{tie(invite.lead)}</p>}
          </div>

          <div className={styles.when} data-reveal data-invite-section="when date">
            <div className={styles.weekdays} aria-hidden="true">
              {calendarDays.map((day, index) => (
                <span key={index}>{day.label}</span>
              ))}
            </div>
            <ol className={styles.calendar} aria-label={formatDate(invite.date)}>
              {calendarDays.map((day, index) => (
                <li
                  key={index}
                  className={day.selected ? styles.selected : undefined}
                  aria-current={day.selected ? "date" : undefined}
                  style={{ "--i": index } as CSSProperties}
                >
                  {day.selected && <Heart aria-hidden="true" fill="currentColor" />}
                  <span>{day.day}</span>
                </li>
              ))}
            </ol>
            <p className={styles.month}>
              {formatMonth(invite.date)}{" "}
              {formatInviteDate(invite.date, { year: "numeric" }).replace(" г.", "")}
            </p>
            <p className={styles.eventTime}>
              начало в<time dateTime={invite.date + "T" + invite.time}>{invite.time}</time>
            </p>
          </div>

          <div className={styles.location} data-reveal data-invite-section="location">
            <h2 className={styles.script}>Локация</h2>
            <h3>{invite.venue}</h3>
            <address>{[invite.city, invite.address].filter(Boolean).join(", ")}</address>
            <figure>
              <Photo src={venueImage} alt={`Место торжества — ${invite.venue}`} />
            </figure>
            {mapUrl && (
              <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
                Открыть карту
              </a>
            )}
          </div>
        </section>

        {invite.showSchedule && (
          <section className={styles.program} data-invite-section="schedule">
            <h2 className={styles.title} data-reveal>
              Программа дня
            </h2>
            <ol>
              {invite.schedule.map((item, index) => (
                <li key={index} data-reveal style={{ gridRow: `${index + 1} / span 2` }}>
                  <time dateTime={item.time}>{item.time}</time>
                  <h3>{tie(item.title)}</h3>
                  {item.description && <p>{tie(item.description)}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {invite.showDressCode && (
          <section className={styles.dress} data-invite-section="dress-code" data-reveal>
            <InvitationDressCodeBlock
              className={styles.shared}
              text={tie(invite.dressCode)}
              colors={invite.dressCodeColors}
              variant="alpine"
              onColorSelect={setSelectedColor}
              selectedColor={activeColor}
            />
            {(invite.dressCode.trim() || activeColor) && (
              <output className={styles.colorHint} aria-live="polite">
                {activeColor ? activeColor.toUpperCase() : "Коснитесь цвета, чтобы увидеть его код"}
              </output>
            )}
          </section>
        )}

        {(showInfo || showChat) && (
          <section className={styles.details} data-invite-section="chat info">
            <div className={styles.polaroids} data-reveal aria-hidden="true">
              <figure>
                <span className={styles.closeUp}>
                  <Photo src={coverImage} alt="" sizes="300px" />
                </span>
              </figure>
              <figure>
                <Photo src={venueImage} alt="" sizes="200px" />
              </figure>
            </div>
            <div className={styles.block} data-reveal>
              {showInfo ? (
                <h2>
                  Пожелания
                  <br />и детали
                </h2>
              ) : (
                <h2>
                  Свадебный
                  <br />
                  чат
                </h2>
              )}
              <InvitationAdditionalInfoBlock
                className={styles.info}
                show={invite.showAdditionalInfo}
                text={tie(invite.additionalInfo)}
                title="Детали"
                variant="alpine"
              />
              {showChat && (
                <div className={styles.note}>
                  {showInfo && (
                    <span className={styles.divider} aria-hidden="true">
                      <Heart fill="currentColor" size={14} />
                    </span>
                  )}
                  <p className={styles.script}>
                    для удобства вступите
                    <br />в наш чат
                  </p>
                </div>
              )}
              <InvitationGroupChatBlock
                className={styles.chat}
                show={invite.showGroupChat}
                url={invite.groupChatUrl}
                text={tie(invite.groupChatText)}
                title="Свадебный чат"
                variant="alpine"
              />
            </div>
          </section>
        )}

        {invite.showRsvp && (
          <section className={styles.rsvp} data-reveal data-invite-section="rsvp">
            <h2 className={styles.title}>Анкета</h2>
            {invite.rsvpText && <p>{tie(invite.rsvpText)}</p>}
            <p className={styles.deadline}>
              Ответьте, пожалуйста, до {formatDate(invite.rsvpDate)}
            </p>
            <InvitationRsvpForm
              className={styles.form}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
              variant="alpine"
            />
          </section>
        )}

        <section className={styles.closing} data-reveal data-invite-section="portrait">
          <h2 className={styles.title}>
            С нетерпением
            <br />
            ждём вас!
          </h2>
          <p>
            С теплом и любовью
            <br />
            {invite.groom} &amp; {invite.bride}
          </p>
          <figure>
            <Photo src={portraitImage} alt={`${invite.groom} и ${invite.bride}`} />
          </figure>
          <Countdown date={invite.date} time={invite.time} />
          <Heart className={styles.bigHeart} aria-hidden="true" fill="currentColor" />
        </section>
        <Ticker />
      </article>
    </>
  );
}
