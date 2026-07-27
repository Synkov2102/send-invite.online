"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { formatValuePropIndex, homeValueProps } from "@/lib/home-value-props";

const ValuePropsCarouselMobile = dynamic(() => import("./value-props-carousel-mobile"), {
  ssr: false,
});

const MOBILE_QUERY = "(max-width: 640px)";

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
    <ValuePropsCarouselMobile
      cardClassName={cardClassName}
      iconClassName={iconClassName}
      numberClassName={numberClassName}
      prefersReducedMotion={prefersReducedMotion}
    />
  );
}
