"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import type { CoverType } from "@/lib/invite-templates";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { getCalendarDays } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
  InvitationSectionEyebrow,
} from "@/invitation-templates/components";
import WeddingRingsScene from "./wedding-rings-scene";
import {
  copyReveal,
  photoReveal,
  revealViewport,
  sectionReveal,
  staggerContainer,
  staggerItem,
  formatDate,
  formatMonth,
} from "./motion";
import styles from "./template.module.css";

type AlpineTemplateProps = {
  calendarDays: ReturnType<typeof getCalendarDays>;
  coverType: CoverType;
  invite: InviteState;
  inviteVars: InviteVars;
  ringColor: string;
  siteId?: string;
  coverImage: string;
  portraitImage: string;
  venueImage: string;
};

function isRuntimeImageSource(src: string) {
  return src.startsWith("data:") || src.startsWith("/api/");
}

export default function AlpineTemplate({
  calendarDays,
  coverType,
  invite,
  inviteVars,
  ringColor,
  siteId,
  coverImage,
  portraitImage,
  venueImage,
}: AlpineTemplateProps) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <>
    <InvitationMusicPlayer
      enabled={invite.musicEnabled}
      title={invite.musicTitle}
      url={invite.musicUrl}
    />
    <motion.article
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={coverType === "rings" ? `${styles.shell} ${styles.rings}` : styles.shell}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      style={inviteVars}
      transition={{ duration: 0.72, ease: "easeOut" }}
    >
      {coverType === "rings" ? (
        <motion.section
          className={`${styles.cover} ${styles.coverThree}`}
          data-invite-section="hero"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <motion.div className={styles.coverScene} variants={photoReveal}>
            <WeddingRingsScene
              ink={inviteVars["--invite-ink"]}
              line={inviteVars["--invite-line"]}
              photoText={inviteVars["--invite-photo-text"]}
              ringColor={ringColor}
            />
          </motion.div>
          <motion.div className={styles.heroCopy} variants={copyReveal}>
            <p>{formatDate(invite.date)}</p>
            <h1>
              {invite.groom}
              <span>&</span>
              {invite.bride}
            </h1>
          </motion.div>
        </motion.section>
      ) : (
        <motion.section
          className={styles.cover}
          data-invite-section="hero"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <motion.div className={styles.arch} variants={photoReveal}>
            <Image
              alt=""
              className={styles.photo}
              fill
              unoptimized={isRuntimeImageSource(coverImage)}
              priority
              sizes="(max-width: 767px) 520px, 100vw"
              src={coverImage}
            />
          </motion.div>
          <motion.div className={styles.heroCopy} variants={copyReveal}>
            <p>{formatDate(invite.date)}</p>
            <h1>
              {invite.groom}
              <span>&</span>
              {invite.bride}
            </h1>
          </motion.div>
        </motion.section>
      )}

      <motion.section
        className={styles.panel}
        data-invite-section="greeting date cover"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <InvitationSectionEyebrow>Приглашение</InvitationSectionEyebrow>
        <p className={styles.small}>Дорогие гости</p>
        <p className={styles.lead}>
          {invite.lead}
        </p>
        <motion.div className={`${styles.when} ${styles.whenPhoto}`} variants={staggerContainer}>
          <motion.div className={styles.imageMotion} variants={photoReveal}>
            <Image
              alt="Свадебное фото пары"
              className={styles.photo}
              fill
              unoptimized={isRuntimeImageSource(coverImage)}
              sizes="(max-width: 767px) 520px, 100vw"
              src={coverImage}
            />
          </motion.div>
          <motion.div className={styles.whenContent} variants={copyReveal}>
            <h2 className={styles.heading}>Дата</h2>
            <p className={styles.whenMonth}>{formatMonth(invite.date)}</p>
            <motion.div
              className={styles.calendar}
              initial="hidden"
              variants={staggerContainer}
              viewport={revealViewport}
              whileInView="visible"
            >
              {calendarDays.map((item) => (
                <motion.div
                  className={item.selected ? styles.selected : undefined}
                  key={`${item.label}-${item.day}`}
                  variants={staggerItem}
                >
                  <span>{item.label}</span>
                  <strong>{item.day}</strong>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {invite.showSchedule ? (
        <motion.section
          className={styles.details}
          data-invite-section="schedule"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <motion.div className={styles.planHead} variants={copyReveal}>
            <InvitationSectionEyebrow>Расписание</InvitationSectionEyebrow>
            <h2 className={`${styles.heading} ${styles.planTitle}`}>План дня</h2>
            <div className={styles.planMeta}>
              <span className={styles.planChip}>
                <CalendarDays aria-hidden="true" size={16} />
                {formatDate(invite.date)}
              </span>
              <span className={styles.planChip}>
                <Clock3 aria-hidden="true" size={16} />
                Начало в {invite.time}
              </span>
            </div>
          </motion.div>
          <motion.ol
            className={`${styles.program} ${styles.timeline}`}
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
                <span className={styles.timelineTime}>{item.time}</span>
                <span aria-hidden="true" className={styles.timelineRail}>
                  <span className={styles.timelineDot} />
                </span>
                <div className={styles.timelineBody}>
                  <strong>{item.title}</strong>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.section>
      ) : null}

      <motion.section
        className={styles.photoBand}
        data-invite-section="location"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <motion.div className={styles.imageMotion} variants={photoReveal}>
          <Image
            alt="Горная долина и свадебная прогулка"
            className={styles.photo}
            fill
            unoptimized={isRuntimeImageSource(venueImage)}
            sizes="(max-width: 1199px) 100vw, 55vw"
            src={venueImage}
          />
        </motion.div>
        <motion.div className={styles.photoBandContent} variants={copyReveal}>
          <MapPin aria-hidden="true" size={18} />
          <h2 className={styles.heading}>Место</h2>
          <p>
            {invite.venue}
            <br />
            {invite.address}, {invite.city}
          </p>
          {mapUrl ? (
            <a className={styles.mapLink} href={mapUrl} rel="noreferrer" target="_blank">
              Посмотреть на карте
            </a>
          ) : null}
        </motion.div>
      </motion.section>

      {invite.showDressCode ? (
        <motion.section
          className={styles.dressCode}
          data-invite-section="dress-code"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <InvitationDressCodeBlock
            colors={invite.dressCodeColors}
            text={invite.dressCode}
            variant="alpine"
          />
        </motion.section>
      ) : null}

      {invite.showGroupChat ? (
        <motion.section
          className={styles.groupChat}
          data-invite-section="chat"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <InvitationGroupChatBlock
            show={invite.showGroupChat}
            text={invite.groupChatText}
            url={invite.groupChatUrl}
            variant="alpine"
          />
        </motion.section>
      ) : null}

      {invite.showAdditionalInfo ? (
        <motion.section
          className={styles.additionalInfo}
          data-invite-section="info"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <InvitationAdditionalInfoBlock
            show={invite.showAdditionalInfo}
            text={invite.additionalInfo}
            variant="alpine"
          />
        </motion.section>
      ) : null}

      {invite.showRsvp ? (
        <motion.section
          className={styles.rsvp}
          data-invite-section="rsvp"
          initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
          <div className={styles.rsvpHeader}>
            <InvitationSectionEyebrow>Ответ</InvitationSectionEyebrow>
            <h2 className={styles.heading}>Анкета гостя</h2>
            <p>{invite.rsvpText}</p>
            <span>Ответьте до {formatDate(invite.rsvpDate)}</span>
          </div>
          <InvitationRsvpForm
            questions={invite.rsvpQuestions}
            rsvpDate={invite.rsvpDate}
            siteId={siteId}
            variant="alpine"
          />
        </motion.section>
      ) : null}

      <motion.section
        className={styles.final}
        data-invite-section="portrait"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <motion.div className={styles.imageMotion} variants={photoReveal}>
          <Image
            alt="Финальный свадебный кадр в горной долине"
            className={`${styles.photo} ${styles.photoSlow}`}
            fill
            unoptimized={isRuntimeImageSource(portraitImage)}
            sizes="100vw"
            src={portraitImage}
          />
        </motion.div>
        <motion.div className={styles.finalContent} variants={copyReveal}>
          <h2>До встречи</h2>
          <p>
            {invite.groom} & {invite.bride}
          </p>
        </motion.div>
      </motion.section>
    </motion.article>
    </>
  );
}
