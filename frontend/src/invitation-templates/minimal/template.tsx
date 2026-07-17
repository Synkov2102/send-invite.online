"use client";

import { motion, MotionConfig } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { formatDate, formatMonth, parseDate } from "@/lib/invite-date";
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
import {
  copyReveal,
  illustrationReveal,
  photoReveal,
  revealViewport,
  sectionReveal,
  staggerContainer,
  staggerItem,
} from "./motion";
import styles from "./template.module.css";

type MinimalTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type MinimalStyle = CSSProperties & {
  "--minimal-bg": string;
  "--minimal-paper": string;
  "--minimal-ink": string;
  "--minimal-photo-text": string;
  "--minimal-muted": string;
  "--minimal-accent": string;
  "--minimal-line": string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function createMinimalStyle(inviteVars: InviteVars): MinimalStyle {
  return {
    ...inviteVars,
    "--minimal-bg": inviteVars["--invite-bg"],
    "--minimal-paper": inviteVars["--invite-surface"],
    "--minimal-ink": inviteVars["--invite-ink"],
    "--minimal-photo-text": inviteVars["--invite-photo-text"],
    "--minimal-muted": inviteVars["--invite-muted"],
    "--minimal-accent": inviteVars["--invite-accent"],
    "--minimal-line": inviteVars["--invite-line"],
  };
}

function formatHeroDate(value: string) {
  if (!value) {
    return {
      day: "—",
      month: "дата",
      year: "уточняется",
    };
  }

  const date = parseDate(value);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: formatMonth(value).toLocaleLowerCase("ru-RU"),
    year: date.getFullYear(),
  };
}

function TableIllustration() {
  return <span aria-hidden className={styles.tableIllustration} />;
}

function HeroSection({ invite }: Readonly<{ invite: InviteState }>) {
  const date = formatHeroDate(invite.date);

  return (
    <motion.section
      animate="visible"
      className={styles.hero}
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div className={styles.heroTopline} variants={staggerItem}>
        <span>приглашение</span>
        <span>{date.year}</span>
      </motion.div>
      <motion.h1 className={styles.heroNames} variants={copyReveal}>
        <span>{invite.groom}</span>
        <i>&</i>
        <span>{invite.bride}</span>
      </motion.h1>
      <motion.div className={styles.heroDate} variants={copyReveal}>
        <span>{date.month}</span>
        <strong>{date.day}</strong>
        <span>{date.year}</span>
      </motion.div>
      <motion.div className={styles.heroIllustration} variants={illustrationReveal}>
        <TableIllustration />
      </motion.div>
      <motion.a className={styles.scrollCue} href="#minimal-greeting" variants={staggerItem}>
        <span>узнать детали</span>
        <ArrowDown aria-hidden size={16} strokeWidth={1.4} />
      </motion.a>
    </motion.section>
  );
}

function GreetingSection({
  coverImage,
  invite,
}: Readonly<{ coverImage: string; invite: InviteState }>) {
  return (
    <motion.section
      className={styles.greeting}
      id="minimal-greeting"
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.greetingInner}>
        <motion.div className={styles.sectionNumber} variants={copyReveal}>01</motion.div>
        <motion.div className={styles.greetingCopy} variants={copyReveal}>
          <p className={styles.scriptTitle}>Дорогие гости,</p>
          <p className={styles.lead}>{invite.lead}</p>
          <time dateTime={invite.date}>{formatDate(invite.date)}</time>
        </motion.div>
        <motion.figure className={styles.coverPhoto} variants={photoReveal}>
          <Image
            alt="Свадебный портрет пары"
            className={styles.photo}
            fill
            sizes="(max-width: 760px) 82vw, 410px"
            src={coverImage}
            unoptimized={isRuntimeImageSource(coverImage)}
          />
          <figcaption>{invite.groom} & {invite.bride}</figcaption>
        </motion.figure>
      </div>
    </motion.section>
  );
}

