import { useId, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  barPath,
  formatCompactINR,
  formatINR,
  formatShare,
  niceScale,
  useElementWidth,
} from "./revenueUtils";

const CSS = `
@keyframes rev-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.rev-bar {
  transform-box: fill-box;
  transform-origin: bottom;
  animation: rev-grow 650ms cubic-bezier(.22,1,.36,1) both;
  animation-delay: var(--d, 0ms);
}
@media (prefers-reduced-motion: reduce) { .rev-bar { animation: none; } }
`;

const HEIGHT = 300;
const M = { top: 22, right: 10, bottom: 50, left: 64 };

/**
 * Props
 *  - timeline:     [{ label, revenue, fullLabel? }]
 *  - totalRevenue: number   (used for the "% of total" line in the tooltip)
 *  - periodKey:    string   (replays the grow animation when it changes)
 *  - xAxisLabel:   string   (x-axis title, e.g. "Day")
 *  - loading:      boolean
 */
export default function RevenueChart({
  timeline = [],
  totalRevenue = 0,
  periodKey,
  xAxisLabel = "",
  loading = false,
}) {
  const uid = useId().replace(/:/g, "");
  const [ref, width] = useElementWidth();
  const [prevPeriodKey, setPrevPeriodKey] = useState(periodKey);
  const [active, setActive] = useState(null);

  if (prevPeriodKey !== periodKey) {
    setPrevPeriodKey(periodKey);
    setActive(null);
  }

  const n = timeline.length;
  const innerW = Math.max(width - M.left - M.right, 0);
  const innerH = HEIGHT - M.top - M.bottom;

  const max = Math.max(...timeline.map((p) => p.revenue), 0);
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  const yOf = (v) => M.top + innerH - (v / top) * innerH;

  const band = n ? innerW / n : 0;
  const barW = Math.max(4, Math.min(band * 0.6, 48));
  const maxLabels = Math.max(Math.floor(innerW / 50), 1);
  const labelEvery = Math.ceil(n / maxLabels);

  // the highest bar is highlighted by default, like the reference
  const peakIdx = max > 0 ? timeline.findIndex((p) => p.revenue === max) : null;
  const activeIdx = active !== null ? active : peakIdx;

  const hovered = active !== null ? timeline[active] : null;
  const hoveredCx = active !== null ? M.left + band * active + band / 2 : 0;

  const peak = peakIdx !== null && peakIdx >= 0 ? timeline[peakIdx] : null;
  const peakCx = peak ? M.left + band * peakIdx + band / 2 : 0;

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: HEIGHT }}
      onPointerLeave={() => setActive(null)}
    >
      <style>{CSS}</style>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 flex items-end gap-2 px-8 pb-10 pt-4" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-t-md bg-neutral-100"
              style={{ height: `${30 + ((i * 37) % 60)}%` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && n === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-black">
            <BarChart3 size={20} />
          </span>
          <p className="text-sm font-semibold text-black">No revenue recorded</p>
          <p className="max-w-[260px] text-xs text-neutral-500">
            No closed deals or payments were found for this period. Try a longer period.
          </p>
        </div>
      )}

      {!loading && n > 0 && width > 0 && (
        <>
          <svg
            width={width}
            height={HEIGHT}
            className="block"
            role="img"
            aria-label="Revenue bar chart"
          >
            <defs>
              {/* highlighted bar: yellow */}
              <linearGradient id={`${uid}-hi`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
              {/* other bars: soft grey */}
              <linearGradient id={`${uid}-lo`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ececec" />
                <stop offset="100%" stopColor="#f6f6f6" />
              </linearGradient>
            </defs>

            {/* Grid lines and y-axis tick labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={width - M.right}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  strokeWidth="1"
                  strokeDasharray={t === 0 ? "0" : "3 4"}
                  stroke={t === 0 ? "#d4d4d4" : "#ececec"}
                />
                <text
                  x={M.left - 8}
                  y={yOf(t) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#8a8a8a"
                >
                  {formatCompactINR(t)}
                </text>
              </g>
            ))}

            {/* Axis titles */}
            <text
              x={12}
              y={M.top + innerH / 2}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              transform={`rotate(-90 12 ${M.top + innerH / 2})`}
              fill="#737373"
            >
              Revenue (₹)
            </text>
            {xAxisLabel && (
              <text
                x={M.left + innerW / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#737373"
              >
                {xAxisLabel}
              </text>
            )}

            {/* Bars (re-keyed per period so the grow animation replays) */}
            <g key={periodKey}>
              {timeline.map((p, i) => {
                const cx = M.left + band * i + band / 2;
                const h = (p.revenue / top) * innerH;
                const isActive = activeIdx === i;
                return (
                  <g key={p.label}>
                    {active === i && (
                      <rect
                        x={M.left + band * i}
                        y={M.top}
                        width={band}
                        height={innerH}
                        rx="8"
                        fill="#fafafa"
                      />
                    )}
                    <path
                      d={barPath(cx - barW / 2, yOf(p.revenue), barW, h, Math.min(8, barW / 2))}
                      fill={`url(#${uid}-${isActive ? "hi" : "lo"})`}
                      className="rev-bar"
                      style={{ "--d": `${Math.min(i * 25, 500)}ms` }}
                    />
                    {i % labelEvery === 0 && (
                      <text
                        x={cx}
                        y={HEIGHT - 26}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isActive ? 700 : 500}
                        fill={isActive ? "#111111" : "#8a8a8a"}
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Black value pill above the default (peak) bar, hidden while hovering */}
            {peak && active === null && (
              <g pointerEvents="none">
                <rect
                  x={Math.min(Math.max(peakCx - 24, 2), width - 50)}
                  y={Math.max(yOf(peak.revenue) - 26, 2)}
                  width="48"
                  height="18"
                  rx="9"
                  fill="#111111"
                />
                <text
                  x={Math.min(Math.max(peakCx, 26), width - 26)}
                  y={Math.max(yOf(peak.revenue) - 26, 2) + 12.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#D4AF37"
                >
                  {formatCompactINR(peak.revenue)}
                </text>
              </g>
            )}

            {/* Hover / keyboard-focus targets for every column */}
            {timeline.map((p, i) => (
              <rect
                key={`hit-${p.label}`}
                x={M.left + band * i}
                y={0}
                width={band}
                height={HEIGHT}
                fill="transparent"
                tabIndex={0}
                aria-label={`${p.fullLabel ?? p.label}: ${formatINR(p.revenue)}`}
                style={{ outline: "none", cursor: "default" }}
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}
          </svg>

          {/* Tooltip: "Revenue: ₹2,45,000" */}
          {hovered && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-black px-3 py-2 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
              style={{
                left: Math.min(Math.max(hoveredCx, 80), width - 80),
                top: Math.max(yOf(hovered.revenue) - 8, 74),
              }}
            >
              <p className="text-[11px] text-white/60">{hovered.fullLabel ?? hovered.label}</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                Revenue: <span className="text-yellow-400">{formatINR(hovered.revenue)}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-white/60">
                {formatShare(hovered.revenue, totalRevenue)} of period total
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}