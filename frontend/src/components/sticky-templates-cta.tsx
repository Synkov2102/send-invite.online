"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import TrackedLink from "./tracked-link";
import styles from "./sticky-templates-cta.module.css";

type StickyTemplatesCtaProps = {
  goal?: string;
  // Пока в зоне видимости любой из этих CTA, плашка прячется, чтобы не дублировать кнопку.
  inlineCtaSelector?: string;
};

export default function StickyTemplatesCta({
  goal = "sticky_mobile_cta_click",
  inlineCtaSelector,
}: StickyTemplatesCtaProps) {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isInlineCtaVisible, setIsInlineCtaVisible] = useState(false);
  const visible = isPastHero && !isFooterVisible && !isInlineCtaVisible;

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      return;
    }

    // У футера прячемся: иначе фиксированная кнопка закрывает правовые ссылки и контакты.
    const footer = document.querySelector(".commerce-footer");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) {
            setIsPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
          } else {
            setIsFooterVisible(entry.isIntersecting);
          }
        }
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    if (footer) {
      observer.observe(footer);
    }

    const visibleCtas = new Set<Element>();
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleCtas.add(entry.target);
          else visibleCtas.delete(entry.target);
        }
        setIsInlineCtaVisible(visibleCtas.size > 0);
      },
      // +90px снизу ≈ высота плашки: прячемся чуть раньше, чем CTA под ней покажется.
      { rootMargin: "0px 0px 90px 0px" },
    );
    if (inlineCtaSelector) {
      document.querySelectorAll(inlineCtaSelector).forEach((cta) => ctaObserver.observe(cta));
    }

    return () => {
      observer.disconnect();
      ctaObserver.disconnect();
    };
  }, [inlineCtaSelector]);

  return (
    <div
      aria-hidden={!visible}
      className={visible ? `${styles.bar} ${styles.visible}` : styles.bar}
    >
      <TrackedLink
        className={styles.cta}
        goal={goal}
        href="/templates"
        tabIndex={visible ? undefined : -1}
      >
        Выбрать шаблон <ArrowRight aria-hidden size={16} />
      </TrackedLink>
    </div>
  );
}
