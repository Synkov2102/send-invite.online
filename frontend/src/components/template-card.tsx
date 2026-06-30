import type { InviteTemplate } from "@/lib/invite-templates";
import TemplatePreview from "@/components/template-preview";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

type TemplateCardProps = {
  siteId?: string;
  template: InviteTemplate;
};

export default function TemplateCard({ siteId, template }: TemplateCardProps) {
  const swatches: { key: string; label: string; color: string }[] = [
    { key: "bg", label: "Фон", color: template.preview.background },
    { key: "surface", label: "Поверхность", color: template.preview.surface },
    { key: "accent", label: "Акцент", color: template.preview.accent },
    { key: "ink", label: "Текст", color: template.preview.ink },
  ];
  const editorParams = new URLSearchParams({ template: template.id });

  if (siteId) {
    editorParams.set("site", siteId);
  }

  return (
    <Link
      className="template-card"
      href={`/editor?${editorParams.toString()}`}
      style={
        {
          "--card-bg": template.preview.background,
          "--card-surface": template.preview.surface,
          "--card-ink": template.preview.ink,
          "--card-accent": template.preview.accent,
        } as CSSProperties
      }
    >
      <div className="template-card__preview">
        <TemplatePreview template={template} />
      </div>

      <div className="template-card__body">
        <div className="template-card__tags">
          {template.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <h2>{template.name}</h2>

        <div className="template-card__palette">
          <span className="template-card__palette-label">Палитра</span>
          <span className="template-card__swatches">
            {swatches.map((swatch) => (
              <span
                key={swatch.key}
                className="template-card__swatch"
                style={{ background: swatch.color } as CSSProperties}
                title={swatch.label}
              />
            ))}
          </span>
        </div>

        <span className="template-card__action">
          <Sparkles size={16} />
          Открыть в редакторе
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
