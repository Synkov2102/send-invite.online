"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import {
  InvitationDressCodeBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

type SilkTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type SilkStyle = CSSProperties & {
  "--silk-bg": string;
  "--silk-paper": string;
  "--silk-ink": string;
  "--silk-muted": string;
  "--silk-line": string;
  "--silk-accent": string;
};

type MonthDay = {
  day: number | null;
  key: string;
  selected: boolean;
};

const weekLabels = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createSilkStyle(inviteVars: InviteVars): SilkStyle {
  return {
    ...inviteVars,
    "--silk-bg": inviteVars["--invite-bg"],
    "--silk-paper": inviteVars["--invite-surface"],
    "--silk-ink": inviteVars["--invite-ink"],
    "--silk-muted": inviteVars["--invite-muted"],
    "--silk-line": inviteVars["--invite-line"],
    "--silk-accent": inviteVars["--invite-accent"],
  };
}

function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatMonthName(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" })
    .format(parseDate(value))
    .toUpperCase();
}

function createMonthDays(value: string): MonthDay[] {
  const eventDate = parseDate(value);
  const year = eventDate.getFullYear();
  const month = eventDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingEmptyDays = (firstDay + 6) % 7;
  const days: MonthDay[] = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    days.push({ day: null, key: `empty-${index}`, selected: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      day,
      key: `day-${day}`,
      selected: day === eventDate.getDate(),
    });
  }

  return days;
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<{ coverImage: string; invite: InviteState }>) {
  const groomInitial = invite.groom.trim().charAt(0) || "M";
  const brideInitial = invite.bride.trim().charAt(0) || "A";

  return (
    <section className={styles.hero}>
      <Image
        alt="Свадебная фотография пары"
        className={styles.heroImage}
        fill
        priority
        sizes="(max-width: 640px) 100vw, 460px"
        src={coverImage}
        unoptimized={isRuntimeImageSource(coverImage)}
      />
      <div className={styles.heroShade} />
      <div className={styles.monogram} aria-label={`${invite.groom} и ${invite.bride}`}>
        <span>{groomInitial}</span>
        <span className={styles.verticalNames}>
          {invite.groom} & {invite.bride}
        </span>
        <span>{brideInitial}</span>
      </div>
      <time className={styles.heroDate} dateTime={invite.date}>
        {formatNumericDate(invite.date)}
      </time>
    </section>
  );
}

function GreetingSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.section}>
      <h2>Дорогие гости!</h2>
      <p>{invite.lead}</p>
    </section>
  );
}

function CalendarSection({
  calendarDays,
  invite,
}: Readonly<{
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  invite: InviteState;
}>) {
  const monthDays = createMonthDays(invite.date);
  const fallbackSelected = calendarDays.find((day) => day.selected)?.day;

  return (
    <section className={styles.calendarSection}>
      <h2>{formatMonthName(invite.date)}</h2>
      <div className={styles.weekdays} aria-hidden>
        {weekLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {monthDays.map((item) => (
          <span
            className={
              item.selected || item.day === fallbackSelected ? styles.selectedDay : undefined
            }
            key={item.key}
          >
            {item.day}
          </span>
        ))}
      </div>
    </section>
  );
}

function LocationSection({ invite }: Readonly<{ invite: InviteState }>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.section}>
      <h2>Локация</h2>
      <p>
        {invite.venue}
        <br />
        {invite.address}, {invite.city}
      </p>
      {mapUrl ? (
        <a className={styles.outlineButton} href={mapUrl} rel="noreferrer" target="_blank">
          Посмотреть на карте
        </a>
      ) : null}
    </section>
  );
}

function GalleryStrip({
  coverImage,
  portraitImage,
  venueImage,
}: Readonly<{
  coverImage: string;
  portraitImage: string;
  venueImage: string;
}>) {
  const images = [
    { alt: "Детали свадебного утра", src: venueImage },
    { alt: "Свадебная прогулка", src: coverImage },
    { alt: "Финальный свадебный кадр", src: portraitImage },
  ];

  return (
    <div className={styles.galleryStrip}>
      {images.map((image) => (
        <span className={styles.galleryImage} key={image.alt}>
          <Image
            alt={image.alt}
            className={styles.photoImage}
            fill
            sizes="120px"
            src={image.src}
            unoptimized={isRuntimeImageSource(image.src)}
          />
        </span>
      ))}
    </div>
  );
}

function ProgramSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={cx(styles.section, styles.programSection)}>
      <h2>Тайминг</h2>
      <ol className={styles.timeline}>
        {invite.schedule.map((item, index) => (
          <li className={styles.timelineItem} key={`${item.time}-${index}`}>
            <time>{item.time}</time>
            <span className={styles.timelineLine} aria-hidden />
            <span>{item.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DressCodeSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={cx(styles.section, styles.dressSection)}>
      <InvitationDressCodeBlock
        className={styles.dressBlock}
        colors={invite.dressCodeColors}
        text={invite.dressCode}
        variant="aqua"
      />
    </section>
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
    <section className={cx(styles.section, styles.rsvpSection)} id="rsvp">
      <h2>Анкета гостя</h2>
      <p>{invite.rsvpText}</p>
      <div className={styles.rsvpFormWrap} id="silk-rsvp-form">
        <InvitationRsvpForm
          className={styles.rsvpForm}
          questions={invite.rsvpQuestions}
          rsvpDate={invite.rsvpDate}
          siteId={siteId}
          text={invite.rsvpText}
          variant="aqua"
        />
      </div>
    </section>
  );
}

function ClosingSection({
  invite,
  portraitImage,
}: Readonly<{ invite: InviteState; portraitImage: string }>) {
  return (
    <section className={styles.closing}>
      <h2>До встречи!</h2>
      <div className={styles.closingImage}>
        <Image
          alt="Свадебные кольца и финальные детали"
          className={styles.photoImage}
          fill
          sizes="(max-width: 640px) 100vw, 460px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </div>
      <p>
        {invite.groom} & {invite.bride}
      </p>
    </section>
  );
}

export default function SilkTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: SilkTemplateProps) {
  const style = createSilkStyle(inviteVars);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={style}>
        <main className={styles.paper}>
          <HeroSection coverImage={coverImage} invite={invite} />
          <GreetingSection invite={invite} />
          <CalendarSection calendarDays={calendarDays} invite={invite} />
          <LocationSection invite={invite} />
          <GalleryStrip
            coverImage={coverImage}
            portraitImage={portraitImage}
            venueImage={venueImage}
          />
          <ProgramSection invite={invite} />
          <DressCodeSection invite={invite} />
          <RsvpSection invite={invite} siteId={siteId} />
          <ClosingSection invite={invite} portraitImage={portraitImage} />
        </main>
      </article>
    </>
  );
}
