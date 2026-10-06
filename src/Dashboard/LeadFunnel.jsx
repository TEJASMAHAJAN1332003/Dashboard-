import { useState } from "react";
import {
  Layers,
  Clock,
  CircleDollarSign,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCountUp } from "./revenueUtils";
import CardEditFilter from "./Cardeditfilter";

/* Stage colors run from light yellow to black.
   `onAccent` is the readable text color placed on top of each stage color. */
const DEFAULT_STAGES = [
  {
    id: "leads",
    title: "Leads",
    count: 164,
    pct: 100,
    prevPassRate: 100,
    valueINR: "₹2.15 Cr",
    avgDays: "1.2 days",
    description: "Inbound enquiries & campaign capture",
    accent: "#fde68a",
    onAccent: "#111111",
  },
  {
    id: "prospect",
    title: "Prospect",
    count: 118,
    pct: 72,
    prevPassRate: 72.0,
    valueINR: "₹1.62 Cr",
    avgDays: "2.8 days",
    description: "Qualified & preliminary requirement verified",
    accent: "#D4AF37",
    onAccent: "#111111",
  },
  {
    id: "opportunity",
    title: "Opportunity",
    count: 74,
    pct: 45,
    prevPassRate: 62.7,
    valueINR: "₹1.05 Cr",
    avgDays: "4.5 days",
    description: "Site visits scheduled, quote & proposals shared",
    accent: "#737373",
    onAccent: "#ffffff",
  },
  {
    id: "booked",
    title: "Booked",
    count: 42,
    pct: 26,
    prevPassRate: 56.8,
    valueINR: "₹58.4 L",
    avgDays: "3.1 days",
    description: "Booking token deposited & terms agreed",
    accent: "#404040",
    onAccent: "#ffffff",
  },
  {
    id: "closed",
    title: "Closed",
    count: 24,
    pct: 15,
    prevPassRate: 57.1,
    valueINR: "₹34.8 L",
    avgDays: "Won",
    description: "Agreement registered & deal closed",
    accent: "#111111",
    onAccent: "#ffffff",
  },
];

