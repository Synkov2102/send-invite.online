import type { Metadata } from "next";
import {
  CalendarClock,
  CheckCircle2,
  Globe2,
  Inbox,
  MessageSquareText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardSiteCard from "@/components/dashboard-site-card";
import SiteHeader from "@/components/site-header";
import { getOwnedInviteSites, type OwnedInviteSite } from "@/lib/backend-api";
import { getAuthSessionToken, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Сайты-приглашения и ответы гостей.",
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const [user, sessionToken] = await Promise.all([
    getCurrentUser(),
    getAuthSessionToken(),
  ]);

  if (!user || !sessionToken) {
    redirect("/auth?mode=login&returnTo=%2Fdashboard");
  }

  let sites: OwnedInviteSite[] = [];
  let loadError = false;

  try {
    sites = await getOwnedInviteSites(sessionToken);
  } catch {
    loadError = true;
  }

  const totalResponses = sites.reduce((total, site) => total + site.responseCount, 0);
  const activeRsvpSites = sites.filter((site) => site.rsvpEnabled).length;
  const nextEvent = sites
    .filter((site) => site.date && new Date(site.date) >= new Date())
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())[0];

  return (
    <div className="dashboard-page">
      <SiteHeader />

      <main className="dashboard-shell">
        <header className="dashboard-heading">
          <div>
            <p>Здравствуйте, {user.name}</p>
            <h1>Мои сайты</h1>
            <span>Управляйте приглашениями и ответами гостей в одном месте.</span>
          </div>
          <Link className="dashboard-create" href="/templates">
            <Plus aria-hidden size={16} />
            Создать приглашение
          </Link>
        </header>

        {loadError ? (
          <p className="dashboard-notice" role="alert">
            Не удалось загрузить сайты. Обновите страницу через минуту.
          </p>
        ) : sites.length === 0 ? (
          <section className="dashboard-empty">
            <Inbox aria-hidden size={28} />
            <h2>Здесь появятся ваши приглашения</h2>
            <p>Создайте сайт и отправьте ссылку гостям, чтобы собирать ответы.</p>
            <Link href="/templates">Выбрать шаблон</Link>
          </section>
        ) : (
          <>
            <section className="dashboard-stats" aria-label="Сводка">
              <article>
                <Globe2 aria-hidden size={18} />
                <span>Сайтов</span>
                <strong>{sites.length}</strong>
                <small>Опубликовано</small>
              </article>
              <article>
                <CheckCircle2 aria-hidden size={18} />
                <span>RSVP активно</span>
                <strong>{activeRsvpSites}</strong>
                <small>Собирают ответы</small>
              </article>
              <article>
                <MessageSquareText aria-hidden size={18} />
                <span>Ответов</span>
                <strong>{totalResponses}</strong>
                <small>Загружаются по запросу</small>
              </article>
              <article>
                <CalendarClock aria-hidden size={18} />
                <span>Ближайшее событие</span>
                <strong>{nextEvent ? formatDate(nextEvent.date) : "—"}</strong>
                <small>
                  {nextEvent ? `${nextEvent.groom} & ${nextEvent.bride}` : "Даты не запланированы"}
                </small>
              </article>
            </section>

            <div className="dashboard-list-heading">
              <div>
                <h2>Все приглашения</h2>
                <span>{sites.length} опубликовано</span>
              </div>
            </div>

            <div className="dashboard-sites">
              {sites.map((site) => (
                <DashboardSiteCard key={site.id} site={site} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
