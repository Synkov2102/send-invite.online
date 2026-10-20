import type { PartnerPromoCode, PartnerPromoStats } from "@invite/shared";
import { Ticket } from "lucide-react";
import Link from "next/link";
import styles from "./partner-stats.module.css";

export const PARTNER_STATS_PERIODS = [7, 30, 90] as const;

export type PartnerStatsPeriod = (typeof PARTNER_STATS_PERIODS)[number];

type PartnerStatsProps = {
  codes: PartnerPromoCode[];
  days: PartnerStatsPeriod;
  selected: PartnerPromoCode;
  stats: PartnerPromoStats | null;
};

const CHART_HEIGHT = 160;
const BAR_STEP = 10;
const BAR_WIDTH = 7;

function getHref(codeId: string, days: number) {
  return `/dashboard/partner?${new URLSearchParams({ code: codeId, days: String(days) })}`;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).format(new Date(value));
}

function getCodeStatus(code: PartnerPromoCode) {
  if (!code.isActive) {
    return "Отключён";
  }

  if (code.expiresAt && Date.parse(code.expiresAt) <= Date.now()) {
    return "Срок действия истёк";
  }

  if (code.remaining === 0) {
    return "Лимит активаций исчерпан";
  }

  if (code.startsAt && Date.parse(code.startsAt) > Date.now()) {
    return `Начнёт действовать ${formatDate(code.startsAt)}`;
  }

  return code.expiresAt ? `Действует до ${formatDate(code.expiresAt)}` : "Действует бессрочно";
}

function DailyChart({ daily }: { daily: PartnerPromoStats["daily"] }) {
  const peak = Math.max(0, ...daily.map((day) => day.count));
  const max = Math.max(1, peak);
  const width = daily.length * BAR_STEP;

  return (
    <figure className={styles.chart}>
      <div className={styles.chartBody}>
        {peak > 0 ? <span className={styles.axisMax}>{peak}</span> : null}
        <svg
          aria-label="Использования по дням"
          className={styles.svg}
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        >
          {daily.map((day, index) => {
            // Нулевой день — тонкая линия, чтобы был виден сам день на оси.
            const height = day.count === 0 ? 2 : (day.count / max) * CHART_HEIGHT;

            return (
              <rect
                className={day.count === 0 ? styles.barEmpty : styles.bar}
                height={height}
                key={day.date}
                width={BAR_WIDTH}
                x={index * BAR_STEP + (BAR_STEP - BAR_WIDTH) / 2}
                y={CHART_HEIGHT - height}
              >
                <title>{`${formatDay(day.date)}: ${day.count}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <figcaption className={styles.axisDates}>
        <span>{daily[0] ? formatDay(daily[0].date) : ""}</span>
        <span>{daily.at(-1) ? formatDay(daily.at(-1)!.date) : ""}</span>
      </figcaption>
    </figure>
  );
}

export default function PartnerStats({ codes, days, selected, stats }: PartnerStatsProps) {
  return (
    <div className={styles.root}>
      {codes.length > 1 ? (
        <nav aria-label="Промокоды" className={styles.codes}>
          {codes.map((code) => (
            <Link
              aria-current={code.id === selected.id ? "page" : undefined}
              className={styles.codeLink}
              href={getHref(code.id, days)}
              key={code.id}
            >
              {code.code}
            </Link>
          ))}
        </nav>
      ) : null}

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div className={styles.codeInfo}>
            <span className={styles.codeIcon}>
              <Ticket aria-hidden size={18} />
            </span>
            <div>
              <h2>{selected.code}</h2>
              <p>{getCodeStatus(selected)}</p>
            </div>
          </div>
          <nav aria-label="Период" className={styles.periods}>
            {PARTNER_STATS_PERIODS.map((period) => (
              <Link
                aria-current={period === days ? "page" : undefined}
                className={styles.periodLink}
                href={getHref(selected.id, period)}
                key={period}
              >
                {period} дней
              </Link>
            ))}
          </nav>
        </header>

        {stats ? (
          <>
            <dl className={styles.summary}>
              <div>
                <dt>Использований за период</dt>
                <dd>{stats.total}</dd>
              </div>
              {selected.remaining !== null ? (
                <div>
                  <dt>Осталось активаций</dt>
                  <dd>{selected.remaining}</dd>
                </div>
              ) : null}
            </dl>
            <DailyChart daily={stats.daily} />
            <p className={styles.hint}>
              Использование — оплаченный заказ с этим промокодом. Дни считаются по московскому
              времени.
            </p>
          </>
        ) : (
          <p className={styles.error} role="alert">
            Не удалось загрузить статистику. Обновите страницу через минуту.
          </p>
        )}
      </section>
    </div>
  );
}
