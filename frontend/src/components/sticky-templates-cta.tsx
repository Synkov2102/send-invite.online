"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import TrackedLink from "./tracked-link";
import styles from "./sticky-templates-cta.module.css";

export default function StickyTemplatesCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden={!visible} className={visible ? `${styles.bar} ${styles.visible}` : styles.bar}>
      <TrackedLink className={styles.cta} goal="sticky_mobile_cta_click" href="/templates">
        Выбрать шаблон <ArrowRight aria-hidden size={16} />
      </TrackedLink>
    </div>
  );
}
