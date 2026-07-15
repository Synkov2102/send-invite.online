"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
import { formatDate, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import {
  InvitationDressCodeBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";
import {
  archPhotoReveal,
  copyFromLeft,
  copyFromRight,
  dateReveal,
  heroSequence,
  mastheadReveal,
  nameFromLeft,
  nameFromRight,
  photoMaskReveal,
  plusReveal,
  revealViewport,
  sectionReveal,
  staggerContainer,
  staggerItem,
} from "./motion";

type ElectricTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type ElectricStyle = CSSProperties & {
  "--electric-bg": string;
  "--electric-surface": string;
  "--electric-ink": string;
  "--electric-muted": string;
  "--electric-accent": string;
  "--electric-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createElectricStyle(inviteVars: InviteVars): ElectricStyle {
  return {
    ...inviteVars,
    "--electric-bg": inviteVars["--invite-bg"],
    "--electric-surface": inviteVars["--invite-surface"],
    "--electric-ink": inviteVars["--invite-ink"],
    "--electric-muted": inviteVars["--invite-muted"],
    "--electric-accent": inviteVars["--invite-accent"],
    "--electric-line": inviteVars["--invite-line"],
  };
}

function getDateParts(value: string) {
  const date = parseDate(value);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: date.getFullYear(),
  };
}

function HeroSection({ coverImage, invite }: Readonly<{ coverImage: string; invite: InviteState }>) {
  const date = getDateParts(invite.date);

  return (
    <motion.header animate="visible" className={styles.hero} initial="hidden" variants={heroSequence}>
      <motion.div className={styles.masthead} variants={mastheadReveal}>
        <span>Wedding invitation</span>
        <span>{date.year}</span>
        <span>{invite.city}</span>
      </motion.div>
      <motion.div className={styles.heroNames} variants={heroSequence}>
        <motion.span variants={nameFromLeft}>{invite.bride}</motion.span>
        <motion.span className={styles.plus} variants={plusReveal}>+</motion.span>
        <motion.span variants={nameFromRight}>{invite.groom}</motion.span>
      </motion.div>
      <div className={styles.heroPhotoMotion}>
        <motion.div className={styles.heroPhoto} variants={archPhotoReveal}>
          <Image
            alt="Фотография пары"
            className={styles.photo}
            fill
            loading="eager"
            sizes="(max-width: 720px) 78vw, 520px"
            src={coverImage}
            unoptimized={isRuntimeImageSource(coverImage)}
          />
        </motion.div>
      </div>
      <motion.time className={styles.heroDate} dateTime={invite.date} variants={dateReveal}>
        <span>{date.day}</span>
        <span>/</span>
        <span>{date.month}</span>
      </motion.time>
      <motion.p className={styles.scrollNote} variants={staggerItem}>Листайте вниз — там всё самое важное</motion.p>
    </motion.header>
  );
}

function GreetingSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <motion.section className={styles.greeting} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.span className={styles.sectionNumber} variants={copyFromLeft}>01</motion.span>
      <motion.p variants={copyFromRight}>{invite.lead}</motion.p>
      <motion.span className={styles.greetingMark} variants={plusReveal}>*</motion.span>
    </motion.section>
  );
}

