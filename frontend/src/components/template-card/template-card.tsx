"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";
import { getTemplatePalettes } from "@/lib/template-palettes";
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
}: TemplateCardProps) {
  const palettes = getTemplatePalettes(template);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    active: paletteCarousel && palettes.length > 1,
    loop: palettes.length > 1,
  });
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const selectedPalette = palettes[selectedIndex] ?? palettes[0];
  const editorHref = getEditorHref(
    template.id,
    siteId,
    paletteCarousel ? selectedPalette?.id : undefined,
  );
  const rootClassName = `template-card${className ? ` ${className}` : ""}`;

  const updateSelectedIndex = useCallback(() => {
    if (emblaApi) {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>) {
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
    hasDragged.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (!pointerOrigin.current) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - pointerOrigin.current.x,
      event.clientY - pointerOrigin.current.y,
    );

    if (distance > 8) {
      hasDragged.current = true;
    }
  }

  function handleSlideClick(event: MouseEvent<HTMLAnchorElement>) {
    pointerOrigin.current = null;

    if (hasDragged.current) {
      event.preventDefault();
      hasDragged.current = false;
    }
  }

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
      <Link className={rootClassName} href={editorHref}>
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
          <div className={styles.viewport} ref={emblaRef}>
            <div className={styles.track}>
              {palettes.map((palette, paletteIndex) => (
                <div
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
                    onClick={handleSlideClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
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
                </div>
              ))}
            </div>
          </div>

          <button
            aria-label="Предыдущая палитра"
            className={`${styles.control} ${styles.previous}`}
            onClick={() => emblaApi?.scrollPrev()}
            type="button"
          >
            <ArrowLeft aria-hidden size={17} />
          </button>
          <button
            aria-label="Следующая палитра"
            className={`${styles.control} ${styles.next}`}
            onClick={() => emblaApi?.scrollNext()}
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
                onClick={() => emblaApi?.scrollTo(paletteIndex)}
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
