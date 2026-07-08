"use client";

import { Button } from "@heroui/react";
import { Eye, Maximize2, Monitor, Smartphone } from "lucide-react";
import { InviteSiteRenderer } from "@/components/invite-site-renderer";
import { MobilePreviewFrame } from "./mobile-preview-frame";
import { useEditor } from "../editor-context";

export function EditorPreviewPanel() {
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
  const showPhoneChrome = previewDevice === "mobile";

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
    <section className="editor-preview" id="invite-preview">
      <div className="editor-preview__inner">
        <div className="editor-preview__toolbar">
          <div>
            <p>
              <Eye aria-hidden size={14} /> Живой предпросмотр
            </p>
            <h2>
              {invite.groom} & {invite.bride}
            </h2>
          </div>
          <div className="editor-preview__actions">
            <div
              className="editor-device-switch"
              aria-label="Размер предпросмотра"
            >
              <Button
                aria-label="Предпросмотр на компьютере"
                className={previewDevice === "desktop" ? "is-selected" : ""}
                onClick={() => setPreviewDevice("desktop")}
                type="button"
                variant="outline"
              >
                <Monitor aria-hidden size={14} />
              </Button>
              <Button
                aria-label="Предпросмотр на телефоне"
                className={previewDevice === "mobile" ? "is-selected" : ""}
                onClick={() => setPreviewDevice("mobile")}
                type="button"
                variant="outline"
              >
                <Smartphone aria-hidden size={14} />
              </Button>
            </div>
            <Button
              className="editor-action editor-action--secondary editor-action--fullscreen"
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
          className={`editor-preview__canvas ${
            isWideTemplate
              ? "editor-preview__canvas--vanilla"
              : "editor-preview__canvas--alpine"
          } ${showPhoneChrome ? "editor-preview__canvas--mobile" : ""} is-readonly`}
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
