/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { formatDate, parseDate } from "@/lib/invite-date";
import { getYandexMapsUrl } from "@/lib/invite-map";
import type { InviteState } from "@/lib/invite-state";
import type { InviteVars } from "@/lib/invite-theme";
import {
  InvitationDressCodeBlock,
  InvitationMusicPlayer,
  type InvitationMusicPlayerHandle,
  InvitationRsvpForm,
} from "@/invitation-templates/components";
import styles from "./template.module.css";

const assets = {
  raysPortrait: "https://static.tildacdn.com/tild6431-6166-4834-b830-393832386265/Group_480997130_2.svg",
  raysWide: "https://static.tildacdn.com/tild3831-3534-4634-a238-646238373239/Group_480997130_1.svg",
  record: "https://static.tildacdn.com/tild3930-3036-4037-a535-636633633666/Group_480997128.png",
  star: "https://static.tildacdn.com/tild3032-3430-4466-a639-626137633831/Star_93.svg",
  cinderella: "https://static.tildacdn.com/tild3830-6132-4065-a564-306166393361/0de45cdab97ff1f90865.gif",
  mickey: "https://static.tildacdn.com/tild3837-3737-4261-a661-656165313537/8ee6c82b8ecc97a36eca.gif",
  coupleSea: "https://static.tildacdn.com/tild3463-3163-4935-b739-383335386162/trans-couple-spendin.jpg",
  prince: "https://static.tildacdn.com/tild3766-3938-4039-b237-653534383563/277343fb90b6278a8bde.gif",
  disco: "https://static.tildacdn.com/tild3961-6533-4539-a461-356366373461/XVny.gif",
  flower: "https://static.tildacdn.com/tild3138-6432-4138-a132-613432623563/Group_.svg",
  dancers: "https://static.tildacdn.com/tild3935-3461-4566-a162-366639303036/e187fd545a7b5bb45c3c.gif",
  venue: "https://static.tildacdn.com/tild3230-3263-4136-a363-333166633961/Bip_4_tilda28707334.jpeg",
  finalGif: "https://static.tildacdn.com/tild3934-3134-4164-b030-623064383431/73740d2218ce7702d0bd.gif",
};

type VanillaTemplateProps = {
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  coverImage: string;
  invite: InviteState;
  inviteVars: InviteVars;
  portraitImage: string;
  siteId?: string;
  venueImage: string;
};

type CountdownParts = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
};

type VanillaStyle = CSSProperties & {
  "--vanilla-bg": string;
  "--vanilla-bg-soft": string;
  "--vanilla-orange": string;
  "--vanilla-pink": string;
  "--vanilla-ink": string;
  "--vanilla-muted": string;
  "--vanilla-paper": string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function createVanillaStyle(inviteVars: InviteVars): VanillaStyle {
  return {
    ...inviteVars,
    "--vanilla-bg": inviteVars["--invite-bg"],
    "--vanilla-bg-soft": inviteVars["--invite-veil"],
    "--vanilla-orange": inviteVars["--invite-accent"],
    "--vanilla-pink": inviteVars["--invite-line"],
    "--vanilla-ink": inviteVars["--invite-ink"],
    "--vanilla-muted": inviteVars["--invite-muted"],
    "--vanilla-paper": inviteVars["--invite-surface"],
  };
}

function useCountdown(date: string): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
  });

  useEffect(() => {
    const target = parseDate(date).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;
      const pad = (value: number) => String(value).padStart(2, "0");

      setParts({
        days: pad(days),
        hours: pad(hours),
        mins: pad(mins),
        secs: pad(secs),
      });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [date]);

  return parts;
}

function CoverScreen({
  onOpen,
  style,
}: Readonly<{
  onOpen: () => void;
  style: VanillaStyle;
}>) {
  return (
    <article className={styles.cover} style={style}>
      <button className={styles.coverButton} onClick={onOpen} type="button">
        <picture>
          <source media="(min-width: 641px)" srcSet={assets.raysWide} />
          <img alt="" className={styles.coverRays} src={assets.raysPortrait} />
        </picture>
        <img alt="" className={styles.coverRecord} src={assets.record} />
        <img alt="" className={cx(styles.coverStar, styles.coverStarOne)} src={assets.star} />
        <img alt="" className={cx(styles.coverStar, styles.coverStarTwo)} src={assets.star} />
        <p>
          Нажмите на пластинку,
          <br />
          чтобы открыть приглашение
        </p>
      </button>
    </article>
  );
}

function HeroSection({
  coverImage,
  invite,
}: Readonly<{ coverImage: string; invite: InviteState }>) {
  const coupleImage = invite.coverImageUrl ? coverImage : assets.coupleSea;

  return (
    <section className={styles.hero}>
      <img alt="" className={cx(styles.heroStar, styles.heroStarOne)} src={assets.star} />
      <img alt="" className={cx(styles.heroStar, styles.heroStarTwo)} src={assets.star} />
      <img alt="" className={cx(styles.heroStar, styles.heroStarThree)} src={assets.star} />
      <img alt="" className={styles.heroDisco} src={assets.disco} />
      <img alt="" className={cx(styles.heroImage, styles.heroImagePrince)} src={assets.prince} />
      <img alt="" className={cx(styles.heroImage, styles.heroImageMickey)} src={assets.mickey} />
      <img
        alt=""
        className={cx(styles.heroImage, styles.heroImageCinderella)}
        src={assets.cinderella}
      />
      <img alt="" className={cx(styles.heroImage, styles.heroImageCouple)} src={coupleImage} />

      <p className={styles.heroInvite}>приглашаем вас на нашу свадьбу</p>
      <h1 className={styles.heroNames}>
        <span>{invite.groom}</span>
        <span className={styles.heroAmpersand}>&</span>
        <span>{invite.bride}</span>
      </h1>
      <p className={styles.heroDate}>{formatDate(invite.date)}</p>
      <p className={styles.heroTagline}>будет много танцев, объятий и любви!</p>
      <a className={styles.heroArrow} href="#vanilla-guests" aria-label="К приглашению">
        ↓
      </a>
    </section>
  );
}

