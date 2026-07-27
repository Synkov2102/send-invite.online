"use client";

import { useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";
import { getTemplatePalettes } from "@/lib/template-palettes";
import { trackGoal } from "@/lib/analytics";
import type { InviteTemplate } from "@/lib/invite-templates";
import styles from "./template-card.module.css";

type TemplateCardProps = {
  className?: string;
  eagerImage?: boolean;
  imageSizes?: string;
  index: number;
  paletteCarousel?: boolean;
  siteId?: string;
  template: InviteTemplate;
  titleAs?: "h2" | "h3";
  trackingGoal?: string;
};

function formatCardIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function getEditorHref(templateId: string, siteId?: string, paletteId?: string) {
  const editorParams = new URLSearchParams({
    template: templateId,
    preview: "1",
  });

  if (siteId) {
    editorParams.set("site", siteId);
  }

  if (paletteId) {
    editorParams.set("palette", paletteId);
  }

  return `/editor?${editorParams.toString()}`;
}

export default function TemplateCard({
  className,
  eagerImage = false,
  imageSizes = "(max-width: 640px) 92vw, (max-width: 899px) 46vw, 31vw",
  index,
  paletteCarousel = false,
  siteId,
  template,
  titleAs: Title = "h2",
  trackingGoal,
}: TemplateCardProps) {
  const palettes = getTemplatePalettes(template);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const isCarouselActive = paletteCarousel && palettes.length > 1;
  const selectedPalette = palettes[selectedIndex] ?? palettes[0];
  const editorHref = getEditorHref(
    template.id,
    siteId,
    paletteCarousel ? selectedPalette?.id : undefined,
  );
  const rootClassName = `template-card${className ? ` ${className}` : ""}`;

  const meta = (
    <div className="template-card__meta">
      <div>
        <small>{template.tags.join(" · ")}</small>
        <Title>{template.name}</Title>
        <span className="template-card__price">
          <strong>{formatInviteSitePrice()}</strong>
          <span>за сайт</span>
        </span>
      </div>
      <span className="template-card__arrow">
        <ArrowRight aria-hidden size={17} />
      </span>
    </div>
  );

  if (!paletteCarousel || palettes.length === 0) {
    return (
      <Link
        className={rootClassName}
        href={editorHref}
        onClick={trackingGoal ? () => trackGoal(trackingGoal) : undefined}
      >
        <div className="template-card__showcase">
          <span className="template-card__index">{formatCardIndex(index)}</span>
          <div className="template-card__device">
            <div
              className="template-card__device-screen"
              style={{ backgroundColor: template.preview.background }}
            >
              <Image
                alt={`Шаблон «${template.name}»`}
                fill
                loading={eagerImage ? "eager" : undefined}
                sizes={imageSizes}
                src={template.screenshot}
              />
            </div>
          </div>
        </div>
        {meta}
      </Link>
    );
  }

  return (
    <article className={rootClassName}>
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
            onSlideChange={(instance) => setSelectedIndex(instance.realIndex)}
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
                    <Image
                      alt={`Шаблон «${template.name}», палитра «${palette.label}»`}
                      draggable={false}
                      fill
                      loading={eagerImage && paletteIndex === 0 ? "eager" : undefined}
                      sizes={imageSizes}
                      src={`/images/templates/${template.id}/${palette.id}.webp`}
                    />
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
