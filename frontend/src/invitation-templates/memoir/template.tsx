"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowUp, MapPin } from "lucide-react";
import { formatInviteDate, parseDate } from "@/lib/invite-date";
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

type MemoirTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type MemoirStyle = CSSProperties & {
  "--memoir-bg": string;
  "--memoir-paper": string;
  "--memoir-ink": string;
  "--memoir-photo-text": string;
  "--memoir-muted": string;
  "--memoir-blue": string;
  "--memoir-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createMemoirStyle(inviteVars: InviteVars): MemoirStyle {
  return {
    ...inviteVars,
    "--memoir-bg": inviteVars["--invite-bg"],
    "--memoir-paper": inviteVars["--invite-surface"],
    "--memoir-ink": inviteVars["--invite-ink"],
    "--memoir-photo-text": inviteVars["--invite-photo-text"],
    "--memoir-muted": inviteVars["--invite-muted"],
    "--memoir-blue": inviteVars["--invite-accent"],
    "--memoir-line": inviteVars["--invite-line"],
  };
}


function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("ru-RU") + value.slice(1);
}

function SectionHeading({ children, note }: Readonly<{ children: string; note: string }>) {
  return (
    <header className={styles.sectionHeading}>
      <p>{note}</p>
      <h2>{children}</h2>
      <span aria-hidden />
    </header>
  );
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<Pick<MemoirTemplateProps, "coverImage" | "invite">>) {
  return (
    <section className={styles.hero}>
      <p className={styles.invitationLabel}>приглашение на свадьбу</p>
      <h1 className={styles.heroTitle}>Мы женимся!</h1>
      <p className={styles.heroNames}>
        <span>{invite.groom}</span>
        <i>&amp;</i>
        <span>{invite.bride}</span>
      </p>

      <figure className={styles.childhoodCard}>
        <div className={styles.tape} aria-hidden />
        <div className={styles.childhoodPhoto}>
          <Image
            alt={`Детский снимок ${invite.bride} и ${invite.groom}`}
            className={styles.photo}
            fill
            loading="eager"
            sizes="(max-width: 720px) 78vw, 430px"
            src={coverImage}
            unoptimized={isRuntimeImageSource(coverImage)}
          />
        </div>
        <figcaption>
          <span>когда всё только начиналось</span>
          <time dateTime={invite.date}>{formatInviteDate(invite.date, { year: "numeric" })}</time>
        </figcaption>
      </figure>

      <div className={styles.heroDoodle} aria-hidden>
        <span>♡</span>
        <span>✦</span>
        <span>♡</span>
      </div>
    </section>
  );
}

function GreetingSection({ invite }: Readonly<Pick<MemoirTemplateProps, "invite">>) {
  return (
    <section className={styles.greeting} data-reveal>
      <p>Дорогие гости!</p>
      <div className={styles.greetingRule} aria-hidden />
      <div className={styles.greetingCopy}>
        {invite.lead.trim() ? <p>{invite.lead}</p> : null}
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
    </section>
  );
}

function WhenSection({
  calendarDays,
  invite,
}: Readonly<Pick<MemoirTemplateProps, "calendarDays" | "invite">>) {
  return (
    <section className={styles.when} data-reveal>
      <SectionHeading note="сохраните дату">Когда</SectionHeading>
      <p className={styles.month}>
        {capitalize(formatInviteDate(invite.date, { month: "long" }))}{" "}
        {parseDate(invite.date).getFullYear()}
      </p>
      <div className={styles.calendar} aria-label="Календарь недели">
        {calendarDays.map((item, index) => (
          <div
            aria-current={item.selected ? "date" : undefined}
            className={item.selected ? styles.calendarSelected : undefined}
            key={`${item.day}-${index}`}
          >
            <small>{item.label}</small>
            <strong>{item.day}</strong>
          </div>
        ))}
      </div>
      <p className={styles.startTime}>
        начинаем в <strong>{invite.time}</strong>
      </p>
    </section>
  );
}

