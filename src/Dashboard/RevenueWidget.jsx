import { useId, useState } from "react";
import {
  TrendingUp,
  CircleDollarSign,
  Maximize2,
  Minimize2,
  Pencil,
} from "lucide-react";
import { revenueData } from "./revenueData";
import {
  formatINR,
  formatCompactINR,
  generateSparkline,
  useCountUp,
} from "./revenueUtils";
import RevenueEntityBreakdown from "./RevenueEntityBreakdown";

const PERIOD_CONFIGS = [
  {
    key: "today",
    label: "Revenue for Today",
    shortLabel: "Today",
    growth: 16.7,
  },
  {
    key: "last7Days",
    label: "Revenue for Last 7 days",
    shortLabel: "Last 7 Days",
    growth: 15.7,
  },
  {
    key: "last30Days",
    label: "Revenue for Last 30 days",
    shortLabel: "Last 30 Days",
    growth: 12.8,
  },
  {
    key: "lastQuarter",
    label: "Revenue for Last Quarter",
    shortLabel: "Last Quarter",
    growth: 11.3,
  },
];

/* Mini SVG Sparkline Component: black line, soft yellow fill */
function MiniSparkline({ data = [], active = false }) {
  const width = 84;
  const height = 34;
  const { linePath, areaPath } = generateSparkline(data, width, height, 3);
  const uid = useId().replace(/:/g, "");
  const gradId = `spark-grad-${uid}`;

  return (
    <div className="relative h-[34px] w-[84px] shrink-0 overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="#D4AF37"
              stopOpacity={active ? 0.5 : 0.35}
            />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Gradient area */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#${gradId})`}
            className="transition-opacity duration-300"
          />
        )}

        {/* Stroke line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#111111"
            strokeWidth={active ? 2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}
      </svg>
    </div>
  );
}

export default function RevenueWidget({ data = revenueData, className = "" }) {
  const [selectedKey, setSelectedKey] = useState("lastQuarter");
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Compute total aggregated revenue across all periods or current
  const totalQuarterRevenue = data?.lastQuarter?.totalRevenue || 14250000;
  const activePeriodData = data?.[selectedKey] || data?.lastQuarter;
  const activeAmount = activePeriodData?.totalRevenue || totalQuarterRevenue;
  const displayTotal = useCountUp(activeAmount, 600);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-sm">
            <TrendingUp size={16} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-black">
                Revenue
              </h2>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400 ring-1 ring-black/10" />
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Real-time revenue performance at a glance
            </p>
          </div>
        </div>

        {/* Tool buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Edit"
            className="flex h-7 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] font-medium text-neutral-700 transition hover:border-black hover:bg-white hover:text-black active:scale-95"
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBreakdownModal((prev) => !prev)}
            title={showBreakdownModal ? "Compact view" : "View source breakdown"}
            className="flex h-7 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] font-medium text-neutral-700 transition hover:border-black hover:bg-white hover:text-black active:scale-95"
          >
            {showBreakdownModal ? (
              <>
                <Minimize2 size={12} />
                <span>Close</span>
              </>
            ) : (
              <>
                <Maximize2 size={12} />
                <span>Breakdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {showBreakdownModal ? (
        <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <RevenueEntityBreakdown
            entities={activePeriodData?.entities ?? []}
            totalRevenue={activeAmount}
            periodKey={selectedKey}
            showPieChart={true}
          />
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-3 sm:flex-row sm:items-stretch">
          {/* LEFT: Featured black Total Revenue card */}
          <div className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-black p-3.5 text-white shadow-[0_8px_18px_-6px_rgba(0,0,0,0.45)] transition-all duration-300 sm:w-[170px] lg:w-[180px]">
            {/* Ambient yellow glow */}
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-400/15 blur-xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-yellow-400/10 blur-xl"
              aria-hidden="true"
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
                  Total Revenue
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-yellow-400">
                  <CircleDollarSign size={12} />
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-[19px] font-extrabold tracking-tight text-white sm:text-[21px]">
                  INR {formatCompactINR(displayTotal).replace("₹", "")}
                </div>
                <div className="text-[11px] font-medium text-white/60">
                  {formatINR(displayTotal)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-semibold text-black">
                <TrendingUp size={11} strokeWidth={2.4} />
                +14.8%
              </span>
              <span className="text-[10px] font-medium text-white/60">
                vs previous
              </span>
            </div>
          </div>

          {/* RIGHT: 2x2 Grid of Period Mini Cards with Sparklines */}
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            {PERIOD_CONFIGS.map((cfg) => {
              const periodObj = data?.[cfg.key];
              const rev = periodObj?.totalRevenue || 0;
              const timelineValues = (periodObj?.timeline || []).map(
                (t) => t.revenue
              );
              const isSelected = selectedKey === cfg.key;

              return (
                <div
                  key={cfg.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedKey(cfg.key)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedKey(cfg.key)}
                  className={`group/card flex cursor-pointer flex-col justify-between rounded-xl border p-2.5 transition-all duration-200 ${isSelected
                    ? "border-yellow-400 bg-yellow-50/60 shadow-sm ring-1 ring-yellow-400/40"
                    : "border-neutral-100 bg-white hover:border-neutral-300 hover:shadow-sm"
                    }`}
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-[11px] font-medium text-neutral-500">
                        {cfg.label}
                      </p>
                      <p className="mt-0.5 text-[13px] font-bold tabular-nums text-black">
                        INR {formatINR(rev).replace("₹", "")}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums text-black ${isSelected ? "bg-yellow-400" : "bg-yellow-100"
                        }`}
                    >
                      +{cfg.growth}%
                    </span>
                  </div>

                  {/* Sparkline wave at the bottom */}
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-[9.5px] font-medium text-neutral-400">
                      {cfg.shortLabel}
                    </span>
                    <MiniSparkline data={timelineValues} active={isSelected} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}