"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
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

type SkazkaTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type SkazkaStyle = CSSProperties & {
  "--skazka-bg": string;
  "--skazka-paper": string;
  "--skazka-ink": string;
  "--skazka-photo-text": string;
  "--skazka-muted": string;
  "--skazka-accent": string;
  "--skazka-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createSkazkaStyle(inviteVars: InviteVars): SkazkaStyle {
  return {
    ...inviteVars,
    "--skazka-bg": inviteVars["--invite-bg"],
    "--skazka-paper": inviteVars["--invite-surface"],
    "--skazka-ink": inviteVars["--invite-ink"],
    "--skazka-photo-text": inviteVars["--invite-photo-text"],
    "--skazka-muted": inviteVars["--invite-muted"],
    "--skazka-accent": inviteVars["--invite-accent"],
    "--skazka-line": inviteVars["--invite-line"],
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

function Flourish() {
  return <span aria-hidden className={styles.flourish} />;
}

function FolkBorder() {
  return <span aria-hidden className={styles.folkBorder} />;
}

function HohlomaSprig({ side = "left" }: Readonly<{ side?: "left" | "right" }>) {
  return (
    <span
      aria-hidden
      className={`${styles.sprig} ${side === "right" ? styles.sprigRight : ""}`}
    />
  );
}

function SamovarDecor() {
  return <span aria-hidden className={styles.samovar} />;
}

function FolkIcon() {
  return <span aria-hidden className={styles.folkIcon} />;
}

function SectionTitle({ lead, tail }: Readonly<{ lead: string; tail: string }>) {
  return (
    <h2 className={styles.sectionTitle}>
      <span>{lead}</span>
      <em>{tail}</em>
      <Flourish />
    </h2>
  );
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<Pick<SkazkaTemplateProps, "coverImage" | "invite">>) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroIntro}>
        <div className={styles.heroStack}>
          <p className={styles.heroKicker}>Жили-были</p>
          <h1
            className={`${styles.heroTitle} ${
              invite.groom.length + invite.bride.length > 40 ? styles.heroTitleLong : ""
            }`}
          >
            <span>{invite.groom}</span>
            <em>да</em>
            <span>{invite.bride}</span>
          </h1>
          <time className={styles.heroDate} dateTime={invite.date}>
            <span>{formatNumericDate(invite.date)}</span>
          </time>
        </div>
      </div>
      <figure className={styles.heroPhoto}>
        <span aria-hidden className={styles.heroPhotoDecor} />
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
      </figure>
      <FolkBorder />
    </section>
  );
}

function StorySection({
  invite,
}: Readonly<Pick<SkazkaTemplateProps, "invite">>) {
  return (
    <section className={styles.story} data-reveal>
      <HohlomaSprig />
      <p className={styles.storyKicker}>Дорогие гости!</p>
      <p className={styles.storyDrop}>{invite.lead}</p>
      <HohlomaSprig side="right" />
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
      <p className={styles.countdownTitle}>До торжества осталось</p>
      <ul className={styles.countdownGrid}>
        {(parts ?? countdownPlaceholder).map((part, index) => (
          <li key={part.label}>
            {/* key на значении: React пересоздаёт узел на каждом тике, и анимация проигрывается заново */}
            <strong key={parts ? part.value : "idle"}>
              {parts ? String(part.value).padStart(2, "0") : "––"}
            </strong>
            <small>{part.label}</small>
            {index < 3 ? <i aria-hidden>•</i> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhenSection({
  calendarDays,
  invite,
}: Readonly<Pick<SkazkaTemplateProps, "calendarDays" | "invite">>) {
  return (
    <section className={styles.when} data-reveal>
      <SectionTitle lead="Когда" tail="ждём гостей" />
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
    </section>
  );
}

function ProgramSection({ invite }: Readonly<Pick<SkazkaTemplateProps, "invite">>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <section className={styles.program} data-reveal>
      <HohlomaSprig side="right" />
      <SectionTitle lead="Программа" tail="гуляний" />
      <ol className={styles.timeline}>
        {invite.schedule.map((item, index) => (
          <li key={`${item.time}-${index}`}>
            <FolkIcon />
            <div>
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

function WhereSection({
  invite,
  venueImage,
}: Readonly<Pick<SkazkaTemplateProps, "invite" | "venueImage">>) {
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
        <HohlomaSprig />
        <SectionTitle lead="Место" tail="торжества" />
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

function DressCodeSection({
  invite,
}: Readonly<Pick<SkazkaTemplateProps, "invite">>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <section className={styles.dress} data-reveal>
      <HohlomaSprig />
      <SectionTitle lead="Наряды" tail="к празднику" />
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

function DetailsSection({ invite }: Readonly<Pick<SkazkaTemplateProps, "invite">>) {
  if (!hasDetailsContent(invite)) {
    return null;
  }

  return (
    <section className={styles.details} data-reveal>
      <SectionTitle lead="На" tail="заметку" />
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
    </section>
  );
}

function RsvpSection({
  invite,
  siteId,
}: Readonly<Pick<SkazkaTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvp} data-reveal id="rsvp">
      <HohlomaSprig side="right" />
      <SectionTitle lead="Анкета" tail="гостя" />
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
  portraitImage,
}: Readonly<Pick<SkazkaTemplateProps, "invite" | "portraitImage">>) {
  return (
    <section className={styles.closing} data-reveal>
      <Image
        alt={`Финальный портрет — ${invite.groom} и ${invite.bride}`}
        className={styles.closingPortrait}
        fill
        sizes="(max-width: 720px) 100vw, 640px"
        src={portraitImage}
        unoptimized={isRuntimeImageSource(portraitImage)}
      />
      <span aria-hidden className={styles.closingVeil} />
      <div className={styles.closingContent}>
        <SamovarDecor />
        <Flourish />
        <h2 className={styles.closingTitle}>Спасибо, что вы с нами</h2>
        <p className={styles.signature}>
          {invite.groom} &amp; {invite.bride}
        </p>
        <time className={styles.closingDate} dateTime={invite.date}>
          {formatNumericDate(invite.date)}
        </time>
      </div>
    </section>
  );
}

export default function SkazkaTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: SkazkaTemplateProps) {
  const shellRef = useScrollReveal(invite);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} ref={shellRef} style={createSkazkaStyle(inviteVars)}>
        <div className={styles.paper}>
          <HeroSection coverImage={coverImage} invite={invite} />
          <StorySection invite={invite} />
          <WhenSection calendarDays={calendarDays} invite={invite} />
          <WhereSection invite={invite} venueImage={venueImage} />
          <ProgramSection invite={invite} />
          <DressCodeSection invite={invite} />
          <DetailsSection invite={invite} />
          <RsvpSection invite={invite} siteId={siteId} />
          <ClosingSection invite={invite} portraitImage={portraitImage} />
        </div>
      </article>
    </>
  );
}