function WhereSection({
  invite,
  venueImage,
}: Readonly<Pick<MemoirTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const city = invite.city.trim();
  const address = invite.address.trim();

  return (
    <section className={styles.where} data-reveal>
      <SectionHeading note="точка встречи">Место</SectionHeading>
      <div className={styles.venueCopy}>
        <h3>{invite.venue}</h3>
        {city || address ? (
          <address>
            {city}
            {city && address ? <br /> : null}
            {address}
          </address>
        ) : null}
        {mapUrl ? (
          <a href={mapUrl} rel="noreferrer" target="_blank">
            <MapPin aria-hidden size={14} />
            Посмотреть на карте
          </a>
        ) : null}
      </div>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Место проведения — ${invite.venue}`}
          className={styles.photoMono}
          fill
          sizes="(max-width: 720px) 84vw, 480px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        {city ? (
          <figcaption>
            {city}
            <span aria-hidden>↗</span>
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function ProgramSection({ invite }: Readonly<Pick<MemoirTemplateProps, "invite">>) {
  if (!invite.showSchedule) {
    return null;
  }

  return (
    <section className={styles.program} data-reveal>
      <div className={styles.programFrame}>
        <p className={styles.programNote}>наш день</p>
        <h2>Тайминг</h2>
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
      </div>
      <p className={styles.programFooter}>Каждый момент — часть нашей истории</p>
    </section>
  );
}

function DressCodeSection({ invite }: Readonly<Pick<MemoirTemplateProps, "invite">>) {
  if (!invite.showDressCode) {
    return null;
  }

  return (
    <section className={styles.dress} data-reveal>
      <p className={styles.dressScript} aria-hidden>
        Дресс-код
      </p>
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
  return (
    (invite.showAdditionalInfo && Boolean(invite.additionalInfo.trim())) ||
    (invite.showGroupChat && Boolean(invite.groupChatUrl.trim()))
  );
}

function DetailsSection({ invite }: Readonly<Pick<MemoirTemplateProps, "invite">>) {
  if (!hasDetailsContent(invite)) {
    return null;
  }

  return (
    <section className={styles.details} data-reveal>
      <SectionHeading note="на заметку">Детали</SectionHeading>
      <div className={styles.detailsStack}>
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
      </div>
    </section>
  );
}

function RsvpSection({ invite, siteId }: Readonly<Pick<MemoirTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) {
    return null;
  }

  return (
    <section className={styles.rsvp} data-reveal id="rsvp">
      <p className={styles.rsvpScript}>Будем очень ждать вас</p>
      <h2>Подтвердите присутствие</h2>
      <p>{invite.rsvpText}</p>
      <time dateTime={invite.rsvpDate}>Ответьте до {formatNumericDate(invite.rsvpDate)}</time>
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
}: Readonly<Pick<MemoirTemplateProps, "invite" | "portraitImage">>) {
  return (
    <section className={styles.closing} data-reveal>
      <div className={styles.closingCopy}>
        <p>а теперь — навсегда</p>
        <h2>
          <span>{invite.groom}</span>
          <i>&amp;</i>
          <span>{invite.bride}</span>
        </h2>
      </div>
      <figure className={styles.closingPhoto}>
        <Image
          alt={`${invite.groom} и ${invite.bride}`}
          className={styles.photoMono}
          fill
          sizes="(max-width: 720px) 88vw, 520px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
        <figcaption>
          <span>с любовью</span>
          <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
        </figcaption>
      </figure>
      <a className={styles.backToTop} href="#memoir-top">
        В начало
        <ArrowUp aria-hidden size={14} />
      </a>
    </section>
  );
}

export default function MemoirTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: MemoirTemplateProps) {
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
        id="memoir-top"
        ref={shellRef}
        style={createMemoirStyle(inviteVars)}
      >
        <div className={styles.paper}>
          <HeroSection coverImage={coverImage} invite={invite} />
          <GreetingSection invite={invite} />
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