function Countdown({ date }: Readonly<{ date: string }>) {
  const parts = useCountdown(date);
  const items = [
    { value: parts.days, label: "дня" },
    { value: parts.hours, label: "часа" },
    { value: parts.mins, label: "минуты" },
    { value: parts.secs, label: "секунд" },
  ];

  return (
    <div className={styles.countdown}>
      <p>До торжества осталось:</p>
      <div className={styles.countdownGrid}>
        {items.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuestsSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={styles.guestsSection} id="vanilla-guests">
      <div className={styles.guestsIntro}>
        <span>Приглашение</span>
        <h2>Дорогие гости!</h2>
        <p>{invite.lead}</p>
      </div>

      <div className={styles.eventCard}>
        <span className={styles.whenLabel}>Когда</span>
        <p className={styles.date}>{formatDate(invite.date)}</p>
        <p className={styles.time}>Начало в {invite.time}</p>
        <Countdown date={invite.date} />
      </div>
    </section>
  );
}

function TimingSection({ invite }: Readonly<{ invite: InviteState }>) {
  return (
    <section className={cx(styles.section, styles.timingSection)}>
      <h2>Тайминг</h2>
      <div className={styles.timing}>
        {invite.schedule.map((item, index) => (
          <article className={styles.timingCard} key={`${item.time}-${index}`}>
            <time>{item.time}</time>
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function DressCodeSection({
  dressCode,
  dressCodeColors,
}: Readonly<{ dressCode: string; dressCodeColors: string[] }>) {
  return (
    <section className={cx(styles.section, styles.dressSection)}>
      <img alt="" className={styles.dancers} src={assets.dancers} />
      <img alt="" className={styles.sectionStar} src={assets.star} />
      <img alt="" className={styles.sectionFlower} src={assets.flower} />
      <InvitationDressCodeBlock
        colors={dressCodeColors}
        text={dressCode}
        variant="vanilla"
      />
    </section>
  );
}

function LocationSection({
  invite,
  venueImage,
}: Readonly<{ invite: InviteState; venueImage: string }>) {
  const locationImage = invite.venueImageUrl ? venueImage : assets.venue;
  const mapUrl = getYandexMapsUrl(invite.mapUrl);

  return (
    <section className={cx(styles.section, styles.locationSection)}>
      <h2>Локация</h2>
      <p>
        Нашу свадьбу мы решили отметить в {invite.venue}. Он находится по адресу:
        <br />
        {invite.address}, {invite.city}.
      </p>
      {mapUrl ? (
        <a className={styles.mapButton} href={mapUrl} rel="noreferrer" target="_blank">
          Посмотреть на карте
        </a>
      ) : null}
      <div className={styles.locationPhoto}>
        <img alt="" src={locationImage} />
      </div>
    </section>
  );
}

function RsvpSection({
  invite,
  siteId,
}: Readonly<{ invite: InviteState; siteId?: string }>) {
  return (
    <section className={cx(styles.cloud, styles.rsvpCloud)} id="rsvp">
      <InvitationRsvpForm
        questions={invite.rsvpQuestions}
        rsvpDate={invite.rsvpDate}
        siteId={siteId}
        text={invite.rsvpText}
        variant="vanilla"
      />
    </section>
  );
}

function FooterSection({
  invite,
  portraitImage,
}: Readonly<{ invite: InviteState; portraitImage: string }>) {
  const finalImage = invite.portraitImageUrl ? portraitImage : assets.finalGif;

  return (
    <footer className={styles.footer}>
      <img alt="" src={finalImage} />
      <p>
        С любовью и нетерпением ждём встречи с вами на нашем празднике.
      </p>
      <h2>До встречи!</h2>
      <p className={styles.footerNames}>
        {invite.groom} & {invite.bride}
      </p>
    </footer>
  );
}

export default function VanillaTemplate({
  coverImage,
  invite,
  inviteVars,
  portraitImage,
  siteId,
  venueImage,
}: VanillaTemplateProps) {
  const [opened, setOpened] = useState(false);
  const musicRef = useRef<InvitationMusicPlayerHandle>(null);
  const style = createVanillaStyle(inviteVars);

  function handleOpen() {
    void musicRef.current?.start();
    setOpened(true);
  }

  return (
    <>
      <InvitationMusicPlayer
        autoStart={false}
        enabled={invite.musicEnabled}
        ref={musicRef}
        title={invite.musicTitle}
        url={invite.musicUrl}
      />
      {!opened ? (
        <CoverScreen onOpen={handleOpen} style={style} />
      ) : (
        <article className={styles.shell} style={style}>
      <HeroSection coverImage={coverImage} invite={invite} />
      <GuestsSection invite={invite} />
      <TimingSection invite={invite} />
      <DressCodeSection
        dressCode={invite.dressCode}
        dressCodeColors={invite.dressCodeColors}
      />
      <LocationSection invite={invite} venueImage={venueImage} />
      {invite.showRsvp ? <RsvpSection invite={invite} siteId={siteId} /> : null}
      <FooterSection invite={invite} portraitImage={portraitImage} />
        </article>
      )}
    </>
  );
}
