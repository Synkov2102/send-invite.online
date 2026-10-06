"use client";

import { Button } from "@heroui/react";
import { Eye, Maximize2, Monitor, Smartphone } from "lucide-react";
import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import { MobilePreviewFrame } from "../mobile-preview-frame";
import { useEditor } from "../../editor-context";
import styles from "./editor-preview-panel.module.css";

type EditorPreviewPanelProps = Readonly<{
  isCompact?: boolean;
}>;

export function EditorPreviewPanel({ isCompact = false }: EditorPreviewPanelProps) {
  const {
    effectiveInvite,
    invite,
    isWideTemplate,
    palette,
    previewDevice,
    setIsFullscreenPreview,
    setPreviewDevice,
    siteId,
    template,
    templateKind,
  } = useEditor();
  // На телефоне превью уже рендерится в реальной мобильной ширине — рамка не нужна.
  const showPhoneChrome = previewDevice === "mobile" && !isCompact;

  const invitation = (
    <InviteSiteRenderer
      asMain={false}
      className={`published-site published-site--${templateKind}`}
      invite={effectiveInvite}
      palette={palette}
      siteId={siteId}
      template={template}
    />
  );

  return (
    <section className={`${styles.root} editor-preview-scope`} id="invite-preview">
      <div className={styles.inner}>
        <div className={styles.toolbar} data-preview-toolbar>
          <div>
            <p>
              <Eye aria-hidden size={14} /> Живой предпросмотр
            </p>
            <h2>
              {invite.groom} & {invite.bride}
            </h2>
          </div>
          <div className={styles.actions}>
            <div className={styles.deviceSwitch} aria-label="Размер предпросмотра">
              <Button
                aria-label="Предпросмотр на компьютере"
                className={previewDevice === "desktop" ? styles.selected : ""}
                onClick={() => setPreviewDevice("desktop")}
                type="button"
                variant="outline"
              >
                <Monitor aria-hidden size={14} />
              </Button>
              <Button
                aria-label="Предпросмотр на телефоне"
                className={previewDevice === "mobile" ? styles.selected : ""}
                onClick={() => setPreviewDevice("mobile")}
                type="button"
                variant="outline"
              >
                <Smartphone aria-hidden size={14} />
              </Button>
            </div>
            <Button
              aria-label="На весь экран"
              className={styles.action}
              onClick={() => setIsFullscreenPreview(true)}
              type="button"
              variant="outline"
            >
              <Maximize2 aria-hidden size={15} />
              <span>На весь экран</span>
            </Button>
          </div>
        </div>

        <div
          className={[
            styles.canvas,
            styles.canvasReadonly,
            isWideTemplate ? styles.canvasWide : styles.canvasNarrow,
            showPhoneChrome ? styles.canvasMobile : "",
            // hooks for colocated alpine/desktop invite overrides
            isWideTemplate
              ? "editor-preview__canvas--vanilla"
              : "editor-preview__canvas--alpine",
            showPhoneChrome ? "editor-preview__canvas--mobile" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {showPhoneChrome ? (
            <MobilePreviewFrame>{invitation}</MobilePreviewFrame>
          ) : (
            invitation
          )}
        </div>
      </div>
    </section>
  );
}
