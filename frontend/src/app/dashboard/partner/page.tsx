import {
  PARTNER_STATS_DEFAULT_DAYS,
  shiftIsoDay,
  toMoscowIsoDay,
  type PartnerPromoCode,
  type PartnerPromoStats,
} from "@invite/shared";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import CommerceFooter from "@/components/commerce-footer";
import PageShellProvider from "@/components/page-shell";
import PartnerStats, {
  PARTNER_STATS_PERIODS,
  type PartnerStatsPeriod,
} from "@/components/partner-stats";
import SiteHeader from "@/components/site-header";
import { getPartnerCodes, getPartnerPromoStats } from "@/lib/backend-api";
import { getAuthSessionToken, getCurrentUser } from "@/lib/auth";
import { createPageMetadata, privateRobots } from "@/lib/seo";
import dashboardStyles from "@/styles/dashboard.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Партнёрская статистика",
  description: "Использование ваших промокодов по дням.",
  path: "/dashboard/partner",
  robots: privateRobots,
});

export const dynamic = "force-dynamic";

type PartnerPageProps = {
  searchParams: Promise<{ code?: string | string[]; days?: string | string[] }>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPeriod(value: string | undefined): PartnerStatsPeriod {
  return (
    PARTNER_STATS_PERIODS.find((period) => String(period) === value) ?? PARTNER_STATS_DEFAULT_DAYS
  );
}

export default async function PartnerPage({ searchParams }: PartnerPageProps) {
  const [user, sessionToken, query] = await Promise.all([
    getCurrentUser(),
    getAuthSessionToken(),
    searchParams,
  ]);

  if (!user || !sessionToken) {
    redirect("/auth?mode=login&returnTo=%2Fdashboard%2Fpartner");
  }

  const days = getPeriod(getParam(query.days));
  let codes: PartnerPromoCode[] = [];
  let loadError = false;

  try {
    codes = await getPartnerCodes(sessionToken);
  } catch {
    loadError = true;
  }

  const requestedCode = getParam(query.code);
  const selected = codes.find((code) => code.id === requestedCode) ?? codes[0];
  let stats: PartnerPromoStats | null = null;

  if (selected) {
    const to = toMoscowIsoDay(new Date());

    try {
      stats = await getPartnerPromoStats(
        selected.id,
        { from: shiftIsoDay(to, -(days - 1)), to },
        sessionToken,
      );
    } catch {
      stats = null;
    }
  }

  return (
    <div className={`${dashboardStyles.scope} dashboard-page`}>
      <SiteHeader initialUser={user} />

      <PageShellProvider as="main" className="dashboard-shell" width="wide">
        <header className="dashboard-heading">
          <div>
            <p>
              <Link href="/dashboard">
                <ArrowLeft aria-hidden size={12} /> Мои сайты
              </Link>
            </p>
            <h1>Партнёрская статистика</h1>
            <span>Сколько раз оплатили приглашение с вашим промокодом.</span>
          </div>
        </header>

        {loadError ? (
          <p className="dashboard-notice" role="alert">
            Не удалось загрузить промокоды. Обновите страницу через минуту.
          </p>
        ) : selected ? (
          <PartnerStats codes={codes} days={days} selected={selected} stats={stats} />
        ) : (
          <section className="dashboard-partner-empty">
            <div>
              <h2>Промокодов пока нет</h2>
              <p>
                Когда мы привяжем к аккаунту ваш партнёрский промокод, статистика появится здесь.
              </p>
            </div>
            <div className="dashboard-partner-empty__visual">
              <Image
                alt="Голубь ждёт партнёрский промокод"
                fill
                sizes="(max-width: 720px) calc(100vw - 32px), 320px"
                src="/images/brand/payment-pending-mascot.webp"
              />
            </div>
          </section>
        )}
      </PageShellProvider>
      <CommerceFooter />
    </div>
  );
}
