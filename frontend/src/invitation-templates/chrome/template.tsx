"use client";

import Image from "next/image";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import type { CSSProperties } from "react";
import { parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { getSafeHttpUrl } from "@/lib/safe-url";
import { InvitationMusicPlayer, InvitationRsvpForm } from "@/invitation-templates/components";
import {
  heroItem,
  heroSequence,
  revealViewport,
  sectionReveal,
  staggerContainer,
  staggerItem,
} from "./motion";
import styles from "./template.module.css";

type ChromeTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ChromeStyle = CSSProperties & {
  "--chrome-bg": string;
  "--chrome-paper": string;
  "--chrome-ink": string;
  "--chrome-photo-text": string;
  "--chrome-muted": string;
  "--chrome-metal": string;
  "--chrome-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createChromeStyle(inviteVars: InviteVars): ChromeStyle {
  return {
    ...inviteVars,
    "--chrome-bg": inviteVars["--invite-bg"],
    "--chrome-paper": inviteVars["--invite-surface"],
    "--chrome-ink": inviteVars["--invite-ink"],
    "--chrome-photo-text": inviteVars["--invite-photo-text"],
    "--chrome-muted": inviteVars["--invite-muted"],
    "--chrome-metal": inviteVars["--invite-accent"],
    "--chrome-line": inviteVars["--invite-line"],
  };
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ru-RU", options).format(parseDate(value));
}

function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<Pick<ChromeTemplateProps, "coverImage" | "invite">>) {
  return (
    <motion.header
      animate="visible"
      className={styles.hero}
      initial="hidden"
      variants={heroSequence}
    >
      <Image
        alt={`${invite.bride} и ${invite.groom}`}
        className={`${styles.photo} ${styles.heroPhoto}`}
        fill
        loading="eager"
        priority
        sizes="100vw"
        src={coverImage}
        unoptimized={isRuntimeImageSource(coverImage)}
      />
      <div className={styles.heroShade} />
      <div aria-hidden className={styles.glassTexture} />

      <motion.div className={styles.heroTopline} variants={heroItem}>
        <span>Wedding edition · 26</span>
        <span>{invite.city}</span>
      </motion.div>

      <motion.div className={styles.heroCopy} variants={heroItem}>
        <p>Электронное приглашение</p>
        <h1>
          <span>{invite.bride}</span>
          <i>&amp;</i>
          <span>{invite.groom}</span>
        </h1>
        <strong>на свадьбу</strong>
      </motion.div>

      <motion.div aria-hidden className={styles.chromeDisc} variants={heroItem}>
        <span>our wedding party · save the date · </span>
        <i>
          {invite.bride.charAt(0)}&amp;{invite.groom.charAt(0)}
        </i>
      </motion.div>

      <motion.div className={styles.heroDate} variants={heroItem}>
        <span>Save the date</span>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
        <p>
          {invite.time} · {invite.venue}
        </p>
      </motion.div>

      <motion.a className={styles.heroScroll} href="#story" variants={heroItem}>
        Листайте вниз
        <span aria-hidden>↓</span>
      </motion.a>
    </motion.header>
  );
}

