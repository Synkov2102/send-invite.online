"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { parseDate } from "@/lib/invite-date";
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

type ChapterTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ChapterStyle = CSSProperties & {
  "--chapter-bg": string;
  "--chapter-paper": string;
  "--chapter-ink": string;
  "--chapter-photo-text": string;
  "--chapter-muted": string;
  "--chapter-accent": string;
  "--chapter-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createChapterStyle(inviteVars: InviteVars): ChapterStyle {
  return {
    ...inviteVars,
    "--chapter-bg": inviteVars["--invite-bg"],
    "--chapter-paper": inviteVars["--invite-surface"],
    "--chapter-ink": inviteVars["--invite-ink"],
    "--chapter-photo-text": inviteVars["--invite-photo-text"],
    "--chapter-muted": inviteVars["--invite-muted"],
    "--chapter-accent": inviteVars["--invite-accent"],
    "--chapter-line": inviteVars["--invite-line"],
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

/** «23 мая» → «мая»: родительный падеж месяца для плашки с датой. */
function formatMonthGenitive(value: string) {
  const parts = formatDate(value, { day: "numeric", month: "long" }).split(" ");

  return parts[parts.length - 1];
}

function formatToplineDate(value: string) {
  return formatDate(value, { day: "numeric", month: "long", year: "numeric" }).replace(
    " г.",
    "",
  );
}

function Notch() {
  return (
    <div className={styles.notch} aria-hidden data-reveal>
      <span className={styles.notchLine} />
    </div>
  );
}

function SectionLabel({
  children,
  index,
}: Readonly<{ children: string; index: string }>) {
  return (
    <p className={styles.eyebrow}>
      <span aria-hidden className={styles.eyebrowRule} />
      <span aria-hidden className={styles.eyebrowIndex}>
        {index}
      </span>
      {children}
      <span aria-hidden className={styles.eyebrowRule} />
    </p>
  );
}

/** Корешок билета: повтор даты и города вместо пустой полосы между главами. */
function TicketStrip({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  const item = `${formatNumericDate(invite.date)} · ${invite.city} · Свадьба`;

  return (
    <div aria-hidden className={styles.strip} data-reveal>
      {/* Два одинаковых набора — чтобы бегущая строка зациклилась без стыка. */}
      <span>
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index}>{item}</i>
        ))}
      </span>
    </div>
  );
}

function ToplineSection({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  const label = formatToplineDate(invite.date);

  return (
    <div className={styles.topline}>
      <time dateTime={invite.date}>{label}</time>
      <span className={styles.chip}>Глава «Свадьба»</span>
      <span aria-hidden className={styles.toplineEcho}>
        {label}
      </span>
    </div>
  );
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<Pick<ChapterTemplateProps, "coverImage" | "invite">>) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        <span>Наше особенное</span>
        <em>приглашение</em>
        <span>для вас!</span>
      </h1>
      <p className={styles.heroNote}>
        Когда два пути сливаются в один — рождается история
      </p>
      <figure className={styles.heroPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photo}
          fill
          loading="eager"
          priority
          sizes="(max-width: 720px) 100vw, 640px"
          src={coverImage}
          unoptimized={isRuntimeImageSource(coverImage)}
        />
        <figcaption className={styles.namesBadge}>
          {invite.groom} &amp; {invite.bride}
        </figcaption>
        <span aria-hidden className={styles.seal}>
          <em>
            {invite.groom.charAt(0)} <i>&amp;</i> {invite.bride.charAt(0)}
          </em>
          <small>{formatDate(invite.date, { year: "numeric" })}</small>
        </span>
      </figure>
    </section>
  );
}

function GreetingSection({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  return (
    <section className={styles.greeting} data-reveal>
      <h2 className={styles.sectionTitle}>
        <span>Дорогие</span>
        <em>наши</em>
        <span>родные, друзья и близкие!</span>
      </h2>
      <p className={styles.lead}>{invite.lead}</p>
    </section>
  );
}

function WhenSection({
  calendarDays,
  invite,
}: Readonly<Pick<ChapterTemplateProps, "calendarDays" | "invite">>) {
  return (
    <section className={styles.when} data-reveal>
      <SectionLabel index="01">Когда</SectionLabel>
      <time className={styles.datePill} dateTime={invite.date}>
        <i>({formatDate(invite.date, { day: "numeric" })})</i>
        <span>{formatMonthGenitive(invite.date)}</span>
        <i>({formatDate(invite.date, { year: "numeric" })})</i>
      </time>
      <p className={styles.timeNote}>Сбор гостей в {invite.time}</p>
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
    </section>
  );
}

function WhereSection({
  invite,
  venueImage,
}: Readonly<Pick<ChapterTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={styles.where} data-reveal>
      <SectionLabel index="02">Где</SectionLabel>
      <h2 className={styles.venue}>{invite.venue}</h2>
      <address className={styles.address}>
        {invite.city}, {invite.address}
      </address>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Место проведения — ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 720px) 100vw, 640px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        <figcaption>
          <span>{invite.venue}</span>
          <i>·</i>
          <span>{formatNumericDate(invite.date)}</span>
        </figcaption>
      </figure>
      {mapUrl ? (
        <a className={styles.mapLink} href={mapUrl} rel="noreferrer" target="_blank">
          <MapPin aria-hidden size={14} />
          Открыть карту
        </a>
      ) : null}
    </section>
  );
}

