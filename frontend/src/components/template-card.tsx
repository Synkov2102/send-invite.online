import type { InviteTemplate } from "@/lib/invite-templates";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";

type TemplateCardProps = {
  className?: string;
  imageSizes?: string;
  index: number;
  siteId?: string;
  template: InviteTemplate;
  titleAs?: "h2" | "h3";
};

function formatCardIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function TemplateCard({
  className,
  imageSizes = "(max-width: 640px) 92vw, (max-width: 899px) 46vw, 31vw",
  index,
  siteId,
  template,
  titleAs: Title = "h2",
}: TemplateCardProps) {
  const editorParams = new URLSearchParams({ template: template.id });

  if (siteId) {
    editorParams.set("site", siteId);
  }

  const rootClassName = `template-card${className ? ` ${className}` : ""}`;

  return (
    <Link className={rootClassName} href={`/editor?${editorParams.toString()}`}>
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
              sizes={imageSizes}
              src={template.screenshot}
            />
          </div>
        </div>
      </div>

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
    </Link>
  );
}