function StorySection({
  invite,
  portraitImage,
}: Readonly<Pick<ChromeTemplateProps, "invite" | "portraitImage">>) {
  return (
    <motion.section
      className={styles.story}
      id="story"
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.storyCopy}>
        <span className={styles.sectionTag}>01 · Наша история</span>
        <h2>
          Мы же
          <br />
          женимся!
        </h2>
        <p>{invite.lead}</p>
        <div className={styles.storyNames}>
          <span>{invite.bride}</span>
          <i>&amp;</i>
          <span>{invite.groom}</span>
        </div>
      </div>
      <figure className={styles.storyPhoto}>
        <Image
          alt={`Портрет ${invite.bride} и ${invite.groom}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
        <figcaption>{formatNumericDate(invite.date)}</figcaption>
      </figure>
    </motion.section>
  );
}

function ProgramSection({ invite }: Readonly<{ invite: InviteState }>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <motion.section
      className={styles.program}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <header className={styles.programHeader}>
        <span className={styles.sectionTag}>02 · Тайминг</span>
        <h2>
          План
          <br />
          <i>дня</i>
        </h2>
        <p>{formatDate(invite.date, { day: "numeric", month: "long", year: "numeric" })}</p>
      </header>
      <motion.ol className={styles.schedule} variants={staggerContainer}>
        {invite.schedule.map((item, index) => (
          <motion.li key={`${item.time}-${index}`} variants={staggerItem}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <span aria-hidden>+</span>
          </motion.li>
        ))}
      </motion.ol>
    </motion.section>
  );
}

function VenueSection({
  invite,
  venueImage,
}: Readonly<Pick<ChromeTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <motion.section
      className={styles.venue}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.venueCopy}>
        <span className={styles.sectionTag}>03 · Место</span>
        <h2>
          Встретимся
          <br />
          <i>здесь</i>
        </h2>
        <div className={styles.venueAddress}>
          <strong>{invite.venue}</strong>
          <p>
            {invite.city}
            <br />
            {invite.address}
          </p>
        </div>
        {mapUrl ? (
          <a className={styles.outlineButton} href={mapUrl} rel="noreferrer" target="_blank">
            <MapPin aria-hidden size={16} />
            Открыть карту
            <ArrowUpRight aria-hidden size={16} />
          </a>
        ) : null}
      </div>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Площадка ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 56vw"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        <span aria-hidden className={styles.metalBadge}>
          03
        </span>
      </figure>
    </motion.section>
  );
}

function DressCodeSection({ invite }: Readonly<{ invite: InviteState }>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <motion.section
      className={styles.dress}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.dressTitle}>
        <span className={styles.sectionTag}>04 · В образе</span>
        <h2>
          Dress
          <br />
          <i>code</i>
        </h2>
      </div>
      <div className={styles.dressCopy}>
        <p>{invite.dressCode}</p>
        <ul aria-label="Цвета дресс-кода">
          {invite.dressCodeColors.map((color, index) => (
            <li key={`${color}-${index}`}>
              <span style={{ backgroundColor: color }} title={color} />
            </li>
          ))}
        </ul>
        <small>палитра вечера · выберите свой оттенок</small>
      </div>
    </motion.section>
  );
}

function DetailsSection({ invite }: Readonly<{ invite: InviteState }>) {
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const chatUrl = getSafeHttpUrl(invite.groupChatUrl);
  const showChat = invite.showGroupChat && Boolean(chatUrl);

  if (!showInfo && !showChat) {
    return null;
  }

  return (
    <motion.section
      className={styles.details}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <header>
        <span className={styles.sectionTag}>05 · Важно</span>
        <h2>
          Детали
          <br />
          <i>вечера</i>
        </h2>
      </header>
      <div className={styles.detailCards}>
        {showInfo ? (
          <article>
            <span>01</span>
            <h3>Формат</h3>
            <p>{invite.additionalInfo}</p>
          </article>
        ) : null}
        {showChat ? (
          <article className={styles.chatCard}>
            <span>02</span>
            <MessageCircle aria-hidden size={30} strokeWidth={1.25} />
            <h3>Свадебный чат</h3>
            <p>{invite.groupChatText}</p>
            <a href={chatUrl ?? undefined} rel="noreferrer" target="_blank">
              Присоединиться <ArrowUpRight aria-hidden size={15} />
            </a>
          </article>
        ) : null}
      </div>
    </motion.section>
  );
}

function RsvpSection({ invite, siteId }: Readonly<Pick<ChromeTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <motion.section
      className={styles.rsvp}
      id="rsvp"
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <header>
        <span className={styles.sectionTag}>06 · RSVP</span>
        <h2>
          Вы
          <br />
          <i>с нами?</i>
        </h2>
        <p>{invite.rsvpText}</p>
        <time dateTime={invite.rsvpDate}>Ответьте до {formatNumericDate(invite.rsvpDate)}</time>
      </header>
      <InvitationRsvpForm
        className={styles.rsvpForm}
        questions={invite.rsvpQuestions}
        rsvpDate={invite.rsvpDate}
        siteId={siteId}
        variant="aqua"
      />
    </motion.section>
  );
}

function ClosingSection({
  coverImage,
  invite,
}: Readonly<Pick<ChromeTemplateProps, "coverImage" | "invite">>) {
  return (
    <motion.footer
      className={styles.closing}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <Image
        alt={`${invite.bride} и ${invite.groom}`}
        className={`${styles.photo} ${styles.closingPhoto}`}
        fill
        sizes="100vw"
        src={coverImage}
        unoptimized={isRuntimeImageSource(coverImage)}
      />
      <div className={styles.closingShade} />
      <div className={styles.closingCopy}>
        <span>До встречи</span>
        <h2>
          {invite.bride}
          <br />
          <i>&amp;</i> {invite.groom}
        </h2>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
      <div aria-hidden className={styles.closingMark}>
        *
      </div>
    </motion.footer>
  );
}

export default function ChromeTemplate({
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: ChromeTemplateProps) {
  return (
    <MotionConfig reducedMotion="user">
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={createChromeStyle(inviteVars)}>
        <HeroSection coverImage={coverImage} invite={invite} />
        <StorySection invite={invite} portraitImage={portraitImage} />
        <ProgramSection invite={invite} />
        <VenueSection invite={invite} venueImage={venueImage} />
        <DressCodeSection invite={invite} />
        <DetailsSection invite={invite} />
        <RsvpSection invite={invite} siteId={siteId} />
        <ClosingSection coverImage={coverImage} invite={invite} />
      </article>
    </MotionConfig>
  );
}
