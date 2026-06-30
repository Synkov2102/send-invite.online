"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import type { CoverType } from "@/lib/invite-templates";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import { getCalendarDays } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import {
  InvitationDressCodeBlock,
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
      className={`invite-shell mx-auto ${coverType === "rings" ? "invite-shell--alpine-rings" : ""}`}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      style={inviteVars}
      transition={{ duration: 0.72, ease: "easeOut" }}
    >
      {coverType === "rings" ? (
        <motion.section
          className="invite-cover invite-cover--three"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <motion.div className="invite-cover__three-bg" variants={photoReveal}>
            <WeddingRingsScene
              ink={inviteVars["--invite-ink"]}
              line={inviteVars["--invite-line"]}
              photoText={inviteVars["--invite-photo-text"]}
              ringColor={ringColor}
            />
          </motion.div>
          <motion.div className="invite-hero-copy" variants={copyReveal}>
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
          className="invite-cover"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <motion.div className="invite-arch" variants={photoReveal}>
            <Image
              alt=""
              className="invite-photo__image"
              fill
              unoptimized={isRuntimeImageSource(coverImage)}
              priority
              sizes="(max-width: 767px) 520px, 100vw"
              src={coverImage}
            />
          </motion.div>
          <motion.div className="invite-hero-copy" variants={copyReveal}>
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
        className="invite-panel"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <InvitationSectionEyebrow>Сохраните дату</InvitationSectionEyebrow>
        <Heart aria-hidden="true" className="mx-auto mb-4 text-[var(--invite-accent)]" size={22} />
        <p className="invite-small">Дорогие гости!</p>
        <p className="mx-auto mt-3 max-w-[330px] text-center text-[15px] leading-relaxed text-[var(--invite-muted)]">
          {invite.lead}
        </p>
        <motion.div className="invite-when invite-when--photo" variants={staggerContainer}>
          <motion.div className="invite-image-motion" variants={photoReveal}>
            <Image
              alt="Свадебное фото пары"
              className="invite-photo__image"
              fill
              unoptimized={isRuntimeImageSource(coverImage)}
              sizes="(max-width: 767px) 520px, 100vw"
              src={coverImage}
            />
          </motion.div>
          <motion.div className="invite-when__content" variants={copyReveal}>
            <h2 className="invite-heading">Когда?</h2>
            <p className="invite-when__month">{formatMonth(invite.date)}</p>
            <motion.div
              className="invite-calendar"
              initial="hidden"
              variants={staggerContainer}
              viewport={revealViewport}
              whileInView="visible"
            >
              {calendarDays.map((item) => (
                <motion.div
                  className={item.selected ? "is-selected" : ""}
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

      <motion.section
        className="invite-details"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <motion.div className="invite-plan__head" variants={copyReveal}>
          <InvitationSectionEyebrow>Расписание</InvitationSectionEyebrow>
          <h2 className="invite-heading invite-plan__title">План дня</h2>
          <div className="invite-plan__meta">
            <span className="invite-plan__chip">
              <CalendarDays aria-hidden="true" size={16} />
              {formatDate(invite.date)}
            </span>
            <span className="invite-plan__chip">
              <Clock3 aria-hidden="true" size={16} />
              Начало в {invite.time}
            </span>
          </div>
        </motion.div>
        <motion.ol
          className="invite-program invite-timeline"
          initial="hidden"
          variants={staggerContainer}
          viewport={revealViewport}
          whileInView="visible"
        >
          {invite.schedule.map((item, index) => (
            <motion.li
              className="invite-timeline__item"
              key={`${item.time}-${index}`}
              variants={staggerItem}
            >
              <span className="invite-timeline__time">{item.time}</span>
              <span aria-hidden="true" className="invite-timeline__rail">
                <span className="invite-timeline__dot" />
              </span>
              <div className="invite-timeline__body">
                <strong>{item.title}</strong>
                {item.description ? <p>{item.description}</p> : null}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </motion.section>

      <motion.section
        className="invite-photo-band"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <motion.div className="invite-image-motion" variants={photoReveal}>
          <Image
            alt="Горная долина и свадебная прогулка"
            className="invite-photo__image"
            fill
            unoptimized={isRuntimeImageSource(venueImage)}
            sizes="(max-width: 1199px) 100vw, 55vw"
            src={venueImage}
          />
        </motion.div>
        <motion.div className="invite-photo-band__content" variants={copyReveal}>
          <MapPin size={28} />
          <h2 className="invite-heading">Где?</h2>
          <p>
            {invite.venue}
            <br />
            {invite.address}, {invite.city}
          </p>
          {mapUrl ? (
            <a className="invite-map-link" href={mapUrl} rel="noreferrer" target="_blank">
              Посмотреть на карте
            </a>
          ) : null}
        </motion.div>
      </motion.section>

      <motion.section
        className="invite-dress-code"
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

      {invite.showRsvp ? (
        <motion.section
          className="invite-rsvp"
          initial="hidden"
          variants={sectionReveal}
          viewport={revealViewport}
          whileInView="visible"
        >
          <InvitationRsvpForm
            questions={invite.rsvpQuestions}
            rsvpDate={invite.rsvpDate}
            siteId={siteId}
            text={invite.rsvpText}
            variant="alpine"
          />
        </motion.section>
      ) : null}

      <motion.section
        className="invite-final"
        initial="hidden"
        variants={sectionReveal}
        viewport={revealViewport}
        whileInView="visible"
      >
        <motion.div className="invite-image-motion" variants={photoReveal}>
          <Image
            alt="Финальный свадебный кадр в горной долине"
            className="invite-photo__image invite-photo__image--slow"
            fill
            unoptimized={isRuntimeImageSource(portraitImage)}
            sizes="100vw"
            src={portraitImage}
          />
        </motion.div>
        <motion.div className="invite-final__content" variants={copyReveal}>
          <h2>Ждем всех!</h2>
          <p>
            {invite.groom} & {invite.bride}
          </p>
        </motion.div>
      </motion.section>
    </motion.article>
    </>
  );
}
