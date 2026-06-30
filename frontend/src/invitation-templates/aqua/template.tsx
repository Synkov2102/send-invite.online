"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Waves,
} from "lucide-react";
import Image from "next/image";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { mixHexColors } from "@/lib/invite-theme";
import { getYandexMapsUrl } from "@/lib/invite-map";
import {
  InvitationDressCodeBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import WaterBackground from "./water-background";
import {
  copyReveal,
  formatDate,
  formatMonth,
  photoReveal,
  revealViewport,
  sectionReveal,
  staggerContainer,
  staggerItem,
} from "./motion";
import styles from "./template.module.css";

type CalendarDay = {
  day: number;
  label: string;
  selected: boolean;
};

type AquaTemplateProps = {
  invite: InviteState;
  inviteVars: InviteVars;
  calendarDays: CalendarDay[];
  coverImage: string;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

function isLongHeroName(groom: string, bride: string) {
  return groom.length > 12 || bride.length > 12 || groom.length + bride.length > 22;
}

function GlassSection({
  children,
  className,
  id,
  light,
}: Readonly<{
  children: ReactNode;
  className?: string;
  id?: string;
  light?: boolean;
}>) {
  return (
    <motion.section
      className={`${styles.glass} ${light ? styles.glassLight : ""} ${className ?? ""}`}
      id={id}
      initial="hidden"
      variants={sectionReveal}
      viewport={revealViewport}
      whileInView="visible"
    >
      {children}
    </motion.section>
  );
}

export default function AquaTemplate({
  invite,
  inviteVars,
  calendarDays,
  coverImage,
  portraitImage,
  siteId,
  venueImage,
}: AquaTemplateProps) {
  const accent = inviteVars["--invite-accent"];
  const ink = inviteVars["--invite-ink"];
  const foam = inviteVars["--invite-photo-text"];

  const deep = mixHexColors(accent, ink, 0.68);
  const shallow = mixHexColors(accent, foam, 0.16);
  const longHeroNames = isLongHeroName(invite.groom, invite.bride);
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <>
      <InvitationMusicPlayer
        enabled={invite.musicEnabled}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      <article className={styles.shell} style={inviteVars}>
        <WaterBackground
          className={styles.water}
          deep={deep}
          foam={foam}
          shallow={shallow}
        />

        <div className={styles.content}>
          <motion.section
            className={styles.hero}
            initial="hidden"
            variants={sectionReveal}
            viewport={revealViewport}
            whileInView="visible"
          >
            <motion.div className={styles.heroCover} variants={photoReveal}>
              <Image
                alt=""
                className={styles.heroCoverImage}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 640px"
                src={coverImage}
                unoptimized={isRuntimeImageSource(coverImage)}
              />
            </motion.div>

            <motion.div className={styles.heroTop} variants={copyReveal}>
              <p className={styles.heroKicker}>
                <Waves aria-hidden size={14} />
                Приглашение на свадьбу
              </p>
              <h1
                className={`${styles.heroNames} ${longHeroNames ? styles.heroNamesCompact : ""}`}
              >
                <span className={styles.heroName}>{invite.groom}</span>
                <span aria-hidden className={styles.heroAmp}>
                  &
                </span>
                <span className={styles.heroName}>{invite.bride}</span>
              </h1>
            </motion.div>

            <motion.div className={styles.heroFooter} variants={copyReveal}>
              <p className={styles.heroDate}>
                {invite.date.slice(8, 10)}
                <span>—</span>
                {invite.date.slice(5, 7)}
              </p>
              <div className={styles.heroColumns}>
                <div className={styles.heroColumn}>
                  <span className={styles.heroColumnLabel}>Когда</span>
                  <p>
                    {formatDate(invite.date)}
                    <br />
                    Начало в {invite.time}
                  </p>
                </div>
                <div className={styles.heroColumn}>
                  <span className={styles.heroColumnLabel}>Где</span>
                  <p>
                    {invite.venue}
                    <br />
                    {invite.city}
                  </p>
                </div>
              </div>
            </motion.div>

            <a
              aria-label="К приглашению"
              className={styles.heroScroll}
              href="#aqua-greeting"
            >
              <ChevronDown aria-hidden size={18} />
            </a>
          </motion.section>

          <GlassSection className={styles.greetingSection} id="aqua-greeting" light>
            <span className={styles.sectionNumber}>01</span>
            <Heart aria-hidden className={styles.sectionIcon} size={22} />
            <h2 className={styles.heading}>Дорогие гости!</h2>
            <p className={styles.lead}>{invite.lead}</p>
          </GlassSection>

          <GlassSection className={styles.whenSection}>
            <span className={styles.sectionNumber}>02</span>
            <CalendarDays aria-hidden className={styles.sectionIcon} size={22} />
            <h2 className={styles.heading}>Когда?</h2>
            <p className={styles.month}>{formatMonth(invite.date)}</p>
            <motion.div
              className={styles.calendar}
              initial="hidden"
              variants={staggerContainer}
              viewport={revealViewport}
              whileInView="visible"
            >
              {calendarDays.map((item) => (
                <motion.div
                  className={item.selected ? styles.calendarSelected : undefined}
                  key={`${item.label}-${item.day}`}
                  variants={staggerItem}
                >
                  <span>{item.label}</span>
                  <strong>{item.day}</strong>
                </motion.div>
              ))}
            </motion.div>
            <p className={styles.metaRow}>
              <span>{formatDate(invite.date)}</span>
              <span>
                <Clock3 aria-hidden size={14} />
                {invite.time}
              </span>
            </p>
          </GlassSection>

          <GlassSection className={styles.locationSection}>
            <motion.figure className={styles.venuePhoto} variants={photoReveal}>
              <span className={`${styles.sectionNumber} ${styles.sectionNumberOnPhoto}`}>03</span>
              <Image
                alt=""
                className={styles.photoImage}
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                src={venueImage}
                unoptimized={isRuntimeImageSource(venueImage)}
              />
            </motion.figure>
            <MapPin aria-hidden className={styles.sectionIcon} size={22} />
            <h2 className={styles.heading}>Где?</h2>
            <p className={styles.venueName}>{invite.venue}</p>
            <p className={styles.venueAddress}>
              {invite.address}
              {invite.address && invite.city ? ", " : ""}
              {invite.city}
            </p>
            {mapUrl ? (
              <a className={styles.mapButton} href={mapUrl} rel="noreferrer" target="_blank">
                Посмотреть на карте
              </a>
            ) : null}
          </GlassSection>

          <GlassSection className={styles.programSection}>
            <span className={styles.sectionNumber}>04</span>
            <h2 className={styles.heading}>Программа</h2>
            <motion.ul
              className={styles.timeline}
              initial="hidden"
              variants={staggerContainer}
              viewport={revealViewport}
              whileInView="visible"
            >
              {invite.schedule.map((item, index) => (
                <motion.li
                  className={styles.timelineItem}
                  key={`${item.time}-${index}`}
                  variants={staggerItem}
                >
                  <time>{item.time}</time>
                  <span aria-hidden className={styles.timelineDot} />
                  <div>
                    <strong>{item.title}</strong>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </GlassSection>

          <GlassSection className={styles.dressSection}>
            <span className={styles.sectionNumber}>05</span>
            <InvitationDressCodeBlock
              colors={invite.dressCodeColors}
              text={invite.dressCode}
              variant="aqua"
            />
          </GlassSection>

          {invite.showRsvp ? (
            <GlassSection className={styles.rsvpSection} id="rsvp">
              <span className={styles.sectionNumber}>06</span>
              <InvitationRsvpForm
                questions={invite.rsvpQuestions}
                rsvpDate={invite.rsvpDate}
                siteId={siteId}
                text={invite.rsvpText}
                variant="aqua"
              />
            </GlassSection>
          ) : null}

          <motion.section
            className={styles.closing}
            initial="hidden"
            variants={sectionReveal}
            viewport={revealViewport}
            whileInView="visible"
          >
            <motion.figure className={styles.portrait} variants={photoReveal}>
              <Image
                alt=""
                className={styles.photoImage}
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                src={portraitImage}
                unoptimized={isRuntimeImageSource(portraitImage)}
              />
            </motion.figure>
            <motion.div className={styles.closingCard} variants={copyReveal}>
              <p className={styles.closingLabel}>До встречи у воды</p>
              <h2 className={styles.closingTitle}>Ждём всех!</h2>
              <p className={styles.closingNames}>
                {invite.groom} & {invite.bride}
              </p>
              {invite.showRsvp ? (
                <a className={styles.closingLink} href="#rsvp">
                  Подтвердить присутствие
                </a>
              ) : null}
            </motion.div>
          </motion.section>
        </div>
      </article>
    </>
  );
}
