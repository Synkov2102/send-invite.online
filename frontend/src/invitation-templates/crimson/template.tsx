"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { MapPin, MessagesSquare } from "lucide-react";
import { formatInviteDate, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { getSafeHttpUrl } from "@/lib/safe-url";
import { InvitationMusicPlayer, InvitationRsvpForm } from "@/invitation-templates/components";
import styles from "./template.module.css";

type CrimsonTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type CrimsonStyle = CSSProperties & {
  "--crimson-bg": string;
  "--crimson-paper": string;
  "--crimson-ink": string;
  "--crimson-photo-text": string;
  "--crimson-muted": string;
  "--crimson-accent": string;
  "--crimson-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createCrimsonStyle(inviteVars: InviteVars): CrimsonStyle {
  return {
    ...inviteVars,
    "--crimson-bg": inviteVars["--invite-bg"],
    "--crimson-paper": inviteVars["--invite-surface"],
    "--crimson-ink": inviteVars["--invite-ink"],
    "--crimson-photo-text": inviteVars["--invite-photo-text"],
    "--crimson-muted": inviteVars["--invite-muted"],
    "--crimson-accent": inviteVars["--invite-accent"],
    "--crimson-line": inviteVars["--invite-line"],
  };
}


function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<Pick<CrimsonTemplateProps, "coverImage" | "invite">>) {
  return (
    <section className={styles.hero}>
      <Image
        alt={`${invite.bride} и ${invite.groom} на берегу`}
        className={styles.photo}
        fill
        loading="eager"
        priority
        sizes="(max-width: 760px) 100vw, 720px"
        src={coverImage}
        unoptimized={isRuntimeImageSource(coverImage)}
      />
      <div className={styles.heroShade} />
      <div className={styles.heroTopline} aria-hidden>
        <span>любовь</span>
        <span>свадьба</span>
        <span>жизнь</span>
      </div>
      <div className={styles.heroCopy}>
        <p>мы приглашаем вас на нашу свадьбу</p>
        <h1>
          <span>{invite.groom}</span>
          <i>&amp;</i>
          <span>{invite.bride}</span>
        </h1>
      </div>
      <div className={styles.heroFooter}>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
        <p>Есть только одно чудо — любить и быть любимыми.</p>
        <a href="#details">стать свидетелем чуда</a>
      </div>
    </section>
  );
}

function GreetingSection({
  coverImage,
  invite,
}: Readonly<Pick<CrimsonTemplateProps, "coverImage" | "invite">>) {
  return (
    <section className={styles.greeting}>
      <div className={styles.loveWord} aria-hidden>
        <span>LO</span>
        <span>VE</span>
      </div>
      <div className={styles.greetingCopy}>
        <p className={styles.kicker}>Дорогие родные и близкие!</p>
        <p>{invite.lead}</p>
      </div>
      <p className={styles.scriptNote} aria-hidden>
        Ради любви
      </p>
      <figure className={styles.greetingPhoto}>
        <Image
          alt=""
          className={styles.photo}
          fill
          loading="eager"
          sizes="(max-width: 760px) 100vw, 720px"
          src={coverImage}
          unoptimized={isRuntimeImageSource(coverImage)}
        />
      </figure>
    </section>
  );
}

function LocationSection({
  invite,
  venueImage,
}: Readonly<Pick<CrimsonTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.location}>
      <header className={styles.locationHeading}>
        <span>место</span>
        <h2 aria-label="Location">
          <span>LOCA</span>
          <span>TION</span>
        </h2>
      </header>
      <div className={styles.locationMeta}>
        <p>{invite.venue}</p>
        <address>
          {invite.city}, {invite.address}
        </address>
      </div>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Место проведения — ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 88vw, 620px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        {mapUrl ? (
          <a href={mapUrl} rel="noreferrer" target="_blank">
            <MapPin aria-hidden size={14} />
            Открыть карту
          </a>
        ) : null}
      </figure>
      <p className={styles.locationInvite}>
        Дорогие женщины, девушки, сёстры и подруги, торжество будет проходить на природе, поэтому
        просим вас позаботиться об удобной обуви.
      </p>
    </section>
  );
}

