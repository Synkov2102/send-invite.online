"use client";

import { useEffect, type RefObject } from "react";

export function useRibbonScroll(rootRef: RefObject<HTMLElement | null>, revision: unknown) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ownerDocument = root.ownerDocument;
    const view = ownerDocument.defaultView ?? window;
    const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress = 0;
    const timeline = root.querySelector<HTMLElement>("[data-ribbon-timeline]");
    const items = root.querySelectorAll<HTMLElement>("[data-timeline-item]");
    const hero = root.querySelector<HTMLElement>("[data-invite-section='hero']");
    const venue = root.querySelector<HTMLElement>("[data-invite-section='location'] figure");
    const bows = root.querySelectorAll<HTMLElement>("[data-ribbon-bow]");
    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    function update() {
      frame = 0;
      if (!root) return;
      if (preference.matches) {
        root.style.removeProperty("--ribbon-progress");
        root.style.removeProperty("--ribbon-handwriting-shift");
        root.style.removeProperty("--ribbon-venue-scale");
        root.style.removeProperty("--ribbon-runner-opacity");
        root.style.removeProperty("--ribbon-cover-pan");
        root.style.removeProperty("--ribbon-cover-scale");
        bows.forEach((bow) => bow.style.removeProperty("--ribbon-bow-shift"));
        return;
      }

      // В редакторе прокручивается панель, а на опубликованном сайте — окно.
      let top = 0;
      let bottom = view.innerHeight;
      for (let parent = root.parentElement; parent; parent = parent.parentElement) {
        const style = view.getComputedStyle(parent);
        if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
          const rect = parent.getBoundingClientRect();
          top = Math.max(top, rect.top);
          bottom = Math.min(bottom, rect.bottom);
        }
        // Fixed-превью на телефоне вылезает из схлопнутого <main> редактора: предки выше него не обрезают.
        if (style.position === "fixed") break;
      }
      if (bottom <= top) return;
      const height = bottom - top;
      const readingLine = top + height * 0.75;
      const timelineRect = timeline?.getBoundingClientRect();
      const reachedItems = Array.from(items).filter(
        (item) =>
          !item.hasAttribute("data-revealed") &&
          item.getBoundingClientRect().top + 34 <= readingLine,
      );
      const heroRect = hero?.getBoundingClientRect();
      const venueRect = venue?.getBoundingClientRect();
      const bowRects = Array.from(bows, (bow) => ({ bow, rect: bow.getBoundingClientRect() }));

      if (timelineRect && timelineRect.height > 0) {
        progress = Math.max(
          progress,
          clamp((readingLine - timelineRect.top) / timelineRect.height),
        );
        root.style.setProperty("--ribbon-progress", String(progress));
        root.style.setProperty("--ribbon-runner-opacity", progress > 0 && progress < 1 ? "1" : "0");
        reachedItems.forEach((item) => item.setAttribute("data-revealed", ""));
      }
      if (heroRect && heroRect.height > 0) {
        const distance = clamp((top - heroRect.top) / heroRect.height);
        root.style.setProperty("--ribbon-handwriting-shift", `${distance * 72}px`);
        root.style.setProperty("--ribbon-cover-pan", `${distance * 15}px`);
        root.style.setProperty("--ribbon-cover-scale", String(1.035 + distance * 0.055));
      }
      if (venueRect) {
        root.style.setProperty(
          "--ribbon-venue-scale",
          String(1.12 - clamp((bottom - venueRect.top) / (height + venueRect.height)) * 0.1),
        );
      }
      bowRects.forEach(({ bow, rect }) => {
        const amount = Math.max(
          -1,
          Math.min(1, (top + height / 2 - rect.top - rect.height / 2) / height),
        );
        bow.style.setProperty("--ribbon-bow-shift", `${amount * 8}px`);
      });
    }

    function schedule() {
      if (!frame) frame = view.requestAnimationFrame(update);
    }
    schedule();
    const observer = new view.ResizeObserver(schedule);
    observer.observe(root);
    ownerDocument.addEventListener("scroll", schedule, true);
    view.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => {
      view.cancelAnimationFrame(frame);
      observer.disconnect();
      ownerDocument.removeEventListener("scroll", schedule, true);
      view.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, [rootRef, revision]);
}
