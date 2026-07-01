import type { InviteTemplate } from "@/lib/invite-templates";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  const rootClassName = className ? `template-card ${className}` : "template-card";

  return (
    <Link className={rootClassName} href={`/editor?${editorParams.toString()}`}>
      <div className="template-card__image">
        <Image
          alt={`Шаблон «${template.name}»`}
          fill
          sizes={imageSizes}
          src={template.screenshot}
        />
        <span>{formatCardIndex(index)}</span>
      </div>

      <div className="template-card__meta">
        <div>
          <small>{template.tags.join(" · ")}</small>
          <Title>{template.name}</Title>
        </div>
        <span className="template-card__arrow">
          <ArrowRight aria-hidden size={17} />
        </span>
      </div>
    </Link>
  );
}
