"use client";

import { Palette } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useEditor } from "../../editor-context";
import styles from "./preview-palette-dock.module.css";

/**
 * Примерка палитр прямо в полноэкранном превью: гостевой вид — единственное
 * место, где цвет виден целиком, поэтому переключатель живёт здесь, а не только
 * в шаге «Дизайн». Выбор идёт через тот же selectPalette, что и в редакторе.
 */
export function PreviewPaletteDock() {
  const { palettes, resolvedPaletteId, selectPalette } = useEditor();
  const stripRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const activePalette = palettes.find((item) => item.id === resolvedPaletteId);

  // Растушёвка по краям нужна только когда лента реально не помещается —
  // иначе она срезала бы крайние образцы без причины.
  useEffect(() => {
    const strip = stripRef.current;

    if (!strip) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setIsOverflowing(strip.scrollWidth > strip.clientWidth + 1);
    });

    observer.observe(strip);

    return () => observer.disconnect();
  }, [palettes.length]);

  // Выбранный образец может быть далеко в ленте — подводим его в кадр.
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [resolvedPaletteId]);

  if (palettes.length < 2) {
    return null;
  }

  return (
    <div className={styles.dock}>
      <p aria-live="polite" className={styles.caption}>
        <Palette aria-hidden size={13} />
        <span className={styles.captionLabel}>Палитра</span>
        <span className={styles.captionName}>{activePalette?.label ?? "Своя палитра"}</span>
      </p>
      <div
        aria-label="Палитра приглашения"
        className={styles.strip}
        data-overflowing={isOverflowing ? "" : undefined}
        ref={stripRef}
        role="group"
      >
        {palettes.map((item) => (
          <button
            aria-label={item.label}
            aria-pressed={item.id === resolvedPaletteId}
            className={styles.swatch}
            key={item.id}
            onClick={() => selectPalette(item.id)}
            style={
              {
                "--swatch-paper": item.surface,
                "--swatch-accent": item.accent,
                "--swatch-ground": item.background,
              } as CSSProperties
            }
            title={item.label}
            type="button"
          >
            <span aria-hidden className={styles.sample} />
          </button>
        ))}
      </div>
    </div>
  );
}