export default function LeadFunnel({ className = "", onEditApply }) {
  const [activeStageId, setActiveStageId] = useState(null);
  const [metricView, setMetricView] = useState("count"); // "count" or "value"

  const stages = DEFAULT_STAGES;
  const activeStage =
    stages.find((s) => s.id === activeStageId) || stages[0];

  const totalLeads = stages[0]?.count || 0;
  const wonDeals = stages[stages.length - 1]?.count || 0;
  const overallWinRate =
    totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : 0;

  const animatedTotal = useCountUp(totalLeads, 600);
  const animatedWon = useCountUp(wonDeals, 600);

  // SVG Funnel Ribbon Dimensions
  const totalW = 1000;
  const totalH = 80;
  const segmentW = totalW / stages.length;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-sm">
            <Layers size={17} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-black">
                Lead Funnel
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                Win Rate {overallWinRate}%
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              The pathway from lead to conversion
            </p>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Shared Edit button + filter popup */}
          <CardEditFilter onApply={onEditApply} />
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Stage Columns & Metrics (Top Row)                             */}
      {/* ------------------------------------------------------------ */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0">
        {stages.map((stage, idx) => {
          const isSelected = activeStageId === stage.id;

          return (
            <div
              key={stage.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveStageId(stage.id)}
              onMouseLeave={() => setActiveStageId(null)}
              onClick={() => setActiveStageId(stage.id)}
              onKeyDown={(e) => e.key === "Enter" && setActiveStageId(stage.id)}
              className={`relative flex cursor-pointer flex-col justify-between p-3 transition-all duration-200 last:border-r-0 sm:border-r sm:border-neutral-100 ${isSelected
                ? "rounded-xl bg-yellow-50 shadow-sm"
                : "rounded-xl hover:bg-neutral-50 sm:rounded-none"
                }`}
            >
              {/* Header Title + Step Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-neutral-600">
                  {stage.title}
                </span>
                <span
                  className="h-2 w-2 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: stage.accent }}
                />
              </div>

              {/* Bold Value */}
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-black">
                  {metricView === "count" ? stage.count : stage.valueINR}
                </span>

                {metricView === "count" && (
                  <span className="text-[11px] font-medium text-neutral-400">
                    leads
                  </span>
                )}
              </div>

              {/* Progress & Pass Rate badge */}
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="font-semibold tabular-nums text-neutral-600">
                  {stage.pct}%
                </span>
                <span className="text-[10px] text-neutral-400">
                  {idx === 0 ? "Entry" : `${stage.prevPassRate}% pass`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Dynamic Flowing Funnel SVG Ribbon                              */}
      {/* ------------------------------------------------------------ */}
      <div className="relative mt-3 w-full overflow-hidden rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          className="block w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {stages.map((stage, idx) => (
              <linearGradient
                key={stage.id}
                id={`funnel-grad-${stage.id}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor={stage.accent} stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor={
                    stages[idx + 1] ? stages[idx + 1].accent : stage.accent
                  }
                  stopOpacity="1"
                />
              </linearGradient>
            ))}
          </defs>

          {/* Draw connected tapered ribbon segments */}
          {stages.map((stage, idx) => {
            const x0 = idx * segmentW;
            const x1 = (idx + 1) * segmentW;

            // Height scaling based on stage percentage with minimum thickness for elegance
            const startPct = stage.pct;
            const nextStage = stages[idx + 1];
            const endPct = nextStage ? nextStage.pct : stage.pct * 0.85;

            // Scale to vertical bounds: max height 62px, min height 12px
            const maxH = 62;
            const minH = 12;

            const h0 = minH + (startPct / 100) * (maxH - minH);
            const h1 = minH + (endPct / 100) * (maxH - minH);

            const midY = totalH / 2;
            const y0_top = midY - h0 / 2;
            const y0_bottom = midY + h0 / 2;
            const y1_top = midY - h1 / 2;
            const y1_bottom = midY + h1 / 2;

            // Slight inset for separator slit
            const gap = 3;
            const drawX0 = x0 + (idx > 0 ? gap : 0);
            const drawX1 = x1 - (idx < stages.length - 1 ? gap : 0);

            // Path for smooth tapered facet
            const pathD = `M ${drawX0} ${y0_top} 
                           L ${drawX1} ${y1_top} 
                           L ${drawX1} ${y1_bottom} 
                           L ${drawX0} ${y0_bottom} Z`;

            const isHovered = activeStageId === stage.id;

            return (
              <g
                key={stage.id}
                onMouseEnter={() => setActiveStageId(stage.id)}
                onMouseLeave={() => setActiveStageId(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Segment ribbon */}
                <path
                  d={pathD}
                  fill={`url(#funnel-grad-${stage.id})`}
                  className={`transition-all duration-300 ${isHovered
                    ? "drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
                    : "opacity-90 hover:opacity-100"
                    }`}
                />

                {/* Percentage label centered inside ribbon */}
                <text
                  x={(drawX0 + drawX1) / 2}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill={stage.onAccent}
                  className="pointer-events-none"
                >
                  {stage.pct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Step-by-step pathway connector pins */}
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-medium">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`flex items-center gap-1 transition ${activeStageId === stage.id
                ? "font-semibold text-black"
                : "text-neutral-500"
                }`}
            >
              <span>{stage.title}</span>
              {idx < stages.length - 1 && (
                <ChevronRight size={13} className="text-neutral-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Interactive Detail Ribbon / Funnel Health Summary             */}
      {/* ------------------------------------------------------------ */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-neutral-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Selected Stage Detail */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-black/10"
            style={{
              backgroundColor: activeStage.accent,
              color: activeStage.onAccent,
            }}
          >
            <Sparkles size={14} />
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black">
                Stage: {activeStage.title}
              </span>
              <span className="text-[11px] font-semibold text-neutral-500">
                ({activeStage.count} leads · {activeStage.pct}% of top funnel)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {activeStage.description}
            </p>
          </div>
        </div>

        {/* Quick Funnel Highlights */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-neutral-400" />
            <span>
              Avg. Velocity: <b className="text-black">{activeStage.avgDays}</b>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CircleDollarSign size={13} className="text-neutral-400" />
            <span>
              Pipeline: <b className="text-black">{activeStage.valueINR}</b>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-black" />
            <span>
              Total Converted: <b className="text-black">{animatedWon}</b> of {animatedTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}