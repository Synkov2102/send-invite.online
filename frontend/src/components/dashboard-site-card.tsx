"use client";

import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
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
import type { InviteResponseData, OwnedInviteSite } from "@/lib/backend-api";
import { fetchInviteResponses } from "@/lib/api/sites";
import { getInviteTemplateName } from "@invite/shared";

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardSiteCard({ site }: DashboardSiteCardProps) {
  const [details, setDetails] = useState<InviteResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function loadResponses() {
    if (details || isLoading) {
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    try {
      setDetails((await fetchInviteResponses(site.id)) as InviteResponseData);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const latestActivity = details?.responses[0]?.updatedAt;

  return (
    <section className="dashboard-site">
      <header className="dashboard-site__header">
        <div className="dashboard-site__identity">
          <div className="dashboard-site__icon">
            <Globe2 aria-hidden size={19} />
          </div>
          <div>
            <p>{getInviteTemplateName(site.templateId)}</p>
            <h2>
              {site.groom} & {site.bride}
            </h2>
            <span className={site.isPublished ? "is-active" : "is-muted"}>
              <i />
              {site.isPublished ? "Сайт опубликован" : "Сайт скрыт"}
            </span>
          </div>
        </div>
        <div className="dashboard-site__actions">
          <Link href={`/editor?site=${site.id}`}>
            <Pencil aria-hidden size={15} />
            Редактировать
          </Link>
          <Link
            aria-label="Сменить шаблон"
            href={`/templates?site=${site.id}`}
            title="Сменить шаблон"
          >
            <PanelsTopLeft aria-hidden size={15} />
          </Link>
          {site.isPublished ? (
            <Link aria-label="Открыть сайт" href={site.url} target="_blank" title="Открыть сайт">
              <ExternalLink aria-hidden size={15} />
            </Link>
          ) : null}
          <form action={`/dashboard/actions/sites/${site.id}/visibility`} method="post">
            <input
              name="isPublished"
              type="hidden"
              value={site.isPublished ? "false" : "true"}
            />
            <button
              aria-label={site.isPublished ? "Скрыть сайт" : "Опубликовать сайт"}
              title={site.isPublished ? "Скрыть сайт" : "Опубликовать сайт"}
              type="submit"
            >
              {site.isPublished ? <EyeOff aria-hidden size={15} /> : <Eye aria-hidden size={15} />}
            </button>
          </form>
          {site.rsvpEnabled ? (
            <a href={`/downloads/sites/${site.id}/responses`}>
              <Download aria-hidden size={15} />
              Excel
            </a>
          ) : null}
        </div>
      </header>

      <div className="dashboard-site__facts">
        <div>
          <CalendarDays aria-hidden size={15} />
          <span>Дата события</span>
          <strong>{site.date ? formatDate(site.date) : "Не указана"}</strong>
        </div>
        <div>
          <CalendarClock aria-hidden size={15} />
          <span>Опубликован</span>
          <strong>{formatDate(site.createdAt)}</strong>
        </div>
        <div>
          <MessageSquareText aria-hidden size={15} />
          <span>Ответов гостей</span>
          <strong>{site.rsvpEnabled ? site.responseCount : "—"}</strong>
        </div>
        <div>
          <CheckCircle2 aria-hidden size={15} />
          <span>Последняя активность</span>
          <strong>{latestActivity ? formatDateTime(latestActivity) : "—"}</strong>
        </div>
      </div>

      {!site.rsvpEnabled ? (
        <div className="dashboard-site__empty">
          <span>Сбор ответов отключён для этого приглашения.</span>
        </div>
      ) : site.responseCount === 0 ? (
        <div className="dashboard-site__empty">
          <span>Ответы появятся здесь после заполнения анкеты гостями.</span>
          <Link href={site.url} target="_blank">
            Проверить форму
          </Link>
        </div>
      ) : (
        <details
          className="dashboard-responses"
          onToggle={(event) => {
            if ((event.currentTarget as HTMLDetailsElement).open) {
              void loadResponses();
            }
          }}
        >
          <summary>
            <span>
              <MessageSquareText aria-hidden size={16} />
              Посмотреть ответы
              <b>{site.responseCount}</b>
            </span>
            <ChevronDown aria-hidden size={17} />
          </summary>
          {isLoading ? (
            <div className="dashboard-site__empty">
              <span>Загружаем ответы…</span>
            </div>
          ) : loadError ? (
            <div className="dashboard-site__empty">
              <span>Не удалось загрузить ответы.</span>
            </div>
          ) : details && details.responses.length > 0 ? (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Гость</th>
                    {details.questions.map((question) => (
                      <th key={question}>{question}</th>
                    ))}
                    <th>Обновлено</th>
                  </tr>
                </thead>
                <tbody>
                  {details.responses.map((response) => (
                    <tr key={response.id}>
                      <th scope="row">{response.guestName}</th>
                      {details.questions.map((question, questionIndex) => {
                        const answer = response.answers.find(
                          (item) => item.questionIndex === questionIndex,
                        );

                        return (
                          <td key={`${response.id}-${question}`}>
                            {answer?.values.join(", ") || "—"}
                          </td>
                        );
                      })}
                      <td>{formatDateTime(response.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </details>
      )}
    </section>
  );
}
