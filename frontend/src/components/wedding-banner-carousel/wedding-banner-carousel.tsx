"use client";
import { ArrowLeft, ArrowRight, Music2, FileSpreadsheet, Check, Minus } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./wedding-banner-carousel.module.css";
import TrackedLink from "@/components/tracked-link";

type TemplateSlide = {
  kind: "template";
  id: string;
  label: string;
  name: string;
  detail: string;
  photo: string;
  templateName: string;
  note: ReactNode;
};
type GuestsSlide = {
  kind: "guests";
  id: string;
  label: string;
  name: string;
  detail: string;
};

const slides: (TemplateSlide | GuestsSlide)[] = [
  {
    kind: "template",
    id: "clarity-editorial",
    label: "Дизайн без ожидания",
    name: "Оформление от дизайнеров",
    detail: "Шрифты, цвета и композиция уже продуманы",
    photo: "/images/clarity-editorial-cover.webp",
    templateName: "Ясность",
    note: (
      <>
        Продумано
        <br />
        до деталей.
      </>
    ),
  },
  {
    kind: "template",
    id: "chapter-ticket",
    label: "Сделайте его вашим",
    name: "Ваши фото и любая музыка",
    detail: "Добавьте свою историю в готовый дизайн",
    photo: "/images/chapter-ticket-cover-back-view.webp",
    templateName: "Глава",
    note: (
      <>
        <Music2 size={22} aria-hidden /> Ваша история.
        <br />
        Ваша песня.
      </>
    ),
  },
  {
    kind: "guests",
    id: "guests",
    label: "Всё под рукой",
    name: "Ответы гостей и Excel",
    detail: "Анкета в приглашении, ответы в личном кабинете",
  },
];
const demoGuests = [
  { name: "Анна и Максим", attending: true },
  { name: "Екатерина", attending: false },
  { name: "Дмитрий и Ольга", attending: true },
];

export default function WeddingBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  return (
    <div
      className={styles.carousel}
      role="region"
      aria-label="Возможности свадебного сайта"
      aria-roledescription="карусель"
    >
      <div className={styles.stage}>
        <Swiper
          onSwiper={setSwiper}
          onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
          rewind
          slidesPerView={1}
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={slide.id}
              role="group"
              aria-roledescription="слайд"
              aria-label={`${index + 1} из ${slides.length}: ${slide.name}`}
              aria-hidden={activeIndex !== index}
            >
              <div className={styles.preview} inert={activeIndex !== index}>
                <span className={styles.stageLabel}>{slide.label}</span>
                {slide.kind === "guests" ? (
                  <div className={styles.guestDemo}>
                    <span className={styles.demoLabel}>Демонстрационный пример</span>
                    <h3>Ответы гостей</h3>
                    <p>Всё готово к вашему празднику</p>
                    {demoGuests.map((guest) => (
                      <div className={styles.guestRow} key={guest.name}>
                        <span>{guest.name}</span>
                        <span className={guest.attending ? undefined : styles.declined}>
                          {guest.attending ? (
                            <Check size={14} aria-hidden />
                          ) : (
                            <Minus size={14} aria-hidden />
                          )}{" "}
                          {guest.attending ? "Придём" : "Не смогу"}
                        </span>
                      </div>
                    ))}
                    <div className={styles.excelNote}>
                      <FileSpreadsheet size={20} aria-hidden /> Список для организатора — в Excel
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.photoFrame} aria-hidden>
                      <Image
                        className={styles.photo}
                        alt=""
                        src={slide.photo}
                        fill
                        sizes="(max-width: 640px) 340px, 600px"
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable={false}
                      />
                    </div>
                    <TrackedLink
                      className={styles.device}
                      href={`/editor?template=${slide.id}&preview=1`}
                      goal="wedding_banner_preview_click"
                      aria-label={`Посмотреть шаблон «${slide.templateName}»`}
                    >
                      <Image
                        alt={`Пример свадебного сайта: ${slide.name}`}
                        src={`/images/templates/${slide.id}-mobile.webp`}
                        fill
                        sizes="(max-width: 640px) 190px, 280px"
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable={false}
                      />
                      <span className={styles.previewLink}>
                        Смотреть сайт <ArrowRight size={14} aria-hidden />
                      </span>
                    </TrackedLink>
                    <span className={styles.note}>{slide.note}</span>
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={styles.navigation}>
        <div aria-live="polite">
          <strong>{slides[activeIndex].name}</strong>
          <span>{slides[activeIndex].detail}</span>
        </div>
        <div className={styles.controls}>
          <button type="button" aria-label="Предыдущий слайд" onClick={() => swiper?.slidePrev()}>
            <ArrowLeft aria-hidden size={18} />
          </button>
          <span>
            {activeIndex + 1} / {slides.length}
          </span>
          <button type="button" aria-label="Следующий слайд" onClick={() => swiper?.slideNext()}>
            <ArrowRight aria-hidden size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
