"use client";

import Image from "next/image";
import { useEffect, useId, useState, type CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { formatInviteDate, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { getSafeHttpUrl } from "@/lib/safe-url";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
  useScrollReveal,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

type ManorTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ManorStyle = CSSProperties & {
  "--manor-bg": string;
  "--manor-paper": string;
  "--manor-ink": string;
  "--manor-photo-text": string;
  "--manor-muted": string;
  "--manor-accent": string;
  "--manor-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createManorStyle(inviteVars: InviteVars): ManorStyle {
  return {
    ...inviteVars,
    "--manor-bg": inviteVars["--invite-bg"],
    "--manor-paper": inviteVars["--invite-surface"],
    "--manor-ink": inviteVars["--invite-ink"],
    "--manor-photo-text": inviteVars["--invite-photo-text"],
    "--manor-muted": inviteVars["--invite-muted"],
    "--manor-accent": inviteVars["--invite-accent"],
    "--manor-line": inviteVars["--invite-line"],
  };
}

function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatLongDate(value: string) {
  return formatInviteDate(value, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(" г.", "");
}

function getEventTimestamp(date: string, time: string) {
  const withTime = /^\d{2}:\d{2}$/.test(time) ? new Date(`${date}T${time}:00`) : null;

  return withTime && !Number.isNaN(withTime.getTime())
    ? withTime.getTime()
    : parseDate(date).getTime();
}

function splitCountdown(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));

  return [
    { label: "дн.", value: Math.floor(total / 86400) },
    { label: "час", value: Math.floor(total / 3600) % 24 },
    { label: "мин", value: Math.floor(total / 60) % 60 },
    { label: "сек", value: total % 60 },
  ];
}

const countdownPlaceholder = splitCountdown(0);

/** Лента-бант — подпись разделов и финальный акцент шаблона. */
function Bow() {
  return (
    <svg aria-hidden className={styles.bow} viewBox="0 0 120 62">
      <path d="M57 26C44 9 20 6 15 17c-4 10 8 17 22 14 8-2 15-3 20-5Z" pathLength={1} />
      <path d="M63 26c13-17 37-20 42-9 4 10-8 17-22 14-8-2-15-3-20-5Z" pathLength={1} />
      <path d="M56 31c-5 9-12 17-21 24" pathLength={1} />
      <path d="M64 31c5 9 12 17 21 24" pathLength={1} />
      <ellipse cx="60" cy="27" pathLength={1} rx="4.6" ry="4.2" />
    </svg>
  );
}

function getInitial(value: string) {
  return Array.from(value.trim())[0]?.toUpperCase() ?? "";
}

function ThemeEngraving({
  className,
  height,
  preserveAspectRatio = "xMidYMid meet",
  src,
  width,
}: Readonly<{
  className: string;
  height: number;
  preserveAspectRatio?: "none" | "xMidYMid meet";
  src: string;
  width: number;
}>) {
  const filterId = useId().replaceAll(":", "");

  return (
    <svg
      aria-hidden
      className={className}
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            result="inkAlpha"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.2126 -0.7152 -0.0722 1 0"
          />
          <feFlood floodColor="currentColor" result="themeColor" />
          <feComposite in="themeColor" in2="inkAlpha" operator="in" />
        </filter>
      </defs>
      <image
        filter={`url(#${filterId})`}
        height={height}
        href={src}
        preserveAspectRatio={preserveAspectRatio}
        width={width}
      />
    </svg>
  );
}

function EstateSketch() {
  return (
    <ThemeEngraving
      className={styles.estateSketch}
      height={1024}
      src="/images/manor-decor/chateau-engraving-v1.webp"
      width={1536}
    />
  );
}

function MonogramCrest({ bride, groom }: Readonly<Pick<InviteState, "bride" | "groom">>) {
  const groomInitial = getInitial(groom);
  const brideInitial = getInitial(bride);

  return (
    <div aria-hidden className={styles.monogramCrest}>
      <ThemeEngraving
        className={styles.monogramCrestArtwork}
        height={1536}
        src="/images/manor-decor/family-crest-engraving-v1.webp"
        width={1024}
      />
      <span className={styles.monogramCrestInitials}>{groomInitial}·{brideInitial}</span>
    </div>
  );
}

function SectionTitle({ lead, tail }: Readonly<{ lead: string; tail: string }>) {
  return (
    <h2 className={styles.sectionTitle}>
      <span>{lead}</span>
      <em>{tail}</em>
    </h2>
  );
}

function HeroSection({
  coverImage,
  invite,
  venueImage,
}: Readonly<Pick<ManorTemplateProps, "coverImage" | "invite" | "venueImage">>) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroIntro}>
        <Image
          alt=""
          aria-hidden
          className={styles.heroBackdrop}
          fill
          loading="eager"
          sizes="(max-width: 720px) 100vw, 640px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        <div className={styles.heroStack}>
          <div aria-hidden className={styles.heroEnvelope}>
            <span className={styles.heroSeal}>
              {getInitial(invite.groom)}·{getInitial(invite.bride)}
            </span>
          </div>
          <h1
            className={`${styles.heroTitle} ${
              invite.groom.length + invite.bride.length > 40 ? styles.heroTitleLong : ""
            }`}
          >
            <span>{invite.groom}</span>
            <em>и</em>
            <span>{invite.bride}</span>
          </h1>
          <time className={styles.heroDate} dateTime={invite.date}>
            {formatNumericDate(invite.date)}
          </time>
        </div>
      </div>
      <figure className={styles.heroPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photoMono}
          fill
          loading="eager"
          priority
          sizes="(max-width: 720px) 100vw, 640px"
          src={coverImage}
          unoptimized={isRuntimeImageSource(coverImage)}
        />
      </figure>
      <div className={styles.heroLetterSection}>
        <div className={styles.heroLetter}>
          <p className={styles.heroLetterEyebrow}>Глава первая</p>
          <p className={styles.heroLetterScript}>Она сказала «да»</p>
          <p className={styles.heroLetterNote}>Так началась наша история</p>
        </div>
      </div>
    </section>
  );
}

