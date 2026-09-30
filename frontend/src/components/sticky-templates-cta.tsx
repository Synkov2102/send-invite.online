"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import TrackedLink from "./tracked-link";
import styles from "./sticky-templates-cta.module.css";

export default function StickyTemplatesCta() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const visible = isPastHero && !isFooterVisible;

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

    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden={!visible} className={visible ? `${styles.bar} ${styles.visible}` : styles.bar}>
      <TrackedLink
        className={styles.cta}
        goal="sticky_mobile_cta_click"
        href="/templates"
        tabIndex={visible ? undefined : -1}
      >
        Выбрать шаблон <ArrowRight aria-hidden size={16} />
      </TrackedLink>
    </div>
  );
}
