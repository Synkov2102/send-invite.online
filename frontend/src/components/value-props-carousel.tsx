"use client";

import {
  formatValuePropIndex,
  homeValueProps,
} from "@/lib/home-value-props";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import carouselStyles from "./value-props-carousel.module.css";

const MOBILE_QUERY = "(max-width: 640px)";
const AUTO_SCROLL_MS = 5000;
const PAUSE_RESUME_MS = 12000;

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

function scrollToCard(
  track: HTMLDivElement,
  index: number,
  behavior: ScrollBehavior,
) {
  const card = track.children.item(index) as HTMLElement | null;
  if (!card) {
    return;
  }

  track.scrollTo({
    left: card.offsetLeft - track.offsetLeft,
    behavior,
  });
}

export default function ValuePropsCarousel({
  gridClassName,
  cardClassName,
  numberClassName,
  iconClassName,
}: ValuePropsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, PAUSE_RESUME_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.55) {
            return;
          }

          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        });
      },
      { root: track, threshold: [0.55, 0.75, 1] },
    );

    Array.from(track.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile || prefersReducedMotion || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % homeValueProps.length);
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(timer);
  }, [isMobile, isPaused, prefersReducedMotion]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) {
      return;
    }

    scrollToCard(track, activeIndex, prefersReducedMotion ? "instant" : "smooth");
  }, [activeIndex, isMobile, prefersReducedMotion]);

  const trackClassName = [
    gridClassName,
    isMobile ? carouselStyles.trackCarousel : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        ref={trackRef}
        aria-label={isMobile ? "Преимущества сервиса" : undefined}
        aria-roledescription={isMobile ? "карусель" : undefined}
        className={trackClassName}
        onPointerDown={isMobile ? pauseAutoScroll : undefined}
        onTouchStart={isMobile ? pauseAutoScroll : undefined}
        role={isMobile ? "region" : undefined}
      >
        {homeValueProps.map((item, index) => (
          <article
            aria-label={`${formatValuePropIndex(index)}. ${item.title}`}
            className={cardClassName}
            data-index={index}
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

      {isMobile ? (
        <div aria-hidden className={carouselStyles.dots}>
          {homeValueProps.map((item, index) => (
            <button
              className={
                index === activeIndex
                  ? `${carouselStyles.dot} ${carouselStyles.dotActive}`
                  : carouselStyles.dot
              }
              key={item.title}
              onClick={() => {
                pauseAutoScroll();
                setActiveIndex(index);
              }}
              tabIndex={-1}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