function StorySection({
  coverImage,
  invite,
  portraitImage,
}: Readonly<Pick<ManorTemplateProps, "coverImage" | "invite" | "portraitImage">>) {
  return (
    <section className={styles.story} data-reveal>
      <SectionTitle lead="Наша" tail="история" />
      <EstateSketch />
      <p>{invite.lead}</p>
      <div className={styles.storyPhotos}>
        <figure>
          <Image
            alt={`${invite.groom} и ${invite.bride}`}
            className={styles.photoMono}
            fill
            sizes="210px"
            src={coverImage}
            unoptimized={isRuntimeImageSource(coverImage)}
          />
        </figure>
        <figure>
          <Image
            alt={`${invite.groom} и ${invite.bride}`}
            className={styles.photoMono}
            fill
            sizes="190px"
            src={portraitImage}
            unoptimized={isRuntimeImageSource(portraitImage)}
          />
        </figure>
      </div>
    </section>
  );
}

function Countdown({ date, time }: Readonly<{ date: string; time: string }>) {
  // Отсчёт зависит от «сейчас», поэтому считаем его только после гидрации:
  // иначе серверная и клиентская разметка разойдутся на секунду.
  const [parts, setParts] = useState<ReturnType<typeof splitCountdown> | null>(null);

  useEffect(() => {
    const target = getEventTimestamp(date, time);
    const tick = () => setParts(splitCountdown(target - Date.now()));

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [date, time]);

  return (
    <div className={styles.countdown}>
      <p className={styles.countdownTitle}>День приближается</p>
      <ul className={styles.countdownGrid}>
        {(parts ?? countdownPlaceholder).map((part, index) => (
          <li key={part.label}>
            {/* key на значении: React пересоздаёт узел на каждом тике, и анимация проигрывается заново */}
            <strong key={parts ? part.value : "idle"}>
              {parts ? String(part.value).padStart(2, "0") : "––"}
            </strong>
            <small>{part.label}</small>
            {index < 3 ? <i aria-hidden>:</i> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhenSection({
  calendarDays,
  coverImage,
  invite,
}: Readonly<Pick<ManorTemplateProps, "calendarDays" | "coverImage" | "invite">>) {
  return (
    <section className={styles.when} data-reveal>
      <SectionTitle lead="Когда" tail="мы вас ждём" />
      <time className={styles.whenDate} dateTime={invite.date}>
        {formatLongDate(invite.date)}
      </time>
      <p className={styles.whenTime}>Сбор гостей в {invite.time}</p>
      <ul className={styles.calendar} aria-label="Неделя торжества">
        {calendarDays.map((item, index) => (
          <li
            className={item.selected ? styles.calendarSelected : undefined}
            key={`${item.day}-${index}`}
          >
            <small>{item.label}</small>
            <strong>{item.day}</strong>
          </li>
        ))}
      </ul>
      <Countdown date={invite.date} time={invite.time} />
      <figure className={styles.whenPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photoMono}
          fill
          sizes="(max-width: 720px) 100vw, 640px"
          src={coverImage}
          unoptimized={isRuntimeImageSource(coverImage)}
        />
      </figure>
    </section>
  );
}

function WhereSection({
  invite,
  venueImage,
}: Readonly<Pick<ManorTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.where} data-reveal>
      <Image
        alt={`Место проведения — ${invite.venue}`}
        className={styles.wherePhoto}
        fill
        sizes="(max-width: 720px) 100vw, 640px"
        src={venueImage}
        unoptimized={isRuntimeImageSource(venueImage)}
      />
      <div className={styles.whereBody}>
        <SectionTitle lead="Адрес" tail="торжества" />
        <div className={styles.whereVenue}>
          <h3>{invite.venue}</h3>
          <address>
            {invite.city}, {invite.address}
          </address>
        </div>
        {mapUrl ? (
          <a className={styles.mapLink} href={mapUrl} rel="noreferrer" target="_blank">
            <MapPin aria-hidden size={14} />
            Открыть карту
          </a>
        ) : null}
      </div>
    </section>
  );
}

function ProgramSection({ invite }: Readonly<Pick<ManorTemplateProps, "invite">>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <section className={styles.program} data-reveal>
      <SectionTitle lead="Программа" tail="дня" />
      <ol className={styles.timeline}>
        {invite.schedule.map((item, index) => (
          <li key={`${item.time}-${index}`}>
            <div aria-hidden className={styles.programMedallion}>
              <ThemeEngraving
                className={styles.programMedallionArtwork}
                height={1024}
                src="/images/manor-decor/program-medallion-v1.webp"
                width={1024}
              />
              <span className={styles.programMedallionNumber}>{index + 1}</span>
            </div>
            <div className={styles.timelineCopy}>
              <time>{item.time}</time>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DressCodeSection({
  invite,
  venueImage,
}: Readonly<Pick<ManorTemplateProps, "invite" | "venueImage">>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <section className={styles.dress} data-reveal>
      <Image
        alt=""
        aria-hidden
        className={styles.dressPhoto}
        fill
        sizes="(max-width: 720px) 100vw, 640px"
        src={venueImage}
        unoptimized={isRuntimeImageSource(venueImage)}
      />
      <div className={styles.dressCard}>
        <ThemeEngraving
          className={styles.dressOrnament}
          height={1024}
          preserveAspectRatio="none"
          src="/images/manor-dress-ornament-v2.webp"
          width={1536}
        />
        <InvitationDressCodeBlock
          className={styles.dressBlock}
          colors={invite.dressCodeColors}
          text={invite.dressCode}
          variant="vanilla"
        />
      </div>
    </section>
  );
}

function hasDetailsContent(invite: InviteState) {
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const showChat = invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl));

  return showInfo || showChat;
}

function DetailsSection({ invite }: Readonly<Pick<ManorTemplateProps, "invite">>) {
  if (!hasDetailsContent(invite)) {
    return null;
  }

  return (
    <section className={styles.details} data-reveal>
      <SectionTitle lead="Детали" tail="и вопросы" />
      <InvitationAdditionalInfoBlock
        className={styles.detailsBlock}
        show={invite.showAdditionalInfo}
        text={invite.additionalInfo}
        variant="vanilla"
      />
      <InvitationGroupChatBlock
        className={styles.detailsBlock}
        show={invite.showGroupChat}
        text={invite.groupChatText}
        url={invite.groupChatUrl}
        variant="vanilla"
      />
      <Bow />
    </section>
  );
}

function RsvpSection({
  invite,
  portraitImage,
  siteId,
}: Readonly<Pick<ManorTemplateProps, "invite" | "portraitImage" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvp} data-reveal id="rsvp">
      <figure className={styles.rsvpPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photoMono}
          fill
          sizes="(max-width: 720px) 82vw, 430px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </figure>
      <h2 className={styles.rsvpTitle}>RSVP</h2>
      <p className={styles.rsvpText}>{invite.rsvpText}</p>
      <time className={styles.rsvpDeadline} dateTime={invite.rsvpDate}>
        Ответьте до {formatLongDate(invite.rsvpDate)}
      </time>
      <InvitationRsvpForm
        className={styles.rsvpForm}
        questions={invite.rsvpQuestions}
        rsvpDate={invite.rsvpDate}
        siteId={siteId}
        variant="vanilla"
      />
    </section>
  );
}

function ClosingSection({
  invite,
}: Readonly<Pick<ManorTemplateProps, "invite">>) {
  return (
    <section className={styles.closing} data-reveal>
      <MonogramCrest bride={invite.bride} groom={invite.groom} />
      <h2 className={`${styles.sectionTitle} ${styles.closingTitle}`}>
        <span>Спасибо</span>
        <em>вам</em>
      </h2>
      <p
        className={`${styles.signature} ${
          invite.groom.length + invite.bride.length > 40 ? styles.closingSignatureLong : ""
        }`}
      >
        {invite.groom} &amp; {invite.bride}
      </p>
      <time className={styles.closingDate} dateTime={invite.date}>
        {formatNumericDate(invite.date)}
      </time>
    </section>
  );
}

export default function ManorTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: ManorTemplateProps) {
  const shellRef = useScrollReveal(invite);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} ref={shellRef} style={createManorStyle(inviteVars)}>
        <div className={styles.paper}>
          <HeroSection coverImage={coverImage} invite={invite} venueImage={venueImage} />
          <StorySection coverImage={coverImage} invite={invite} portraitImage={portraitImage} />
          <WhenSection calendarDays={calendarDays} coverImage={coverImage} invite={invite} />
          <ProgramSection invite={invite} />
          <WhereSection invite={invite} venueImage={venueImage} />
          <DressCodeSection invite={invite} venueImage={venueImage} />
          <DetailsSection invite={invite} />
          <RsvpSection invite={invite} portraitImage={portraitImage} siteId={siteId} />
          <ClosingSection invite={invite} />
        </div>
      </article>
    </>
  );
}
