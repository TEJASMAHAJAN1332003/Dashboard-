import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import RevenueChart from "./RevenueChart";
import RevenueEntityBreakdown from "./RevenueEntityBreakdown";
import { PERIOD_OPTIONS, revenueData } from "./revenueData";

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateGrowth(current, previous) {
  if (
    previous === undefined ||
    previous === null ||
    previous === 0
  ) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatGrowth(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatShare(value, total) {
  if (!total) return "0%";

  return `${((value / total) * 100).toFixed(1)}%`;
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target);
  const startRef = useRef(target);

  useEffect(() => {
    let animationFrame;
    const startValue = startRef.current;
    const difference = target - startValue;

    if (difference === 0) {
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const nextValue =
        startValue + difference * progress;

      const rounded = Math.round(nextValue);
      setValue(rounded);
      startRef.current = rounded;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/* Period Dropdown                                                     */
/* ------------------------------------------------------------------ */

function PeriodDropdown({
  periods,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      onDown
    );

    document.addEventListener(
      "keydown",
      onKey
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onDown
      );

      document.removeEventListener(
        "keydown",
        onKey
      );
    };
  }, [open]);

  const current = periods.find(
    (period) => period.key === value
  );

  return (
    <div
      className="relative"
      ref={ref}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        <CalendarDays
          size={16}
          className="text-sky-600 dark:text-sky-400"
        />

        <span>
          {current?.label || "Today"}
        </span>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.22)] dark:border-slate-700 dark:bg-slate-800"
        >
          {periods.map((periodItem) => {
            const selected =
              periodItem.key === value;

            return (
              <li key={periodItem.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(periodItem.key);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? "bg-sky-50 font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <span>
                    {periodItem.label}
                  </span>

                  {selected && (
                    <Check size={16} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Growth Badge                                                        */
/* ------------------------------------------------------------------ */

function GrowthBadge({ growth }) {
  if (growth === null) {
    return (
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
        No previous period to compare
      </span>
    );
  }

  const positive = growth > 0;
  const negative = growth < 0;

  const Icon = positive
    ? TrendingUp
    : negative
    ? TrendingDown
    : Minus;

  const text = formatGrowth(growth);

  const tone = positive
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
    : negative
    ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${tone}`}
        aria-label={`${text} compared with previous period`}
      >
        <Icon
          size={15}
          strokeWidth={2.4}
        />

        {text}
      </span>

      <span className="text-xs text-slate-500 dark:text-slate-400">
        vs previous period
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main Revenue Performance Component                                  */
/* ------------------------------------------------------------------ */

const EMPTY_ARRAY = [];

export default function RevenuePerformance({
  data = revenueData,
  periods = PERIOD_OPTIONS,
  defaultPeriod = "today",
  loading = false,
  showPieChart = true,
  onPeriodChange,
  className = "",
}) {
  const [period, setPeriod] =
    useState(defaultPeriod);

  const handlePeriod = (key) => {
    setPeriod(key);

    if (onPeriodChange) {
      onPeriodChange(key);
    }
  };

  const current = data?.[period];

  const timeline =
    current?.timeline ?? EMPTY_ARRAY;

  const entities =
    current?.entities ?? EMPTY_ARRAY;

  const totalRevenue =
    Number(current?.totalRevenue) || 0;

  const previousRevenue =
    current?.previousRevenue;

  const growth = calculateGrowth(
    totalRevenue,
    previousRevenue
  );

  const periodMeta =
    periods.find(
      (item) => item.key === period
    );

  const unit =
    periodMeta?.unit || "period";

  /* Highest revenue period */
  const peak = useMemo(() => {
    return timeline.reduce(
      (best, item) => {
        if (
          !best ||
          Number(item.revenue) >
            Number(best.revenue)
        ) {
          return item;
        }

        return best;
      },
      null
    );
  }, [timeline]);

  /* Top revenue source */
  const topEntity = useMemo(() => {
    return entities.reduce(
      (best, entity) => {
        if (
          !best ||
          Number(entity.revenue) >
            Number(best.revenue)
        ) {
          return entity;
        }

        return best;
      },
      null
    );
  }, [entities]);

  const displayTotal = useCountUp(
    loading ? 0 : totalRevenue
  );

  const isEmpty =
    !loading &&
    (timeline.length === 0 ||
      totalRevenue === 0);

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-[0_6px_14px_-4px_rgba(2,132,199,0.55)]">
            <Building2
              size={18}
              strokeWidth={2.2}
            />
          </span>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Revenue Performance
            </h2>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>

              Real-time revenue performance
            </p>
          </div>
        </div>

        <PeriodDropdown
          periods={periods}
          value={period}
          onChange={handlePeriod}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* KPI Section                                                  */}
      {/* ------------------------------------------------------------ */}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Revenue
          </p>

          {loading ? (
            <div className="mt-2 h-9 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {formatINR(displayTotal)}
              </p>

              {!isEmpty && (
                <GrowthBadge
                  growth={growth}
                />
              )}
            </div>
          )}
        </div>

        {/* Quick Statistics */}
        {!loading && !isEmpty && (
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {/* Highest Revenue */}
            {peak && (
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Highest {unit}
                </dt>

                <dd className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatINR(
                    peak.revenue
                  )}

                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    {peak.label}
                  </span>
                </dd>
              </div>
            )}

            {/* Top Revenue Source */}
            {topEntity && (
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Top revenue source
                </dt>

                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {topEntity.name}

                  <span className="ml-1.5 text-xs font-normal tabular-nums text-slate-400">
                    {formatShare(
                      topEntity.revenue,
                      totalRevenue
                    )}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Revenue Chart                                                */}
      {/* ------------------------------------------------------------ */}

      <div className="mt-5">
        <RevenueChart
          timeline={timeline}
          totalRevenue={totalRevenue}
          periodKey={period}
          xAxisLabel={
            periodMeta?.xAxisLabel
          }
          loading={loading}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Revenue Entities                                             */}
      {/* ------------------------------------------------------------ */}

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
        <RevenueEntityBreakdown
          entities={entities}
          totalRevenue={totalRevenue}
          periodKey={period}
          loading={loading}
          showPieChart={showPieChart}
        />
      </div>
    </section>
  );
}