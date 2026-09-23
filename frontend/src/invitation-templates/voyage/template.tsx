"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Heart, Plane } from "lucide-react";
import { formatDate, formatMonth, getMonthCalendar, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import { getSafeHttpUrl } from "@/lib/safe-url";
import type { SharedTemplateViewProps } from "../registry";
import {
  InvitationAdditionalInfoBlock,
  InvitationDressCodeBlock,
  InvitationGroupChatBlock,
  InvitationMusicPlayer,
  InvitationRsvpForm,
} from "../components";
import styles from "./template.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
}

function FlightPath() {
  const pathId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const flying = inView && !reducedMotion;

  return (
    <div className={styles.flightPath} aria-hidden="true" ref={ref}>
      <svg viewBox="0 0 400 80" fill="none">
        <path
          id={pathId}
          d="M14 58C90 68 255 66 251 30C248 2 180 8 197 39C212 67 330 54 386 42"
          stroke="currentColor"
          strokeDasharray="5 5"
        />
        <g transform={flying ? undefined : "translate(14 58)"}>
          {flying && (
            <animateMotion dur="10s" repeatCount="indefinite" rotate="auto" calcMode="paced">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          )}
          <g transform="rotate(45)">
            <Plane x={-12} y={-12} size={24} strokeWidth={1.3} />
          </g>
        </g>
      </svg>
    </div>
  );
}

function RevealSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className: string;
  id?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      id={id}
      initial={false}
      whileInView={{ y: 0 }}
      animate={reducedMotion ? { y: 0 } : { y: 16 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

function Photo({ src, alt, landscape = false }: { src: string; alt: string; landscape?: boolean }) {
  return (
    <div className={landscape ? styles.landscape : styles.photo}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 600px) 90vw, 500px"
        unoptimized={src.startsWith("data:") || src.startsWith("/api/")}
      />
    </div>
  );
}

export default function VoyageTemplate({
  invite,
  inviteVars,
  coverImage,
  portraitImage,
  venueImage,
  siteId,
}: SharedTemplateViewProps) {
  const mapUrl = getYandexMapsUrl(invite.mapUrl);
  const selectedDay = parseDate(invite.date).getDate();
  const numericDate = new Intl.DateTimeFormat("ru-RU").format(parseDate(invite.date));

  return (
    <>
      <article className={styles.shell} style={inviteVars}>
        <header className={`${styles.ticket} ${styles.hero}`}>
          <div className={styles.ticketLabel}>
            Свадебный билет <Plane size={15} aria-hidden="true" />
          </div>
          <div className={styles.globe} aria-hidden="true">
            <span className={styles.globeArtwork} />
            <Plane className={styles.orbitPlane} strokeWidth={1.2} />
          </div>
          <p className={styles.eyebrow}>Навстречу нашей истории</p>
          <h1>
            <span>{invite.groom}</span>
            <em>&</em>
            <span>{invite.bride}</span>
          </h1>
          <dl className={styles.boarding}>
            <div>
              <dt>Дата вылета</dt>
              <dd>
                <time dateTime={invite.date}>{numericDate}</time>
              </dd>
            </div>
            <div>
              <dt>Начало</dt>
              <dd>{invite.time}</dd>
            </div>
            <div>
              <dt>Направление</dt>
              <dd>{invite.city}</dd>
            </div>
            <div>
              <dt>Класс</dt>
              <dd>Первый</dd>
            </div>
          </dl>
          <div className={styles.stub}>
            <span>Билет в счастье</span>
            <span className={styles.stamp} aria-label={`Свадебный билет, ${numericDate}`}>
              <span className={styles.stampArtwork} aria-hidden="true" />
              <span className={styles.stampTitle}>
                Свадебный
                <br />
                билет
              </span>
              <time className={styles.stampDate} dateTime={invite.date}>
                {numericDate}
              </time>
            </span>
          </div>
          {invite.musicEnabled && invite.musicUrl && (
            <div className={styles.musicControl}>
              <InvitationMusicPlayer
                autoStart={false}
                enabled={invite.musicEnabled}
                title={invite.musicTitle}
                url={invite.musicUrl}
              />
            </div>
          )}
        </header>

        <RevealSection className={styles.darkPanel}>
          <p className={styles.eyebrow}>Самое важное путешествие</p>
          <h2>
            Дорогие наши
            <br />
            друзья и родные!
          </h2>
          <p>{invite.lead}</p>
          <Photo src={coverImage} alt={`${invite.groom} и ${invite.bride}`} />
          <FlightPath />
          <h2>Мы ждём вас</h2>
          <p>На первом празднике нашей семьи</p>
          <div className={styles.calendar} aria-label={formatDate(invite.date)}>
            <h3>{formatMonth(invite.date)}</h3>
            <div className={styles.calendarGrid}>
              {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map((day) => (
                <span className={styles.weekday} key={day}>
                  {day}
                </span>
              ))}
              {getMonthCalendar(invite.date)
                .flat()
                .map((day, index) => (
                  <span
                    key={index}
                    className={day === selectedDay ? styles.selectedDay : undefined}
                    aria-current={day === selectedDay ? "date" : undefined}
                  >
                    {day === selectedDay && <Heart aria-hidden="true" />}
                    <span>{day}</span>
                  </span>
                ))}
            </div>
          </div>
          <time className={styles.date} dateTime={`${invite.date}T${invite.time}`}>
            <span>{numericDate}</span>
            <span>Начало в {invite.time}</span>
          </time>
        </RevealSection>

        <RevealSection className={styles.ticket}>
          <p className={styles.eyebrow}>Место назначения</p>
          <h2>
            Место
            <br />
            проведения
          </h2>
          <p className={styles.venue}>{invite.venue}</p>
          <p>
            {invite.city}
            <br />
            {invite.address}
          </p>
          {mapUrl && (
            <a className={styles.button} href={mapUrl} target="_blank" rel="noreferrer">
              Как добраться <Plane size={16} aria-hidden="true" />
            </a>
          )}
          <Photo src={venueImage} alt={invite.venue} landscape />
        </RevealSection>

        {invite.showSchedule && (
          <RevealSection className={styles.darkPanel}>
            <p className={styles.eyebrow}>Маршрут нашего дня</p>
            <h2>Тайминг</h2>
            <ol className={styles.timeline}>
              {invite.schedule.map((item, index) => (
                <li key={`${item.time}-${index}`}>
                  <div>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <time>{item.time}</time>
                </li>
              ))}
            </ol>
            <FlightPath />
          </RevealSection>
        )}

        {invite.showDressCode && (
          <RevealSection className={styles.ticket}>
            <InvitationDressCodeBlock
              className={styles.sharedBlock}
              colors={invite.dressCodeColors}
              text={invite.dressCode}
              variant="aqua"
            />
            <FlightPath />
          </RevealSection>
        )}
        {invite.showGroupChat && getSafeHttpUrl(invite.groupChatUrl) && (
          <RevealSection className={styles.ticket}>
            <InvitationGroupChatBlock
              className={styles.sharedBlock}
              show={invite.showGroupChat}
              url={invite.groupChatUrl}
              text={invite.groupChatText}
              variant="aqua"
            />
          </RevealSection>
        )}
        {invite.showAdditionalInfo && invite.additionalInfo.trim() && (
          <RevealSection className={styles.ticket}>
            <InvitationAdditionalInfoBlock
              className={styles.sharedBlock}
              show={invite.showAdditionalInfo}
              text={invite.additionalInfo}
              variant="aqua"
            />
          </RevealSection>
        )}
        {invite.showRsvp && (
          <RevealSection className={styles.ticket} id="rsvp">
            <p className={styles.eyebrow}>Подтвердите посадку</p>
            <h2>Анкета гостя</h2>
            <p>{invite.rsvpText}</p>
            <p className={styles.rsvpDeadline}>
              Просим ответить до{" "}
              <time dateTime={invite.rsvpDate}>{formatDate(invite.rsvpDate)}</time>
            </p>
            <InvitationRsvpForm
              className={styles.rsvpForm}
              questions={invite.rsvpQuestions}
              rsvpDate={invite.rsvpDate}
              siteId={siteId}
              variant="aqua"
            />
          </RevealSection>
        )}
        <footer className={styles.darkPanel}>
          <h2>
            Счастье —<br />
            быть вместе
          </h2>
          <Photo
            src={portraitImage}
            alt={`${invite.groom} и ${invite.bride} — до встречи на свадьбе`}
          />
          <FlightPath />
          <p className={styles.closingNames}>
            {invite.groom} & {invite.bride}
          </p>
          <p className={styles.eyebrow}>До встречи на борту!</p>
        </footer>
      </article>
    </>
  );
}
