"use client";

import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { support } from "@/lib/support";
import styles from "./support-modal.module.css";

type SupportModalProps = {
  /** Trigger content — text for the desktop nav pill, icon + label for the mobile row. */
  children: ReactNode;
  /** Lets the mobile menu close its own panel once the dialog closes. */
  onClose?: () => void;
};

/**
 * Renders both the "Поддержка" trigger and its dialog. Self-contained so it
 * drops into a Server Component (site-header.tsx) without converting the
 * header itself to a Client Component — same pattern as the color picker.
 * The trigger is an `<a role="button">` so it keeps matching the existing
 * `nav a` CSS selectors used across the header stylesheets, instead of
 * requiring those selectors to be extended for `button` everywhere.
 */
export default function SupportModal({ children, onClose }: SupportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, close]);

  return (
    <>
      <a
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        href="#support"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen(true);
        }}
        role="button"
      >
        {children}
      </a>

      {isOpen
        ? createPortal(<SupportDialog onClose={close} titleId={titleId} />, document.body)
        : null}
    </>
  );
}

function SupportDialog({ onClose, titleId }: { onClose: () => void; titleId: string }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Закрыть"
          className={styles.close}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden size={18} />
        </button>

        <h2 id={titleId}>Поддержка</h2>
        <p>
          Мы отвечаем в сообществе ВКонтакте — напишите туда, и мы поможем с
          приглашением, оплатой или публикацией сайта.
        </p>

        <a className={styles.cta} href={support.vkGroupUrl} rel="noreferrer" target="_blank">
          Написать в сообщество ВКонтакте
          <ArrowUpRight aria-hidden size={15} />
        </a>

        <p className={styles.hint}>
          Реквизиты и вопросы по оплате и возврату — на странице{" "}
          <Link href="/contacts" onClick={onClose}>
            контактов и реквизитов
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
