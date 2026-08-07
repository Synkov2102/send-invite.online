"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUp, MapPin } from "lucide-react";
import { formatDate, formatInviteDate, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
  useScrollReveal,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

type ScribbleTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ScribbleStyle = CSSProperties & {
  "--scribble-accent": string;
  "--scribble-bg": string;
  "--scribble-ink": string;
  "--scribble-line": string;
  "--scribble-muted": string;
  "--scribble-paper": string;
  "--scribble-photo-text": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createScribbleStyle(inviteVars: InviteVars): ScribbleStyle {
  return {
    ...inviteVars,
    "--scribble-accent": inviteVars["--invite-accent"],
    "--scribble-bg": inviteVars["--invite-bg"],
    "--scribble-ink": inviteVars["--invite-ink"],
    "--scribble-line": inviteVars["--invite-line"],
    "--scribble-muted": inviteVars["--invite-muted"],
    "--scribble-paper": inviteVars["--invite-surface"],
    "--scribble-photo-text": inviteVars["--invite-photo-text"],
  };
}

/* pathLength="1" нормирует длину контура: анимация «прорисовки» пером задаётся
   через stroke-dashoffset 1 → 0 и не зависит от реальной длины пути. */
function Heart({ className }: Readonly<{ className?: string }>) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 64 58">
      <path
        d="M32 53C24 45 7 36 6 20 5 7 21 1 32 15 43 1 59 7 58 20 57 36 40 45 32 53Z"
        pathLength={1}
      />
    </svg>
  );
}

function Squiggle({ className }: Readonly<{ className?: string }>) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 240 18">
      <path d="M5 12c34-9 58 3 92-2s55-8 84 1 42 7 54 3" pathLength={1} />
    </svg>
  );
}

function DoodleTitle({ children, kicker }: Readonly<{ children: ReactNode; kicker?: string }>) {
  return (
    <header className={styles.heading}>
      {kicker ? <p>{kicker}</p> : null}
      <h2>{children}</h2>
      <Squiggle className={styles.headingRule} />
    </header>
  );
}

function Photo({
  alt,
  className,
  priority = false,
  src,
}: Readonly<{
  alt: string;
  className?: string;
  priority?: boolean;
  src: string;
}>) {
  return (
    <Image
      alt={alt}
      className={className}
      fill
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      sizes="(max-width: 720px) 100vw, 640px"
      src={src}
      unoptimized={isRuntimeImageSource(src)}
    />
  );
}

