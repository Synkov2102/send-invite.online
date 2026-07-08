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

function getCardScrollLeft(track: HTMLDivElement, card: HTMLElement) {
  return track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left;
}

function getNearestCardIndex(track: HTMLDivElement) {
  const cards = Array.from(track.children) as HTMLElement[];
  if (cards.length === 0) {
    return 0;
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const distance = Math.abs(getCardScrollLeft(track, card));
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export default function ValuePropsCarousel({
  gridClassName,
  cardClassName,
  numberClassName,
  iconClassName,
}: ValuePropsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const track = trackRef.current;
      const card = track?.children.item(index) as HTMLElement | null;
      if (!track || !card) {
        return;
      }

      isProgrammaticScrollRef.current = true;
      activeIndexRef.current = index;
      setActiveIndex(index);

      track.scrollTo({
        left: getCardScrollLeft(track, card),
        behavior,
      });

      if (scrollUnlockTimerRef.current) {
        clearTimeout(scrollUnlockTimerRef.current);
      }

      scrollUnlockTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, behavior === "smooth" ? 520 : 0);
    },
    [],
  );

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    isProgrammaticScrollRef.current = false;

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
      if (scrollUnlockTimerRef.current) {
        clearTimeout(scrollUnlockTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) {
      return;
    }

    const syncActiveIndex = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      const nearestIndex = getNearestCardIndex(track);
      if (nearestIndex === activeIndexRef.current) {
        return;
      }

      activeIndexRef.current = nearestIndex;
      setActiveIndex(nearestIndex);
    };

    const onScrollEnd = () => {
      isProgrammaticScrollRef.current = false;
      syncActiveIndex();
    };

    let scrollSyncTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      if (scrollSyncTimer) {
        clearTimeout(scrollSyncTimer);
      }

      scrollSyncTimer = setTimeout(syncActiveIndex, 120);
    };

    track.addEventListener("scrollend", onScrollEnd, { passive: true });
    track.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("scroll", onScroll);
      if (scrollSyncTimer) {
        clearTimeout(scrollSyncTimer);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || prefersReducedMotion || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % homeValueProps.length;
      scrollToIndex(nextIndex, "smooth");
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(timer);
  }, [isMobile, isPaused, prefersReducedMotion, scrollToIndex]);

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
                scrollToIndex(index, prefersReducedMotion ? "instant" : "smooth");
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
