"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  formatValuePropIndex,
  homeValueProps,
} from "@/lib/home-value-props";
import carouselStyles from "./value-props-carousel.module.css";

const MOBILE_QUERY = "(max-width: 640px)";
const AUTOPLAY_DELAY_MS = 5000;

type ValuePropsCarouselProps = {
  gridClassName: string;
  cardClassName: string;
  numberClassName: string;
  iconClassName: string;
};

function subscribeMediaQuery(query: string, onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}

export default function ValuePropsCarousel({
  gridClassName,
  cardClassName,
  numberClassName,
  iconClassName,
}: ValuePropsCarouselProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Every slide change re-renders this component; a fresh options object each
  // time makes swiper/react re-apply params instead of leaving autoplay alone.
  const autoplay = useMemo(
    () =>
      prefersReducedMotion
        ? (false as const)
        : { delay: AUTOPLAY_DELAY_MS, disableOnInteraction: true, pauseOnMouseEnter: true },
    [prefersReducedMotion],
  );

  /** Mirrors autoplay's `disableOnInteraction`, so a picked slide stays put. */
  function goToSlide(index: number) {
    if (!swiper || swiper.destroyed) {
      return;
    }

    swiper.autoplay?.stop();
    swiper.slideToLoop(index, prefersReducedMotion ? 0 : undefined);
  }

  if (!isMobile) {
    return (
      <div className={gridClassName}>
        {homeValueProps.map((item, index) => (
          <article
            aria-label={`${formatValuePropIndex(index)}. ${item.title}`}
            className={cardClassName}
            key={item.title}
          >
            <span aria-hidden className={numberClassName}>
              {formatValuePropIndex(index)}
            </span>
            <item.icon aria-hidden className={iconClassName} size={20} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <>
      <Swiper
        aria-label="Преимущества сервиса"
        aria-roledescription="карусель"
        autoplay={autoplay}
        className={carouselStyles.trackCarousel}
        loop
        modules={[Autoplay]}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
        onSwiper={setSwiper}
        role="region"
        slidesOffsetAfter={20}
        slidesOffsetBefore={20}
        slidesPerView="auto"
        spaceBetween={10}
      >
        {homeValueProps.map((item, index) => (
          <SwiperSlide
            aria-label={`${formatValuePropIndex(index)}. ${item.title}`}
            className={cardClassName}
            key={item.title}
          >
            <span aria-hidden className={numberClassName}>
              {formatValuePropIndex(index)}
            </span>
            <item.icon aria-hidden className={iconClassName} size={20} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </SwiperSlide>
        ))}
      </Swiper>

      <div aria-label="Выбрать преимущество" className={carouselStyles.dots} role="group">
        {homeValueProps.map((item, index) => (
          <button
            aria-label={`${formatValuePropIndex(index)}. ${item.title}`}
            aria-pressed={index === activeIndex}
            className={
              index === activeIndex
                ? `${carouselStyles.dot} ${carouselStyles.dotActive}`
                : carouselStyles.dot
            }
            key={item.title}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>
    </>
  );
}
