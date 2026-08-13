"use client";

import {
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  MessageSquareText,
  PanelsTopLeft,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ResponsesModal from "@/components/responses-modal";
import { deleteInviteResponse, fetchInviteResponses } from "@/lib/api/sites";
import type { InviteResponseData, OwnedInviteSite } from "@/lib/backend-api";
import { getInviteTemplateName } from "@/lib/invite-templates";
import styles from "./dashboard-site-card.module.css";

type DashboardSiteCardProps = {
  site: OwnedInviteSite;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardSiteCard({ site }: DashboardSiteCardProps) {
  const [details, setDetails] = useState<InviteResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // После удалений число ответов знает только загруженный список — счётчик с
  // сервера остаётся на значении, с которым отрисовалась страница.
  const responseCount = details ? details.responses.length : site.responseCount;

  async function openResponses() {
    if (details) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    try {
      setDetails((await fetchInviteResponses(site.id)) as InviteResponseData);
      setIsOpen(true);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeResponses(responseId?: string) {
    const confirmed = window.confirm(
      responseId ? "Удалить этот ответ?" : "Удалить все ответы гостей? Отменить нельзя.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteInviteResponse(site.id, responseId);

      if (!details) {
        return;
      }

      const responses = responseId
        ? details.responses.filter((item) => item.id !== responseId)
        : [];

      setDetails({ ...details, responses });

      // Пустую таблицу показывать незачем — возвращаем к карточке.
      if (responses.length === 0) {
        setIsOpen(false);
      }
    } catch {
      setLoadError(true);
    }
  }

  const status = !site.isPaid
    ? { label: "Ожидает оплаты", tone: styles.isPending }
    : site.isPublished
      ? { label: "Опубликован", tone: styles.isLive }
      : { label: "Скрыт", tone: styles.isHidden };

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <span className={styles.icon}>
          <Globe2 aria-hidden size={19} />
        </span>

        <div className={styles.title}>
          <h2>
            {site.groom} &amp; {site.bride}
          </h2>
          <p>
            {getInviteTemplateName(site.templateId)}
            {site.date ? ` · ${formatDate(site.date)}` : null}
          </p>
        </div>

        <span className={`${styles.status} ${status.tone}`}>
          <i />
          {status.label}
        </span>
      </header>

      <div className={styles.responses}>
        <span className={styles.responsesLabel}>
          <MessageSquareText aria-hidden size={16} />
          {!site.rsvpEnabled
            ? "Сбор ответов отключён"
            : responseCount === 0
              ? "Ответов пока нет"
              : "Ответов гостей"}
          {site.rsvpEnabled && responseCount > 0 ? <b>{responseCount}</b> : null}
        </span>

        {!site.rsvpEnabled ? null : responseCount === 0 ? (
          <Link className={styles.quiet} href={site.url} target="_blank">
            Проверить форму
          </Link>
        ) : (
          <button
            className={styles.review}
            disabled={isLoading}
            onClick={() => void openResponses()}
            type="button"
          >
            {isLoading ? "Загружаем…" : "Посмотреть ответы"}
          </button>
        )}
      </div>

      {loadError ? (
        <p className={styles.error} role="alert">
          Не удалось загрузить ответы. Попробуйте ещё раз.
        </p>
      ) : null}

      <footer className={styles.actions}>
        <Link className={styles.primary} href={`/editor?site=${site.id}`}>
          <Pencil aria-hidden size={15} />
          Редактировать
        </Link>

        {site.isPaid ? (
          <>
            {site.isPublished ? (
              <a href={site.url} rel="noreferrer" target="_blank">
                <ExternalLink aria-hidden size={15} />
                Открыть сайт
              </a>
            ) : null}

            <form action={`/dashboard/actions/sites/${site.id}/visibility`} method="post">
              <input name="isPublished" type="hidden" value={site.isPublished ? "false" : "true"} />
              <button type="submit">
                {site.isPublished ? (
                  <>
                    <EyeOff aria-hidden size={15} />
                    Скрыть
                  </>
                ) : (
                  <>
                    <Eye aria-hidden size={15} />
                    Опубликовать
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <Link className={styles.pay} href={`/editor?site=${site.id}`}>
            <CreditCard aria-hidden size={15} />
            Оплатить и опубликовать
          </Link>
        )}

        <Link href={`/templates?site=${site.id}`}>
          <PanelsTopLeft aria-hidden size={15} />
          Сменить шаблон
        </Link>
      </footer>

      {isOpen && details ? (
        <ResponsesModal
          data={details}
          downloadUrl={`/downloads/sites/${site.id}/responses`}
          onClose={() => setIsOpen(false)}
          onRemove={(responseId) => void removeResponses(responseId)}
          title={`${site.groom} & ${site.bride}`}
        />
      ) : null}
    </section>
  );
}
