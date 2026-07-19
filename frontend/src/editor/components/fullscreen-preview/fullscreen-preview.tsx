"use client";

import { Button } from "@heroui/react";
import { Eye, Minimize2, Pencil } from "lucide-react";
import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import { useEditor } from "../../editor-context";
import inviteOverrides from "../editor-invite-overrides/editor-invite-overrides.module.css";
import styles from "./fullscreen-preview.module.css";

export function FullscreenPreview() {
  const {
    effectiveInvite,
    isFullscreenPreview,
    isTemplateEntryPreview,
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

  const CloseIcon = isTemplateEntryPreview ? Pencil : Minimize2;
  const closeLabel = isTemplateEntryPreview ? "Редактировать" : "Вернуться в редактор";

  return (
    <section
      className={`fullscreen-preview ${styles.scope} ${inviteOverrides.scope}`}
      aria-label="Полноэкранный предпросмотр"
    >
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
            <CloseIcon aria-hidden size={15} />
            <span>{closeLabel}</span>
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
