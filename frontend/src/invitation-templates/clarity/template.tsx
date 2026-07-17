"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
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

type ClarityTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ClarityStyle = CSSProperties & {
  "--clarity-bg": string;
  "--clarity-paper": string;
  "--clarity-ink": string;
  "--clarity-muted": string;
  "--clarity-line": string;
  "--clarity-accent": string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createClarityStyle(inviteVars: InviteVars): ClarityStyle {
  return {
    ...inviteVars,
    "--clarity-bg": inviteVars["--invite-bg"],
    "--clarity-paper": inviteVars["--invite-surface"],
    "--clarity-ink": inviteVars["--invite-ink"],
    "--clarity-muted": inviteVars["--invite-muted"],
    "--clarity-line": inviteVars["--invite-line"],
    "--clarity-accent": inviteVars["--invite-accent"],
  };
}

function getDateParts(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return {
    day: pad(date.getDate()),
    month: pad(date.getMonth() + 1),
    year: date.getFullYear(),
  };
}

function formatShortDate(value: string) {
  const date = getDateParts(value);

  return `${date.day}.${date.month}.${date.year}`;
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<{ coverImage: string; invite: InviteState }>) {
  const date = getDateParts(invite.date);

  return (
    <section className={styles.hero}>
      <Image
        alt="Современный свадебный портрет пары"
        className={styles.coverImage}
        fill
        loading="eager"
        sizes="(max-width: 1440px) 100vw, 1440px"
        src={coverImage}
        unoptimized={isRuntimeImageSource(coverImage)}
      />
      <div className={styles.heroShade} />
      <div className={styles.heroTitle}>
        <span>wedding</span>
        <time dateTime={invite.date}>
          {date.day}-{date.month}
        </time>
      </div>
      <div className={styles.heroFooter}>
        <p>{invite.lead}</p>
        <span>wedding day</span>
      </div>
    </section>
  );
}

function DateSection({
  invite,
  venueImage,
}: Readonly<{ invite: InviteState; venueImage: string }>) {
  const date = getDateParts(invite.date);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.dateSection}>
      <div className={styles.dateLockup}>
        <time dateTime={invite.date}>
          <span>{date.day}</span>
          <span>{date.month}</span>
        </time>
        <span>{date.year}</span>
      </div>
      <p className={styles.dateNote}>
        Надеемся, что этот день станет для вас таким же памятным, как и для нас.
      </p>
      <div className={styles.locationCopy}>
        <span>площадка</span>
        <h2>«{invite.venue}»</h2>
        <p>
          {invite.address}, {invite.city}
        </p>
      </div>
      <div className={styles.venuePhoto}>
        <Image
          alt={`Площадка ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 52vw"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
      </div>
      <div className={styles.locationLinks}>
        <span>{invite.time}</span>
        {mapUrl ? (
          <a href={mapUrl} rel="noreferrer" target="_blank">
            посмотреть карту
          </a>
        ) : null}
      </div>
    </section>
  );
}

function ScheduleSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.scheduleSection}>
      <header className={styles.sectionHeader}>
        <span>план</span>
        <h2>События дня</h2>
      </header>
      <ol className={styles.scheduleGrid}>
        {invite.schedule.map((item, index) => (
          <li
            className={cx(
              styles.scheduleCard,
              index === invite.schedule.length - 1 && styles.scheduleCardDark,
            )}
            key={`${item.time}-${index}`}
          >
            <div>
              <time>{item.time}</time>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function DressCodeSection({
  invite,
  portraitImage,
}: Readonly<{ invite: InviteState; portraitImage: string }>) {
  return (
    <section className={styles.dressSection}>
      <InvitationDressCodeBlock
        className={styles.dressBlock}
        colors={invite.dressCodeColors}
        text={invite.dressCode}
        variant="aqua"
      />
      <div className={styles.dressPhoto}>
        <Image
          alt="Свадебный портрет пары"
          className={styles.photo}
          fill
          loading="eager"
          sizes="(max-width: 760px) 100vw, 50vw"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </div>
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
    <>
      {showChat ? (
        <section className={styles.groupChatSection}>
          <div className={styles.groupChatIntro}>
            <span>чат гостей</span>
            <h2>общий чат</h2>
          </div>
          <InvitationGroupChatBlock
            className={styles.groupChatBlock}
            show={invite.showGroupChat}
            text={invite.groupChatText}
            url={invite.groupChatUrl}
            variant="aqua"
          />
        </section>
      ) : null}
      {showInfo ? (
        <section className={styles.additionalInfoSection}>
          <div className={styles.additionalInfoIntro}>
            <span>заметка</span>
            <h2>важно знать</h2>
          </div>
          <InvitationAdditionalInfoBlock
            className={styles.additionalInfoBlock}
            show={invite.showAdditionalInfo}
            text={invite.additionalInfo}
            variant="aqua"
          />
        </section>
      ) : null}
    </>
  );
}

function RsvpSection({
  invite,
  siteId,
}: Readonly<{ invite: InviteState; siteId?: string }>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvpSection} id="rsvp">
      <div className={styles.rsvpIntro}>
        <span>ответьте до {formatShortDate(invite.rsvpDate)}</span>
        <h2>Будете с нами?</h2>
        <p>{invite.rsvpText}</p>
      </div>
      <InvitationRsvpForm
        className={styles.rsvpForm}
        questions={invite.rsvpQuestions}
        rsvpDate={invite.rsvpDate}
        siteId={siteId}
        variant="aqua"
      />
    </section>
  );
}

export default function ClarityTemplate({
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: ClarityTemplateProps) {
  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={createClarityStyle(inviteVars)}>
        <HeroSection coverImage={coverImage} invite={invite} />
        <main className={styles.paper}>
          <DateSection invite={invite} venueImage={venueImage} />
          <ScheduleSection invite={invite} />
          <DressCodeSection invite={invite} portraitImage={portraitImage} />
          <DetailsSection invite={invite} />
          <RsvpSection invite={invite} siteId={siteId} />
        </main>
      </article>
    </>
  );
}