function DressCodeSection({ invite }: Readonly<Pick<CrimsonTemplateProps, "invite">>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <section className={styles.dressCode}>
      <p className={styles.sectionNumber}>03</p>
      <h2>Дресс-код</h2>
      <p>{invite.dressCode}</p>
      <ul aria-label="Цвета дресс-кода">
        {invite.dressCodeColors.map((color, index) => (
          <li key={`${color}-${index}`}>
            <span style={{ backgroundColor: color }} />
            <small>{String(index + 1).padStart(2, "0")}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProgramSection({ invite }: Readonly<Pick<CrimsonTemplateProps, "invite">>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <section className={styles.program}>
      <header>
        <p className={styles.sectionNumber}>04</p>
        <h2>Тайминг</h2>
        <time dateTime={invite.date}>
          {formatInviteDate(invite.date, { day: "numeric", month: "long" })}
        </time>
      </header>
      <ol>
        {invite.schedule.map((item, index) => (
          <li key={`${item.time}-${index}`}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DetailsSection({ invite }: Readonly<Pick<CrimsonTemplateProps, "invite">>) {
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const chatUrl = getSafeHttpUrl(invite.groupChatUrl);
  const showChat = invite.showGroupChat && Boolean(chatUrl);

  if (!showInfo && !showChat) {
    return null;
  }

  return (
    <section className={styles.details} id="details">
      <header>
        <span>05</span>
        <h2>
          <span className={styles.detailsLetter} aria-hidden>
            D
          </span>
          <span className={styles.detailsTitle}>
            <small>ДЕТАЛИ</small>
            DETAILS
          </span>
        </h2>
      </header>
      <ol>
        {showInfo ? (
          <li>
            <span>01</span>
            <p>{invite.additionalInfo}</p>
          </li>
        ) : null}
        {showChat ? (
          <li>
            <span>{showInfo ? "02" : "01"}</span>
            <div>
              {invite.groupChatText.trim() ? <p>{invite.groupChatText}</p> : null}
              <a href={chatUrl ?? undefined} rel="noreferrer" target="_blank">
                <MessagesSquare aria-hidden size={14} />
                Открыть чат гостей
              </a>
            </div>
          </li>
        ) : null}
      </ol>
    </section>
  );
}

function RsvpSection({
  invite,
  siteId,
}: Readonly<Pick<CrimsonTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvp} id="rsvp">
      <header>
        <p className={styles.sectionNumber}>06</p>
        <h2>
          Будете
          <br />с нами?
        </h2>
        <p>{invite.rsvpText}</p>
        <time dateTime={invite.rsvpDate}>Ответьте до {formatNumericDate(invite.rsvpDate)}</time>
      </header>
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
  portraitImage,
}: Readonly<Pick<CrimsonTemplateProps, "invite" | "portraitImage">>) {
  return (
    <section className={styles.closing}>
      <p className={styles.closingScript} aria-hidden>
        Just married!
      </p>
      <figure>
        <Image
          alt={`${invite.bride} и ${invite.groom}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 720px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
        <div className={styles.closingArc} aria-hidden />
      </figure>
      <div className={styles.closingCopy}>
        <p>на всю жизнь</p>
        <h2>
          {invite.groom} <i>&amp;</i> {invite.bride}
        </h2>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
    </section>
  );
}

export default function CrimsonTemplate({
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: CrimsonTemplateProps) {
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={createCrimsonStyle(inviteVars)}>
        <HeroSection coverImage={coverImage} invite={invite} />
        <GreetingSection coverImage={coverImage} invite={invite} />
        <LocationSection invite={invite} venueImage={venueImage} />
        <DressCodeSection invite={invite} />
        <ProgramSection invite={invite} />
        <DetailsSection invite={invite} />
        <RsvpSection invite={invite} siteId={siteId} />
        <ClosingSection invite={invite} portraitImage={portraitImage} />
      </article>
    </>
  );
}