function DateSection({ calendarDays, invite }: Readonly<Pick<ElectricTemplateProps, "calendarDays" | "invite">>) {
  return (
    <motion.section className={styles.dateSection} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.div className={styles.sectionHeading} variants={copyFromRight}>
        <span className={styles.sectionNumber}>02</span>
        <h2>Когда</h2>
      </motion.div>
      <motion.div className={styles.dateCopy} variants={copyFromLeft}>
        <time dateTime={invite.date}>{formatDate(invite.date)}</time>
        <strong>{invite.time}</strong>
      </motion.div>
      <motion.div className={styles.calendar} variants={staggerContainer}>
        {calendarDays.map((item) => (
          <motion.div className={item.selected ? styles.selectedDay : undefined} key={`${item.label}-${item.day}`} variants={staggerItem}>
            <span>{item.label}</span>
            <strong>{item.day}</strong>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

function PlaceSection({ invite, venueImage }: Readonly<Pick<ElectricTemplateProps, "invite" | "venueImage">>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <motion.section className={styles.placeSection} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.div className={styles.placePhoto} variants={photoMaskReveal}>
        <Image
          alt={`Площадка ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 56vw"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
      </motion.div>
      <motion.div className={styles.placeCopy} variants={copyFromRight}>
        <span className={styles.sectionNumber}>03</span>
        <h2>Где</h2>
        <p>{invite.venue}</p>
        <address>{invite.address}, {invite.city}</address>
        {mapUrl ? <a href={mapUrl} rel="noreferrer" target="_blank">Открыть карту ↗</a> : null}
      </motion.div>
    </motion.section>
  );
}

function ProgramSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <motion.section className={styles.programSection} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.div className={styles.sectionHeading} variants={copyFromRight}>
        <span className={styles.sectionNumber}>04</span>
        <h2>Программа</h2>
      </motion.div>
      <motion.ol className={styles.programList} variants={staggerContainer}>
        {invite.schedule.map((item, index) => (
          <motion.li key={`${item.time}-${index}`} variants={staggerItem}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <span>{String(index + 1).padStart(2, "0")}</span>
          </motion.li>
        ))}
      </motion.ol>
    </motion.section>
  );
}

function DressSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <motion.section className={styles.dressSection} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.span className={styles.sectionNumber} variants={copyFromLeft}>05</motion.span>
      <motion.div variants={copyFromRight}>
        <InvitationDressCodeBlock
          className={styles.dressBlock}
          colors={invite.dressCodeColors}
          text={invite.dressCode}
          variant="aqua"
        />
      </motion.div>
    </motion.section>
  );
}

function RsvpSection({ invite, siteId }: Readonly<Pick<ElectricTemplateProps, "invite" | "siteId">>) {
  if (!invite.showRsvp) return null;

  return (
    <motion.section className={styles.rsvpSection} id="rsvp" initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.div className={styles.rsvpIntro} variants={copyFromLeft}>
        <span className={styles.sectionNumber}>06</span>
        <h2>Вы с нами?</h2>
        <p>{invite.rsvpText}</p>
        <small>Ответьте до {formatDate(invite.rsvpDate)}</small>
      </motion.div>
      <motion.div variants={copyFromRight}>
        <InvitationRsvpForm
          className={styles.rsvpForm}
          questions={invite.rsvpQuestions}
          rsvpDate={invite.rsvpDate}
          siteId={siteId}
          variant="aqua"
        />
      </motion.div>
    </motion.section>
  );
}

function ClosingSection({ invite, portraitImage }: Readonly<Pick<ElectricTemplateProps, "invite" | "portraitImage">>) {
  return (
    <motion.footer className={styles.closing} initial="hidden" variants={sectionReveal} viewport={revealViewport} whileInView="visible">
      <motion.div className={styles.closingPhoto} variants={photoMaskReveal}>
        <Image
          alt="Свадебный портрет пары"
          className={styles.photo}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
      </motion.div>
      <motion.div className={styles.closingCopy} variants={copyFromRight}>
        <span>До встречи!</span>
        <p>{invite.bride}</p>
        <b>+</b>
        <p>{invite.groom}</p>
      </motion.div>
    </motion.footer>
  );
}

export default function ElectricTemplate(props: ElectricTemplateProps) {
  const { calendarDays, coverImage, invite, inviteVars, portraitImage, siteId, venueImage } = props;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 450);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <InvitationMusicPlayer enabled={invite.musicEnabled} title={invite.musicTitle} url={invite.musicUrl} />
      <article className={styles.shell} style={createElectricStyle(inviteVars)}>
        <div aria-hidden={isReady} className={styles.loader} data-hidden={isReady}>
          <span>Electric vows</span>
          <strong>Загружаем приглашение</strong>
          <i aria-hidden="true" />
        </div>
        <HeroSection coverImage={coverImage} invite={invite} />
        <GreetingSection invite={invite} />
        <DateSection calendarDays={calendarDays} invite={invite} />
        <PlaceSection invite={invite} venueImage={venueImage} />
        <ProgramSection invite={invite} />
        <DressSection invite={invite} />
        <RsvpSection invite={invite} siteId={siteId} />
        <ClosingSection invite={invite} portraitImage={portraitImage} />
      </article>
    </MotionConfig>
  );
}
