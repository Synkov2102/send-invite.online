"use client";

import Image from "next/image";
import { useId, type CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { formatInviteDate, getMonthCalendar, parseDate } from "@/lib/invite-date";
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

type VelvetTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type VelvetStyle = CSSProperties & {
  "--velvet": string;
  "--paper": string;
  "--ink": string;
  "--muted": string;
  "--accent": string;
  "--line": string;
  "--material-filter": string;
  "--paper-filter": string;
};

const decorativeImages = {
  envelope: "/images/velvet-ticket/envelope-cutout.webp",
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createVelvetStyle(inviteVars: InviteVars, filterId: string): VelvetStyle {
  return {
    ...inviteVars,
    "--velvet": inviteVars["--invite-bg"],
    "--paper": inviteVars["--invite-surface"],
    "--ink": inviteVars["--invite-ink"],
    "--muted": inviteVars["--invite-muted"],
    "--accent": inviteVars["--invite-accent"],
    "--line": inviteVars["--invite-line"],
    "--material-filter": `url("#${filterId}-material")`,
    "--paper-filter": `url("#${filterId}-paper")`,
  };
}

function DecorativePaletteFilters({ id }: Readonly<{ id: string }>) {
  return (
    <svg className={styles.paletteFilters} aria-hidden width="0" height="0" focusable="false">
      <defs>
        <filter id={`${id}-material`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" result="texture" />
          <feFlood floodColor="var(--paper)" result="paper" />
          <feBlend in="texture" in2="paper" mode="multiply" result="paperTexture" />
          <feFlood floodColor="var(--accent)" result="accent" />
          <feBlend in="accent" in2="texture" mode="color" result="tinted" />
          {/* Red material is tinted separately so the envelope's paper insert stays neutral. */}
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  4 -4 0 0 0" result="materialMask" />
          <feComposite in="tinted" in2="materialMask" operator="in" result="material" />
          <feBlend in="material" in2="paperTexture" mode="normal" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={`${id}-paper`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" result="texture" />
          <feFlood floodColor="var(--paper)" result="paper" />
          <feBlend in="texture" in2="paper" mode="multiply" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

function formatNumericDate(value: string) {
  const date = parseDate(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function Hero({ invite }: Readonly<Pick<VelvetTemplateProps, "invite">>) {
  return (
    <section className={styles.hero}>
      <div className={styles.ticket}>
        <p className={styles.ticketHeading}>
          Приглашаем
          <span>На свадьбу</span>
        </p>
        <div className={styles.envelope}>
          <Image
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 64vw, 410px"
            src={decorativeImages.envelope}
          />
          <h1 className={styles.heroNames}>
            <span>{invite.bride}</span>
            <i>&amp;</i>
            <span>{invite.groom}</span>
          </h1>
        </div>
        <a className={styles.ticketStub} href="#greeting">
          <span>Ваш билет</span>
          <span className={styles.barcode} aria-hidden />
          <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
        </a>
      </div>
    </section>
  );
}

function Greeting({
  coverImage,
  invite,
  portraitImage,
  venueImage,
}: Readonly<Pick<VelvetTemplateProps, "coverImage" | "invite" | "portraitImage" | "venueImage">>) {
  const images = [coverImage, portraitImage, venueImage];

  return (
    <section className={styles.greeting} id="greeting">
      <p className={styles.script} aria-hidden>for love forever</p>
      <h2>Дорогие родные<br />и близкие</h2>
      <div className={styles.collage}>
        {images.map((src, index) => (
          <figure key={`${src}-${index}`}>
            <Image
              alt=""
              className={styles.userPhoto}
              fill
              sizes="(max-width: 760px) 34vw, 230px"
              src={src}
              unoptimized={isRuntimeImageSource(src)}
            />
          </figure>
        ))}
      </div>
      <p className={styles.lead}>{invite.lead}</p>
    </section>
  );
}

function DateAndPlace({
  invite,
  venueImage,
}: Readonly<Pick<VelvetTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const date = parseDate(invite.date);
  const month = formatInviteDate(invite.date, { day: "numeric", month: "long" }).replace(/^\d+\s*/, "");
  const weeks = getMonthCalendar(invite.date);

  return (
    <section className={styles.datePlace}>
      <header className={styles.dateHeading}>
        <p>тот самый день</p>
        <h2>Дата свадьбы</h2>
      </header>
      <div className={styles.dateStationery}>
        <div className={styles.dateCard}>
          <p className={styles.dateWeekday}>{formatInviteDate(invite.date, { weekday: "long" })}</p>
          <time className={styles.dateDisplay} dateTime={invite.date}>
            <strong>{date.getDate()}</strong>
            <span>{month}</span>
            <small>{date.getFullYear()}</small>
          </time>
          <table className={styles.monthCalendar} aria-label={`Календарь: ${formatInviteDate(invite.date, { month: "long", year: "numeric" })}`}>
            <thead>
              <tr>
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((label) => <th key={label} scope="col">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, index) => (
                <tr key={index}>
                  {week.map((day, weekday) => (
                    <td key={weekday}>
                      {day !== null ? (
                        <span
                          aria-label={day === date.getDate() ? `${day} — день свадьбы` : undefined}
                          className={day === date.getDate() ? styles.selectedDay : undefined}
                        >{day}</span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.dateNote}>Начало в <time>{invite.time}</time></p>
        </div>
        <span className={styles.dateSeal} aria-hidden>
          <Image alt="" fill sizes="(max-width: 640px) 22vw, 140px" src="/images/velvet-ticket/rose-seal.webp" />
        </span>
      </div>
      <figure className={styles.venuePhoto}>
        <Image
          alt={`Место проведения — ${invite.venue}`}
          className={styles.userPhoto}
          fill
          sizes="(max-width: 760px) 82vw, 560px"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
      </figure>
      <div className={styles.placeCopy}>
        <p>Место встречи</p>
        <h2>{invite.venue}</h2>
        <address>{invite.city}, {invite.address}</address>
        {mapUrl ? (
          <a href={mapUrl} rel="noreferrer" target="_blank">
            <MapPin aria-hidden size={14} /> открыть карту
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Program({ invite }: Readonly<Pick<VelvetTemplateProps, "invite">>) {
  if (!invite.showSchedule) return null;

  return (
    <section className={styles.program}>
      <div className={styles.programHeading}>
        <span className={styles.programBow} aria-hidden>
          <Image alt="" fill sizes="(max-width: 640px) 29vw, 186px" src="/images/velvet-ticket/silk-bow.webp" />
        </span>
        <p className={styles.programDate}>{formatNumericDate(invite.date)}</p>
        <h2>Программа</h2>
        <p className={styles.programScript}>нашего дня</p>
      </div>
      <ol className={styles.programList}>
        {invite.schedule.map((item, index) => (
          <li key={`${item.time}-${index}`}>
            <div className={styles.programEvent}>
              <span className={styles.eventNumber} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              <time>{item.time}</time>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.programClosing}>каждый момент — вместе</p>
    </section>
  );
}

function DressCode({ invite, portraitImage }: Readonly<Pick<VelvetTemplateProps, "invite" | "portraitImage">>) {
  if (!invite.showDressCode) return null;

  return (
    <section className={styles.dressCode}>
      <figure>
        <Image
          alt=""
          className={styles.userPhoto}
          fill
          sizes="(max-width: 760px) 70vw, 480px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </figure>
      <InvitationDressCodeBlock
        className={styles.dressBlock}
        colors={invite.dressCodeColors}
        text={invite.dressCode}
        variant="aqua"
      />
    </section>
  );
}

function Details({ invite }: Readonly<Pick<VelvetTemplateProps, "invite">>) {
  if (!invite.showGroupChat && !invite.showAdditionalInfo) return null;

  return (
    <section className={styles.details}>
      <h2>Детали</h2>
      <div className={styles.laceCard}>
        <p className={styles.laceMonogram} aria-hidden>
          {invite.bride.trim().charAt(0)} &amp; {invite.groom.trim().charAt(0)}
        </p>
        <div className={styles.detailBlocks}>
          <InvitationAdditionalInfoBlock
            className={styles.detailBlock}
            show={invite.showAdditionalInfo}
            text={invite.additionalInfo}
            variant="aqua"
          />
          <InvitationGroupChatBlock
            className={styles.detailBlock}
            show={invite.showGroupChat}
            text={invite.groupChatText}
            url={invite.groupChatUrl}
            variant="aqua"
          />
        </div>
      </div>
    </section>
  );
}

function Rsvp({ invite, siteId }: Readonly<Pick<VelvetTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) return null;

  return (
    <section className={styles.rsvp}>
      <p className={styles.eyebrow}>мы будем ждать вас</p>
      <h2>Будете<br />с нами?</h2>
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

function Closing({
  invite,
  portraitImage,
}: Readonly<Pick<VelvetTemplateProps, "invite" | "portraitImage">>) {
  return (
    <section className={styles.closing}>
      <figure>
        <Image
          alt={`${invite.bride} и ${invite.groom}`}
          className={styles.userPhoto}
          fill
          loading="eager"
          sizes="(max-width: 640px) 100vw, 640px"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </figure>
      <div>
        <p>до встречи на нашей свадьбе</p>
        <h2>{invite.bride} <i>&amp;</i> {invite.groom}</h2>
        <time dateTime={invite.date}>{formatNumericDate(invite.date)}</time>
      </div>
    </section>
  );
}

export default function VelvetTemplate(props: VelvetTemplateProps) {
  const { invite, inviteVars } = props;
  const filterId = useId();

  return (
    <>
      <InvitationMusicPlayer enabled={invite.musicEnabled} title={invite.musicTitle} url={invite.musicUrl} />
      <article className={styles.shell} style={createVelvetStyle(inviteVars, filterId)}>
        <DecorativePaletteFilters id={filterId} />
        <Hero invite={invite} />
        <Greeting coverImage={props.coverImage} invite={invite} portraitImage={props.portraitImage} venueImage={props.venueImage} />
        <DateAndPlace invite={invite} venueImage={props.venueImage} />
        <Program invite={invite} />
        <DressCode invite={invite} portraitImage={props.portraitImage} />
        <Details invite={invite} />
        <Rsvp invite={invite} siteId={props.siteId} />
        <Closing invite={invite} portraitImage={props.portraitImage} />
      </article>
    </>
  );
}
