import { useEffect, useId, useRef, useState } from "react";
import { Users } from "lucide-react";

// Sample data: replace with your real leads-per-day numbers
const DEFAULT_DATA = [
  { label: "Mon", active: 22, inactive: 8 },
  { label: "Tue", active: 34, inactive: 5 },
  { label: "Wed", active: 28, inactive: 9 },
  { label: "Thu", active: 18, inactive: 6 },
  { label: "Fri", active: 26, inactive: 8 },
];

// Yellow accent + black, with a light grey tint of black
const COLORS = {
  total: "#D4AF37",
  active: "#111111",
  inactive: "#c4c4c4",
};

const easeOut = (p) => 1 - Math.pow(1 - p, 3);

/* Counts a number up (or between values when it changes) */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const startVal = from.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const v = Math.round(startVal + (target - startVal) * easeOut(p));
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value }) {
  return <>{useCountUp(value, 800)}</>;
}

/*
  Tweens the chart values. On first load the lines rise from the baseline to
  their values; whenever new data arrives (refresh, filter, live update) the
  lines glide from the old values to the new ones instead of jumping.
*/
function useTweenedRows(rows, duration = 900) {
  const key = rows.map((r) => `${r.active},${r.inactive}`).join("|");
  const [vals, setVals] = useState(() => rows.map(() => ({ active: 0, inactive: 0 })));
  const ref = useRef(vals);

  useEffect(() => {
    const from = ref.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const e = easeOut(p);
      const next = rows.map((r, i) => ({
        active: (from[i]?.active ?? 0) + (r.active - (from[i]?.active ?? 0)) * e,
        inactive: (from[i]?.inactive ?? 0) + (r.inactive - (from[i]?.inactive ?? 0)) * e,
      }));
      ref.current = next;
      setVals(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration]);

  return vals;
}

/* Measures an element so the chart can draw at its real pixel size */
function useSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

/* Smooth curve through points without overshooting (monotone cubic) */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    m[i] = (pts[i + 1].y - pts[i].y) / dx[i];
  }
  const t = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
    } else {
      const a = t[i] / m[i];
      const b = t[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        t[i] = tau * a * m[i];
        t[i + 1] = tau * b * m[i];
      }
    }
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${pts[i].x + h} ${pts[i].y + t[i] * h}, ${pts[i + 1].x - h} ${pts[i + 1].y - t[i + 1] * h
      }, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function TotalLeadsCard({
  active = 128,
  inactive = 36,
  data = DEFAULT_DATA,
  respectReducedMotion = false,
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `leads-grad-${uid}`;

  const noMotion =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const total = active + inactive;
  const count = useCountUp(total, noMotion ? 1 : 900);

  const [hover, setHover] = useState(null);
  const [chartRef, { w: W, h: H }] = useSize();

  // real values (tooltip, axis scale) and tweened values (what is drawn)
  const rows = data.map((d) => ({ ...d, total: d.active + d.inactive }));
  const tween = useTweenedRows(data, noMotion ? 0 : 900);
  const drawn = rows.map((r, i) => {
    const a = tween[i]?.active ?? 0;
    const n = tween[i]?.inactive ?? 0;
    return { active: a, inactive: n, total: a + n };
  });

  const max = Math.max(...rows.map((r) => r.total), 1);
  const top = Math.max(Math.ceil((max * 1.1) / 4) * 4, 8);
  const ticks = [0, 1, 2, 3, 4].map((i) => (top / 4) * i);

  const PLOT = { left: 34, right: W - 14, top: 10, bottom: H - 24 };
  const plotH = Math.max(PLOT.bottom - PLOT.top, 1);
  const plotW = Math.max(PLOT.right - PLOT.left, 1);
  const yOf = (v) => PLOT.bottom - (v / top) * plotH;
  const xOf = (i) =>
    rows.length === 1 ? PLOT.left + plotW / 2 : PLOT.left + (plotW * i) / (rows.length - 1);

  const pts = (key) => drawn.map((r, i) => ({ x: xOf(i), y: yOf(r[key]) }));
  const totalPts = pts("total");
  const totalLine = smoothPath(totalPts);
  const areaPath = totalLine
    ? `${totalLine} L ${xOf(rows.length - 1)} ${PLOT.bottom} L ${xOf(0)} ${PLOT.bottom} Z`
    : "";

  const series = [
    { key: "inactive", label: "Inactive", color: COLORS.inactive, sum: inactive },
    { key: "active", label: "Active", color: COLORS.active, sum: active },
    { key: "total", label: "Total", color: COLORS.total, sum: total },
  ];

  const defaultIdx = Math.floor(rows.length / 2);
  const idx = hover !== null ? hover : defaultIdx;
  const sel = rows[idx];
  const selDrawn = drawn[idx];

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = (x - PLOT.left) / plotW;
    const i = Math.round(ratio * (rows.length - 1));
    setHover(Math.min(Math.max(i, 0), rows.length - 1));
  };

  // tooltip placement: right of the point, flips left near the edge
  const TIP_W = 124;
  const TIP_H = 74;
  const selX = xOf(idx);
  const tipLeft = selX + 14 + TIP_W > W ? selX - 14 - TIP_W : selX + 14;
  const tipTop = Math.min(
    Math.max(yOf(selDrawn.total) - TIP_H / 2, PLOT.top),
    Math.max(PLOT.bottom - TIP_H, PLOT.top)
  );

  return (
    <div className="group flex h-full w-full flex-1 flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg">
      {/* Title + number + legend */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
            <Users size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-black">Total Leads</p>
            <p className="text-xs text-neutral-500">Active vs inactive per day</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            {[...series].reverse().map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
                <b className="font-semibold tabular-nums text-black">
                  <AnimatedNumber value={s.sum} />
                </b>
              </span>
            ))}
          </div>
          <p className="text-3xl font-bold tabular-nums text-black">{count}</p>
        </div>
      </div>

      {/* Line chart: fills the leftover height */}
      <div
        ref={chartRef}
        className="relative mt-3 min-h-0 flex-1"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      >
        {W > 0 && H > 0 && (
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 block overflow-visible"
            role="img"
            aria-label="Total, active and inactive leads per day"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.total} stopOpacity="0.28" />
                <stop offset="100%" stopColor={COLORS.total} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines + y labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PLOT.left}
                  x2={PLOT.right}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  stroke="#efefef"
                  strokeWidth="1"
                />
                <text x={PLOT.left - 10} y={yOf(t) + 3.5} textAnchor="end" fontSize="10" fill="#8a8a8a">
                  {t}
                </text>
              </g>
            ))}

            {/* X labels */}
            {rows.map((r, i) => (
              <text
                key={r.label}
                x={xOf(i)}
                y={H - 6}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight={idx === i ? 600 : 500}
                fill={idx === i ? "#111111" : "#8a8a8a"}
                style={{ transition: "fill 150ms" }}
              >
                {r.label}
              </text>
            ))}

            {/* Area under total */}
            <path d={areaPath} fill={`url(#${gradId})`} />

            {/* Lines */}
            {series.map((s) => (
              <path
                key={s.key}
                d={smoothPath(pts(s.key))}
                fill="none"
                stroke={s.color}
                strokeWidth={s.key === "total" ? 2.5 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Small markers on every day of the total line */}
            {totalPts.map((p, i) => (
              <circle
                key={rows[i].label}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#ffffff"
                stroke={COLORS.total}
                strokeWidth="1.5"
              />
            ))}

            {/* Crosshair + points slide smoothly from day to day */}
            <g
              style={{
                transform: `translateX(${selX}px)`,
                transition: noMotion ? "none" : "transform 160ms ease-out",
              }}
            >
              <line
                x1="0"
                x2="0"
                y1={PLOT.top}
                y2={PLOT.bottom}
                stroke="#c9c9c9"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {series.map((s) => (
                <circle
                  key={s.key}
                  cx="0"
                  cy={yOf(selDrawn[s.key])}
                  r="4"
                  fill="#ffffff"
                  stroke={s.color}
                  strokeWidth="2"
                />
              ))}
            </g>
          </svg>
        )}

        {/* Tooltip (white card, glides between days) */}
        {W > 0 && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-white px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
            style={{
              left: tipLeft,
              top: tipTop,
              width: TIP_W,
              transition: noMotion ? "none" : "left 160ms ease-out",
            }}
          >
            <p className="mb-1 text-[11px] font-semibold text-black">{sel.label}</p>
            {[
              { label: "Total", value: sel.total, color: COLORS.total },
              { label: "Active", value: sel.active, color: COLORS.active },
              { label: "Inactive", value: sel.inactive, color: COLORS.inactive },
            ].map((r) => (
              <p
                key={r.label}
                className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-700"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                {r.label} : <b className="tabular-nums text-black">{r.value}</b>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TotalLeadsCard;