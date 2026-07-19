"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

type EditorialTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type EditorialStyle = CSSProperties & {
  "--editorial-bg": string;
  "--editorial-paper": string;
  "--editorial-ink": string;
  "--editorial-photo-text": string;
  "--editorial-muted": string;
  "--editorial-accent": string;
  "--editorial-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createEditorialStyle(inviteVars: InviteVars): EditorialStyle {
  return {
    ...inviteVars,
    "--editorial-bg": inviteVars["--invite-bg"],
    "--editorial-paper": inviteVars["--invite-surface"],
    "--editorial-ink": inviteVars["--invite-ink"],
    "--editorial-photo-text": inviteVars["--invite-photo-text"],
    "--editorial-muted": inviteVars["--invite-muted"],
    "--editorial-accent": inviteVars["--invite-accent"],
    "--editorial-line": inviteVars["--invite-line"],
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

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLocaleUpperCase("ru-RU") + value.slice(1);
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<{ coverImage: string; invite: InviteState }>) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroPaper}>
        <h1 className={styles.heroStatement} aria-label="Она сказала да!">
          <span className={styles.heroPrelude}>Она сказала</span>
          <span aria-hidden className={styles.heroAnswer}>
            <span className={styles.heroScript}>Да</span>
            <span className={styles.heroMark} />
          </span>
        </h1>
        <div className={styles.heroMeta}>
          <span>wedding story · 01</span>
          <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
        </div>
      </div>
      <figure className={styles.heroPhoto}>
        <Image
          alt={`Свадебная история ${invite.bride} и ${invite.groom}`}
          className={styles.photo}
          fill
          loading="eager"
          sizes="(max-width: 899px) 100vw, 560px"
          src={coverImage}
          unoptimized={isRuntimeImageSource(coverImage)}
        />
        <div className={styles.photoShade} />
        <span className={styles.heroSeal} aria-hidden>
          {invite.groom.charAt(0)}·{invite.bride.charAt(0)}
        </span>
        <p className={styles.heroPhotoNote}>
          {invite.city} · {formatDate(invite.date, { year: "numeric" })}
        </p>
        <figcaption>
          <span>{invite.groom}</span>
          <i>&amp;</i>
          <span>{invite.bride}</span>
        </figcaption>
      </figure>
    </section>
  );
}

function GreetingSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.greeting}>
      <span className={styles.sectionIndex}>01</span>
      <div>
        <p className={styles.kicker}>Дорогие гости</p>
        <h2>Этот день — про любовь</h2>
      </div>
      <p className={styles.lead}>{invite.lead}</p>
    </section>
  );
}

function DateSection({
  calendarDays,
  invite,
}: Readonly<{
  calendarDays: EditorialTemplateProps["calendarDays"];
  invite: InviteState;
}>) {
  return (
    <section className={styles.dateSection}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIndex}>02</span>
        <div>
          <p className={styles.kicker}>Когда</p>
          <h2>{capitalize(formatDate(invite.date, { month: "long" }))}</h2>
        </div>
      </header>
      <div className={styles.dateBody}>
        <div className={styles.dateLockup}>
          <time dateTime={invite.date}>{formatDate(invite.date, { day: "2-digit" })}</time>
          <div className={styles.dateMeta}>
            <span>{formatDate(invite.date, { weekday: "long" })}</span>
            <strong>{invite.time}</strong>
          </div>
        </div>
        <div className={styles.calendar} aria-label="Календарь месяца">
          {calendarDays.map((item, index) => (
            <span
              className={item.selected ? styles.selectedDay : undefined}
              key={`${item.day}-${index}`}
            >
              <small>{item.label}</small>
              <strong>{item.day}</strong>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueSection({
  invite,
  venueImage,
}: Readonly<{ invite: InviteState; venueImage: string }>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.venueSection}>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Место проведения — ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 899px) 100vw, 640px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
      </figure>
      <div className={styles.venueCopy}>
        <span className={styles.sectionIndex}>03</span>
        <div>
          <p className={styles.kicker}>Место</p>
          <h2>{invite.venue}</h2>
          <p>
            {invite.city}
            <br />
            {invite.address}
          </p>
          {mapUrl ? (
            <a href={mapUrl} rel="noreferrer" target="_blank">
              <MapPin aria-hidden size={15} />
              Открыть карту
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProgramSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.program}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIndex}>04</span>
        <div>
          <p className={styles.kicker}>План дня</p>
          <h2>Программа</h2>
        </div>
      </header>
      <ol className={styles.timeline}>
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

function DressCodeSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.dressSection}>
      <span className={styles.sectionIndex}>05</span>
      <InvitationDressCodeBlock
        className={styles.dressBlock}
        colors={invite.dressCodeColors}
        text={invite.dressCode}
        variant="vanilla"
      />
    </section>
  );
}

function DetailsSection({ invite }: Readonly<{ invite: InviteState }>) {
  const showChat = invite.showGroupChat && Boolean(invite.groupChatUrl.trim());
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());

  if (!showChat && !showInfo) {
    return null;
  }

  return (
    <section className={styles.detailsSection}>
      <header>
        <p className={styles.kicker}>На заметку</p>
        <h2>Детали</h2>
      </header>
      {showInfo ? (
        <InvitationAdditionalInfoBlock
          className={styles.infoBlock}
          show={invite.showAdditionalInfo}
          text={invite.additionalInfo}
          variant="vanilla"
        />
      ) : null}
      {showChat ? (
        <InvitationGroupChatBlock
          className={styles.chatBlock}
          show={invite.showGroupChat}
          text={invite.groupChatText}
          url={invite.groupChatUrl}
          variant="vanilla"
        />
      ) : null}
    </section>
  );
}

function RsvpSection({ invite, siteId }: Readonly<{ invite: InviteState; siteId?: string }>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvpSection} id="rsvp">
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIndex}>06</span>
        <div>
          <p className={styles.kicker}>Ваш ответ</p>
          <h2>Будете с нами?</h2>
          <p>{invite.rsvpText}</p>
          <time dateTime={invite.rsvpDate}>До {formatNumericDate(invite.rsvpDate)}</time>
        </div>
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
}: Readonly<{ invite: InviteState; portraitImage: string }>) {
  return (
    <section className={styles.closing}>
      <Image
        alt={`${invite.bride} и ${invite.groom}`}
        className={styles.photo}
        fill
        sizes="(max-width: 899px) 100vw, 1120px"
        src={portraitImage}
        unoptimized={isRuntimeImageSource(portraitImage)}
      />
      <div className={styles.closingShade} />
      <div className={styles.closingCopy}>
        <p>До встречи</p>
        <h2>
          {invite.groom} <i>&amp;</i> {invite.bride}
        </h2>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
    </section>
  );
}

export default function EditorialTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: EditorialTemplateProps) {
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={createEditorialStyle(inviteVars)}>
        <HeroSection coverImage={coverImage} invite={invite} />
        <main className={styles.paper}>
          <GreetingSection invite={invite} />
          <DateSection calendarDays={calendarDays} invite={invite} />
          <VenueSection invite={invite} venueImage={venueImage} />
          <ProgramSection invite={invite} />
          <DressCodeSection invite={invite} />
          <DetailsSection invite={invite} />
          <RsvpSection invite={invite} siteId={siteId} />
          <ClosingSection invite={invite} portraitImage={portraitImage} />
        </main>
      </article>
    </>
  );
}