export default function ScribbleTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: ScribbleTemplateProps) {
  const eventDate = parseDate(invite.date);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const locationAddress = [invite.city.trim(), invite.address.trim()].filter(Boolean).join(", ");
  const month = formatInviteDate(invite.date, { month: "long" });
  const year = eventDate.getFullYear();
  const shellRef = useScrollReveal(invite);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article
        className={styles.shell}
        id="scribble-top"
        ref={shellRef}
        style={createScribbleStyle(inviteVars)}
      >
        <section className={styles.hero}>
          <p className={styles.heroKicker}>Приглашение на свадьбу</p>
          <h1>Вот это новость!</h1>
          <div className={styles.heroHearts} aria-hidden>
            <Heart />
            <Heart />
            <Heart />
            <Heart />
          </div>
          <figure className={styles.cutout}>
            <Photo alt={`${invite.groom} и ${invite.bride}`} priority src={coverImage} />
          </figure>
          <div className={styles.nameNotes} aria-label={`${invite.groom} и ${invite.bride}`}>
            <span>{invite.groom}</span>
            <Heart />
            <span>{invite.bride}</span>
          </div>
          <p className={styles.heroBanner}>Мы женимся!</p>
          <DoodleTitle>Узнали?</DoodleTitle>
          <p className={styles.lead}>{invite.lead}</p>
        </section>

        <section className={styles.story} data-reveal>
          <figure className={`${styles.polaroid} ${styles.polaroidLeft}`}>
            <div>
              <Photo alt={`${invite.bride} и ${invite.groom} вместе`} src={coverImage} />
            </div>
          </figure>
          <Heart className={styles.storyHeartOne} />
          <p className={styles.storyNames}>
            {invite.groom} + {invite.bride} =
          </p>
          <figure className={`${styles.polaroid} ${styles.polaroidRight}`}>
            <div>
              <Photo alt={`${invite.bride} и ${invite.groom}`} src={portraitImage} />
            </div>
          </figure>
          <Heart className={styles.storyHeartTwo} />
        </section>

        <section className={styles.when} data-reveal>
          <Heart className={styles.looseHeart} />
          <p>
            Поэтому мы приглашаем вас разделить с нами радостный день, в котором мы станем семьёй!
          </p>
          <div className={styles.monthRow}>
            <span>{month}</span>
            <span>{year}</span>
          </div>
          <div className={styles.calendar}>
            {calendarDays.map((item) => (
              <div
                className={item.selected ? styles.selectedDay : undefined}
                key={`${item.label}-${item.day}`}
              >
                <span>{item.label}</span>
                <strong>{item.day}</strong>
                {item.selected ? <Heart /> : null}
              </div>
            ))}
          </div>
          <time dateTime={`${invite.date}T${invite.time}`}>
            {formatDate(invite.date)} · {invite.time}
          </time>
        </section>

        <section className={styles.location} data-reveal>
          <DoodleTitle kicker="Где встречаемся?">Локация</DoodleTitle>
          <h3>{invite.venue}</h3>
          {locationAddress ? <address>{locationAddress}</address> : null}
          <figure className={styles.venuePhoto}>
            <div>
              <Photo alt={`Место проведения — ${invite.venue}`} src={venueImage} />
            </div>
          </figure>
          {mapUrl ? (
            <a className={styles.mapLink} href={mapUrl} rel="noreferrer" target="_blank">
              <MapPin aria-hidden size={16} /> Карта
            </a>
          ) : null}
        </section>

        {invite.showSchedule ? (
          <section className={styles.program} data-reveal>
            <DoodleTitle kicker={formatDate(invite.date)}>Во сколько?</DoodleTitle>
            <ol>
              {invite.schedule.map((item, index) => (
                <li key={`${item.time}-${index}`}>
                  <time>{item.time}</time>
                  <div>
                    <h3>{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                  <Heart />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {invite.showDressCode ? (
          <section className={styles.sharedPaper} data-reveal>
            <p className={styles.marginNote}>Будем в одной палитре</p>
            <InvitationDressCodeBlock
              className={styles.sharedBlock}
              colors={invite.dressCodeColors}
              text={invite.dressCode}
              variant="vanilla"
            />
          </section>
        ) : null}

        {invite.showAdditionalInfo || invite.showGroupChat ? (
          <section className={styles.details} data-reveal>
            <DoodleTitle>На заметку</DoodleTitle>
            <InvitationAdditionalInfoBlock
              className={styles.sharedBlock}
              show={invite.showAdditionalInfo}
              text={invite.additionalInfo}
              variant="vanilla"
            />
            <InvitationGroupChatBlock
              className={styles.sharedBlock}
              show={invite.showGroupChat}
              text={invite.groupChatText}
              url={invite.groupChatUrl}
              variant="vanilla"
            />
          </section>
        ) : null}

        {invite.showRsvp ? (
          <section className={styles.rsvp} data-reveal id="rsvp">
            <Heart className={styles.rsvpHeart} />
            <DoodleTitle kicker="Очень ждём ответ">Будете с нами?</DoodleTitle>
            <p>{invite.rsvpText}</p>
            <time dateTime={invite.rsvpDate}>Ответьте до {formatDate(invite.rsvpDate)}</time>
            <InvitationRsvpForm
              className={styles.rsvpForm}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
              variant="vanilla"
            />
          </section>
        ) : null}

        <section className={styles.closing} data-reveal>
          <p className={styles.closingNote}>До встречи на нашей свадьбе!</p>
          <figure className={styles.closingPhoto}>
            <div>
              <Photo alt={`${invite.groom} и ${invite.bride}`} src={portraitImage} />
            </div>
          </figure>
          <h2>
            {invite.groom} + {invite.bride}
          </h2>
          <time dateTime={invite.date}>{formatDate(invite.date)}</time>
          <a href="#scribble-top">
            <ArrowUp aria-hidden size={16} /> Наверх
          </a>
        </section>
      </article>
    </>
  );
}
