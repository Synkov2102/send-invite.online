"use client";

import { Button } from "@heroui/react";
import { Eye, Minimize2 } from "lucide-react";
import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import { useEditor } from "../editor-context";

export function FullscreenPreview() {
  const {
    effectiveInvite,
    isFullscreenPreview,
    isWideTemplate,
    palette,
    setIsFullscreenPreview,
    siteId,
    template,
    templateKind,
  } = useEditor();

  if (!isFullscreenPreview) {
    return null;
  }

  return (
    <section className="fullscreen-preview" aria-label="Полноэкранный предпросмотр">
      <div className="fullscreen-preview__toolbar">
        <div>
          <Eye aria-hidden size={14} />
          <span>Так приглашение увидят гости</span>
        </div>
        <div className="fullscreen-preview__actions">
          <Button
            className="fullscreen-preview__action fullscreen-preview__action--close"
            onClick={() => setIsFullscreenPreview(false)}
            type="button"
            variant="primary"
          >
            <Minimize2 aria-hidden size={15} />
            <span>Вернуться в редактор</span>
          </Button>
        </div>
      </div>
      <div
        className={`fullscreen-preview__page ${
          isWideTemplate ? "fullscreen-preview__page--wide" : "fullscreen-preview__page--alpine"
        }`}
      >
        <InviteSiteRenderer
          asMain={false}
          className={`published-site published-site--${templateKind}`}
          invite={effectiveInvite}
          palette={palette}
          siteId={siteId}
          template={template}
        />
      </div>
    </section>
  );
}
