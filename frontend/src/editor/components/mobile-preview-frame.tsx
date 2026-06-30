"use client";

import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type MobilePreviewFrameProps = Readonly<{
  children: ReactNode;
}>;

export function MobilePreviewFrame({ children }: MobilePreviewFrameProps) {
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);

  const prepareFrame = useCallback((frame: HTMLIFrameElement | null) => {
    const frameDocument = frame?.contentDocument;

    if (!frameDocument || frameDocument.body.dataset.previewReady) {
      return;
    }

    frameDocument.body.dataset.previewReady = "true";
    frameDocument.documentElement.lang = "ru";
    frameDocument.documentElement.classList.add("mobile-preview-document");
    frameDocument.body.style.margin = "0";
    frameDocument.body.style.minHeight = "100%";

    document.head
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => frameDocument.head.appendChild(node.cloneNode(true)));

    setFrameBody(frameDocument.body);
  }, []);

  return (
    <div className="editor-phone-preview">
      <iframe
        aria-label="Предпросмотр приглашения на телефоне"
        className="editor-phone-preview__frame"
        onLoad={(event) => prepareFrame(event.currentTarget)}
        ref={prepareFrame}
        srcDoc="<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'></head><body></body></html>"
        title="Предпросмотр на телефоне"
      />
      {frameBody ? createPortal(children, frameBody) : null}
    </div>
  );
}