function DateSection({
  calendarDays,
  invite,
}: Readonly<Pick<MinimalTemplateProps, "calendarDays" | "invite">>) {
  return (
    <motion.section
      className={styles.dateSection}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.dateInner}>
        <motion.header className={styles.sectionHeader} variants={copyReveal}>
          <span>02 / когда</span>
          <p className={styles.scriptTitle}>Сохраните дату</p>
          <h2>{formatDate(invite.date)}</h2>
          <p>Начало праздника в {invite.time}</p>
        </motion.header>
        {invite.date ? (
          <motion.div className={styles.week} variants={staggerContainer}>
            {calendarDays.map((day) => (
              <motion.div
                className={day.selected ? styles.selectedDay : undefined}
                key={`${day.label}-${day.day}`}
                variants={staggerItem}
              >
                <span>{day.label}</span>
                <strong>{day.day}</strong>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
        <motion.div className={styles.dateOrnament} variants={illustrationReveal}>
          <span />
          <i>этот день станет началом нашей семейной истории</i>
          <span />
        </motion.div>
      </div>
    </motion.section>
  );
}

function VenueSection({
  invite,
  venueImage,
}: Readonly<{ invite: InviteState; venueImage: string }>) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <motion.section
      className={styles.venueSection}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <motion.figure className={styles.venuePhoto} variants={photoReveal}>
        <Image
          alt={`Площадка ${invite.venue}`}
          className={styles.photo}
          fill
          sizes="100vw"
          src={venueImage}
          unoptimized={isRuntimeImageSource(venueImage)}
        />
        <div className={styles.venueShade} />
      </motion.figure>
      <motion.div className={styles.venueCard} variants={copyReveal}>
        <span className={styles.sectionLabel}>03 / где</span>
        <MapPin aria-hidden size={24} strokeWidth={1.25} />
        <h2>{invite.venue}</h2>
        <p>{invite.address}<br />{invite.city}</p>
        {mapUrl ? (
          <a href={mapUrl} rel="noreferrer" target="_blank">
            открыть карту
            <ArrowUpRight aria-hidden size={15} strokeWidth={1.4} />
          </a>
        ) : null}
      </motion.div>
    </motion.section>
  );
}

function ProgramSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <motion.section
      className={styles.program}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.programInner}>
        <motion.header className={styles.programHeader} variants={copyReveal}>
          <span className={styles.sectionLabel}>04 / программа</span>
          <p className={styles.scriptTitle}>Как всё будет</p>
          <h2>План нашего дня</h2>
        </motion.header>
        <motion.ol className={styles.timeline} variants={staggerContainer}>
          {invite.schedule.map((item, index) => (
            <motion.li key={`${item.time}-${index}`} variants={staggerItem}>
              <span className={styles.timelineIndex}>{String(index + 1).padStart(2, "0")}</span>
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </motion.section>
  );
}

function DressCodeSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <motion.section
      className={styles.dressSection}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <motion.div className={styles.dressInner} variants={copyReveal}>
        <span className={styles.sectionLabel}>05 / детали</span>
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

function GroupChatSection({ invite }: Readonly<{ invite: InviteState }>) {
  if (!invite.showGroupChat || !invite.groupChatUrl.trim()) {
    return null;
  }

  return (
    <motion.section
      className={styles.groupChatSection}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <motion.div className={styles.groupChatInner} variants={copyReveal}>
        <span className={styles.sectionLabel}>06 / чат</span>
        <p className={styles.scriptTitle}>На связи</p>
        <h2>Общий чат гостей</h2>
        <InvitationGroupChatBlock
          className={styles.groupChatBlock}
          show={invite.showGroupChat}
          text={invite.groupChatText}
          url={invite.groupChatUrl}
          variant="aqua"
        />
      </motion.div>
    </motion.section>
  );
}

function AdditionalInfoSection({ invite }: Readonly<{ invite: InviteState }>) {
  if (!invite.showAdditionalInfo || !invite.additionalInfo.trim()) {
    return null;
  }

  return (
    <motion.section
      className={styles.additionalInfoSection}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <motion.div className={styles.additionalInfoInner} variants={copyReveal}>
        <span className={styles.sectionLabel}>07 / заметка</span>
        <p className={styles.scriptTitle}>На всякий случай</p>
        <InvitationAdditionalInfoBlock
          className={styles.additionalInfoBlock}
          show={invite.showAdditionalInfo}
          text={invite.additionalInfo}
          variant="aqua"
        />
      </motion.div>
    </motion.section>
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
    <motion.section
      className={styles.rsvp}
      id="rsvp"
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <div className={styles.rsvpInner}>
        <motion.header variants={copyReveal}>
          <span className={styles.sectionLabel}>08 / ваш ответ</span>
          <p className={styles.scriptTitle}>Будете с нами?</p>
          <h2>Подтвердите присутствие</h2>
          <p>{invite.rsvpText}</p>
          <time dateTime={invite.rsvpDate}>Ответьте до {formatDate(invite.rsvpDate)}</time>
        </motion.header>
        <motion.div variants={copyReveal}>
          <InvitationRsvpForm
            className={styles.rsvpForm}
            questions={invite.rsvpQuestions}
            rsvpDate={invite.rsvpDate}
            siteId={siteId}
            variant="aqua"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

function ClosingSection({
  invite,
  portraitImage,
}: Readonly<{ invite: InviteState; portraitImage: string }>) {
  return (
    <motion.footer
      className={styles.closing}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      <motion.figure variants={photoReveal}>
        <Image
          alt="Портрет молодожёнов"
          className={styles.photo}
          fill
          sizes="100vw"
          src={portraitImage}
          unoptimized={isRuntimeImageSource(portraitImage)}
        />
        <div className={styles.closingShade} />
      </motion.figure>
      <motion.div className={styles.closingCopy} variants={copyReveal}>
        <p>до встречи на нашей свадьбе</p>
        <div>
          <span>{invite.groom}</span>
          <i>&</i>
          <span>{invite.bride}</span>
        </div>
        <time dateTime={invite.date}>{formatDate(invite.date)}</time>
      </motion.div>
    </motion.footer>
  );
}

export default function MinimalTemplate({
  calendarDays,
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: MinimalTemplateProps) {
  return (
    <MotionConfig reducedMotion="user">
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={createMinimalStyle(inviteVars)}>
        <HeroSection invite={invite} />
        <GreetingSection coverImage={coverImage} invite={invite} />
        <DateSection calendarDays={calendarDays} invite={invite} />
        <VenueSection invite={invite} venueImage={venueImage} />
        <ProgramSection invite={invite} />
        <DressCodeSection invite={invite} />
        <GroupChatSection invite={invite} />
        <AdditionalInfoSection invite={invite} />
        <RsvpSection invite={invite} siteId={siteId} />
        <ClosingSection invite={invite} portraitImage={portraitImage} />
      </article>
    </MotionConfig>
  );
}
