"use client";

import { useState, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { InviteTemplate } from "@/lib/invite-templates";
import type { InvitePalettePreset } from "@/lib/invite-palette-catalog";
import { formatCardIndex, getEditorHref } from "./template-card-helpers";
import styles from "./template-card.module.css";

type TemplateCardCarouselProps = {
  className: string;
  eagerImage: boolean;
  imageSizes: string;
  index: number;
  meta: ReactNode;
  palettes: InvitePalettePreset[];
  siteId?: string;
  template: InviteTemplate;
};

// Слайдов у карточки до десяти, а видно всегда один. Держим смонтированными
// только активный и соседей — иначе страница каталога тянет ~77 картинок разом.
function getNeighbourIndexes(index: number, total: number) {
  return [(index - 1 + total) % total, index, (index + 1) % total];
}

export default function TemplateCardCarousel({
  className,
  eagerImage,
  imageSizes,
  index,
  meta,
  palettes,
  siteId,
  template,
}: TemplateCardCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [mountedIndexes, setMountedIndexes] = useState(
    () => new Set(getNeighbourIndexes(0, palettes.length)),
  );
  const isCarouselActive = palettes.length > 1;
  const selectedPalette = palettes[selectedIndex] ?? palettes[0];
  const editorHref = getEditorHref(template.id, siteId, selectedPalette?.id);

  return (
    <article className={className}>
      <div className="template-card__showcase">
        <span className="template-card__index">{formatCardIndex(index)}</span>
        <div
          aria-label={`Палитры шаблона «${template.name}»`}
          aria-roledescription="карусель"
          className="template-card__device"
          role="region"
        >
          <Swiper
            className={styles.viewport}
            enabled={isCarouselActive}
            loop={isCarouselActive}
            onSlideChange={(instance) => {
              setSelectedIndex(instance.realIndex);
              setMountedIndexes((previous) => {
                const next = new Set(previous);

                for (const index of getNeighbourIndexes(instance.realIndex, palettes.length)) {
                  next.add(index);
                }

                return next;
              });
            }}
            onSwiper={setSwiper}
            slidesPerView={1}
          >
            {palettes.map((palette, paletteIndex) => (
              <SwiperSlide
                aria-label={`${paletteIndex + 1} из ${palettes.length}: ${palette.label}`}
                aria-roledescription="слайд"
                className={styles.slide}
                key={palette.id}
                role="group"
              >
                <Link
                  aria-label={`Открыть шаблон «${template.name}» в палитре «${palette.label}»`}
                  className={styles.previewLink}
                  draggable={false}
                  href={getEditorHref(template.id, siteId, palette.id)}
                >
                  <div
                    className="template-card__device-screen"
                    style={{ backgroundColor: palette.background }}
                  >
                    {mountedIndexes.has(paletteIndex) ? (
                      <Image
                        alt={`Шаблон «${template.name}», палитра «${palette.label}»`}
                        draggable={false}
                        fill
                        loading={eagerImage && paletteIndex === 0 ? "eager" : undefined}
                        sizes={imageSizes}
                        src={`/images/templates/${template.id}/${palette.id}.webp${
                          template.id === "chapter-ticket" ? "?v=20260729-1" : ""
                        }`}
                      />
                    ) : null}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            aria-label="Предыдущая палитра"
            className={`${styles.control} ${styles.previous}`}
            onClick={() => swiper?.slidePrev()}
            type="button"
          >
            <ArrowLeft aria-hidden size={17} />
          </button>
          <button
            aria-label="Следующая палитра"
            className={`${styles.control} ${styles.next}`}
            onClick={() => swiper?.slideNext()}
            type="button"
          >
            <ArrowRight aria-hidden size={17} />
          </button>
        </div>

        <p className={styles.swipeHint}>
          <MoveHorizontal aria-hidden size={15} />
          Свайпните, чтобы сменить палитру
        </p>
        <div className={styles.paletteMeta}>
          <span aria-live="polite">{selectedPalette.label}</span>
          <div aria-label="Выбрать палитру" className={styles.dots} role="group">
            {palettes.map((palette, paletteIndex) => (
              <button
                aria-label={`Палитра «${palette.label}»`}
                aria-pressed={paletteIndex === selectedIndex}
                className={paletteIndex === selectedIndex ? styles.activeDot : styles.dot}
                key={palette.id}
                onClick={() => swiper?.slideToLoop(paletteIndex)}
                style={{ backgroundColor: palette.accent }}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>

      <Link className={styles.metaLink} href={editorHref}>
        {meta}
      </Link>
    </article>
  );
}
