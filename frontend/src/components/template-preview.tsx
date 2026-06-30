import type { InviteTemplate } from "@/lib/invite-templates";
import Image from "next/image";

type TemplatePreviewProps = {
  template: InviteTemplate;
};

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <div className="template-preview" aria-hidden>
      <Image
        alt=""
        className="template-preview__image"
        fill
        priority
        sizes="(min-width: 900px) 33vw, 100vw"
        src={template.screenshot}
      />
    </div>
  );
}
