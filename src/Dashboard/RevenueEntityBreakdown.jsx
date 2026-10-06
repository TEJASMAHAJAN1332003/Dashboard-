import { useMemo, useState } from "react";
import { PieChart as PieIcon } from "lucide-react";
import { ENTITY_COLORS } from "./revenueData";
import { formatINR, formatShare } from "./revenueUtils";

const CSS = `
@keyframes rev-pop {
  from { opacity: 0; transform: scale(0.88) rotate(-8deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
.rev-pop { animation: rev-pop 550ms cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) { .rev-pop { animation: none; } }
`;

const FALLBACK_COLOR = "#a3a3a3";
const CX = 100;
const CY = 100;
const R = 88;

/* ------------------------------ Pie chart ------------------------------ */

function EntityPie({ slices, activeName, onHover }) {
  const sum = slices.reduce((s, x) => s + x.revenue, 0);

  const shapes = useMemo(() => {
    if (sum <= 0) return [];
    let angle = -Math.PI / 2;
    return slices.map((s) => {
      const sweep = (s.revenue / sum) * Math.PI * 2;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return { ...s, start, end, mid: (start + end) / 2, sweep };
    });
  }, [slices, sum]);

  const point = (a) => [CX + R * Math.cos(a), CY + R * Math.sin(a)];

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Revenue distribution by entity">
      {shapes.map((s) => {
        const isActive = activeName === s.name;
        const dimmed = activeName !== null && !isActive;
        const push = isActive ? 6 : 0;
        const style = {
          transform: `translate(${Math.cos(s.mid) * push}px, ${Math.sin(s.mid) * push}px)`,
          transition: "transform 150ms, opacity 150ms",
          opacity: dimmed ? 0.4 : 1,
          cursor: "default",
        };
        const common = {
          fill: s.color,
          stroke: "#ffffff",
          strokeWidth: 2,
          style,
          onPointerEnter: () => onHover(s.name),
          onPointerLeave: () => onHover(null),
        };

        // A single slice covering 100% is drawn as a circle
        if (s.sweep >= Math.PI * 2 - 0.0001) {
          return <circle key={s.name} cx={CX} cy={CY} r={R} {...common} />;
        }

        const [x1, y1] = point(s.start);
        const [x2, y2] = point(s.end);
        const large = s.sweep > Math.PI ? 1 : 0;
        return (
          <path
            key={s.name}
            d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`}
            {...common}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------ Main block ----------------------------- */

/**
 * Props
 *  - entities:     [{ name, revenue }]
 *  - totalRevenue: number   (percentages are calculated against this)
 *  - periodKey:    string   (replays the pie animation when it changes)
 *  - loading:      boolean
 *  - showPieChart: boolean  (set false to keep only the table)
 *  - colors:       { [entityName]: "#hex" }
 */
export default function RevenueEntityBreakdown({
  entities = [],
  totalRevenue = 0,
  periodKey,
  loading = false,
  showPieChart = true,
  colors = ENTITY_COLORS,
}) {
  const [prevPeriodKey, setPrevPeriodKey] = useState(periodKey);
  const [activeName, setActiveName] = useState(null);

  if (prevPeriodKey !== periodKey) {
    setPrevPeriodKey(periodKey);
    setActiveName(null);
  }

  const entitySum = useMemo(
    () => entities.reduce((s, e) => s + (e.revenue || 0), 0),
    [entities]
  );
  const base = totalRevenue > 0 ? totalRevenue : entitySum;

  const rows = useMemo(
    () =>
      entities.map((e) => ({
        ...e,
        color: colors[e.name] ?? FALLBACK_COLOR,
      })),
    [entities, colors]
  );
  const slices = rows.filter((r) => r.revenue > 0);
  const activeRow = rows.find((r) => r.name === activeName) ?? null;

  const isEmpty = !loading && (rows.length === 0 || entitySum === 0);

  return (
    <div>
      <style>{CSS}</style>

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-black">Revenue Sources</h3>
        <p className="text-xs text-neutral-500">Contribution by revenue entity</p>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]" aria-hidden="true">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
          <div className="mx-auto h-44 w-44 animate-pulse rounded-full bg-neutral-100" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-black">
            <PieIcon size={18} />
          </span>
          <p className="text-xs text-neutral-500">
            No revenue breakdown available for this period.
          </p>
        </div>
      ) : (
        <div
          className={`mt-4 grid items-center gap-6 ${showPieChart ? "md:grid-cols-[minmax(0,1fr)_240px]" : ""
            }`}
        >
          {/* Entity | Revenue | Percentage */}
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_3.75rem] gap-x-3 border-b border-neutral-200 px-2 pb-2 text-[11px] font-medium text-neutral-400">
              <span>Entity</span>
              <span className="text-right">Revenue</span>
              <span className="text-right">Percentage</span>
            </div>

            <ul className="mt-1">
              {rows.map((r) => (
                <li
                  key={r.name}
                  onPointerEnter={() => setActiveName(r.name)}
                  onPointerLeave={() => setActiveName(null)}
                  className={`cursor-default rounded-lg px-2 py-2.5 transition ${activeName === r.name ? "bg-white shadow-sm" : ""
                    }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_3.75rem] items-center gap-x-3 text-[13px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="truncate font-medium text-neutral-800" title={r.name}>
                        {r.name}
                      </span>
                    </span>
                    <span className="text-right font-semibold tabular-nums text-black">
                      {formatINR(r.revenue)}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-neutral-500">
                      {formatShare(r.revenue, base)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${base > 0 ? Math.min((r.revenue / base) * 100, 100) : 0}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pie chart */}
          {showPieChart && slices.length > 0 && (
            <div className="flex flex-col items-center">
              <div key={periodKey} className="rev-pop h-44 w-44">
                <EntityPie
                  slices={slices}
                  activeName={activeName}
                  onHover={setActiveName}
                />
              </div>

              <div className="mt-3 min-h-[44px] text-center">
                {activeRow ? (
                  <>
                    <p className="text-xs text-neutral-500">{activeRow.name}</p>
                    <p className="text-sm font-semibold tabular-nums text-black">
                      {formatINR(activeRow.revenue)}
                      <span className="ml-1.5 text-neutral-500">
                        · {formatShare(activeRow.revenue, base)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-neutral-500">Total Revenue</p>
                    <p className="text-sm font-semibold tabular-nums text-black">
                      {formatINR(base)}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}