function ProgramSection({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <section className={styles.program} data-reveal>
      <SectionLabel index="03">Программа</SectionLabel>
      <h2 className={styles.sectionTitle}>
        <span>План</span>
        <em>нашего</em>
        <span>дня</span>
      </h2>
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

function DressCodeSection({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <section className={styles.dress} data-reveal>
      <SectionLabel index="04">Дресс-код</SectionLabel>
      <InvitationDressCodeBlock
        className={styles.dressBlock}
        colors={invite.dressCodeColors}
        text={invite.dressCode}
        variant="vanilla"
      />
    </section>
  );
}

function hasDetailsContent(invite: InviteState) {
  const showInfo = invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim());
  const showChat = invite.showGroupChat && Boolean(getSafeHttpUrl(invite.groupChatUrl));

  return showInfo || showChat;
}

function DetailsSection({ invite }: Readonly<Pick<ChapterTemplateProps, "invite">>) {
  if (!hasDetailsContent(invite)) {
    return null;
  }

  return (
    <section className={styles.details} data-reveal>
      <SectionLabel index="05">На заметку</SectionLabel>
      <InvitationAdditionalInfoBlock
        className={styles.infoBlock}
        show={invite.showAdditionalInfo}
        text={invite.additionalInfo}
        variant="vanilla"
      />
      <InvitationGroupChatBlock
        className={styles.chatBlock}
        show={invite.showGroupChat}
        text={invite.groupChatText}
        url={invite.groupChatUrl}
        variant="vanilla"
      />
    </section>
  );
}

function RsvpSection({
  invite,
  siteId,
}: Readonly<Pick<ChapterTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvp} data-reveal id="rsvp">
      <SectionLabel index={hasDetailsContent(invite) ? "06" : "05"}>Ваш ответ</SectionLabel>
      <h2 className={styles.sectionTitle}>
        <span>Будете</span>
        <em>с нами</em>
        <span>рядом?</span>
      </h2>
      <p className={styles.rsvpText}>{invite.rsvpText}</p>
      <time className={styles.rsvpDeadline} dateTime={invite.rsvpDate}>
        Ответьте до {formatNumericDate(invite.rsvpDate)}
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
  portraitImage,
}: Readonly<Pick<ChapterTemplateProps, "invite" | "portraitImage">>) {
  return (
    <section className={styles.closing} data-reveal>
      <figure className={styles.closingPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photoMono}
          fill
          sizes="(max-width: 720px) 60vw, 320px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </figure>
      <div className={styles.closingCopy}>
        <p aria-hidden className={styles.closingScript}>
          До встречи
        </p>
        <p>Ждём вас</p>
        <h2>
          {invite.groom} <i>&amp;</i> {invite.bride}
        </h2>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
    </section>
  );
}

export default function ChapterTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: ChapterTemplateProps) {
  const shellRef = useScrollReveal(invite);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} ref={shellRef} style={createChapterStyle(inviteVars)}>
        <div className={styles.paper}>
          <ToplineSection invite={invite} />
          <HeroSection coverImage={coverImage} invite={invite} />
          <Notch />
          <GreetingSection invite={invite} />
          <WhenSection calendarDays={calendarDays} invite={invite} />
          <Notch />
          <WhereSection invite={invite} venueImage={venueImage} />
          <TicketStrip invite={invite} />
          <ProgramSection invite={invite} />
          <Notch />
          <DressCodeSection invite={invite} />
          <DetailsSection invite={invite} />
          {invite.showRsvp ? <Notch /> : null}
          <RsvpSection invite={invite} siteId={siteId} />
          <ClosingSection invite={invite} portraitImage={portraitImage} />
        </div>
      </article>
    </>
  );
}
