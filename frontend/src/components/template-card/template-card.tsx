"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";
import { getTemplatePalettes } from "@/lib/template-palettes";
import { trackGoal } from "@/lib/analytics";
import type { InviteTemplate } from "@/lib/invite-templates";
import { formatCardIndex, getEditorHref } from "./template-card-helpers";

const TemplateCardCarousel = dynamic(() => import("./template-card-carousel"), {
  ssr: false,
});

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
        href={getEditorHref(template.id, siteId)}
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
    <TemplateCardCarousel
      className={rootClassName}
      eagerImage={eagerImage}
      imageSizes={imageSizes}
      index={index}
      meta={meta}
      palettes={palettes}
      siteId={siteId}
      template={template}
    />
  );
}
