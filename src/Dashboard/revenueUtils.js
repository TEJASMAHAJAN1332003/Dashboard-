import { useEffect, useRef, useState } from "react";

/* ---------------- INR formatting ---------------- */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/* 1245000 -> ₹12,45,000 */
export const formatINR = (n) => inr.format(Math.round(Number(n) || 0));

const trim = (n) => n.toFixed(1).replace(/\.0$/, "");

/* Short form for chart axes: ₹15K, ₹1.2L, ₹1.5Cr */
export function formatCompactINR(v) {
  if (!v) return "₹0";
  if (v >= 1e7) return `₹${trim(v / 1e7)}Cr`;
  if (v >= 1e5) return `₹${trim(v / 1e5)}L`;
  if (v >= 1e3) return `₹${trim(v / 1e3)}K`;
  return `₹${Math.round(v)}`;
}

/* ---------------- Percentages ---------------- */

/**
 * growthPercentage = ((currentRevenue - previousRevenue) / previousRevenue) * 100
 * Returns null when there is no valid previous period to compare against.
 */
export function calculateGrowth(current, previous) {
  const c = Number(current);
  const p = Number(previous);
  if (!Number.isFinite(c) || !Number.isFinite(p) || p <= 0) return null;
  return Math.round(((c - p) / p) * 1000) / 10;
}

/* 18.5 -> "+18.5%", -8.2 -> "-8.2%" */
export function formatGrowth(pct) {
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

/* Share of a total, one decimal: 850000 of 1245000 -> "68.3%" */
export function formatShare(value, total) {
  return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
}

/* ---------------- Chart helpers ---------------- */

/* Clean y-axis: 4 equal steps with round numbers */
export function niceScale(max, intervals = 4) {
  if (max <= 0) return { top: intervals, step: 1 };
  const raw = max / intervals;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const m = [1, 1.5, 2, 2.5, 3, 4, 5, 10].find((x) => x >= norm) ?? 10;
  const step = m * mag;
  return { step, top: step * intervals };
}

/* Bar with rounded top corners and a flat bottom on the baseline */
export function barPath(x, y, w, h, r = 4) {
  if (h < 0.5) return "";
  const rr = Math.min(r, w / 2, h);
  return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
}

/* Generates smooth cubic bezier curve path and area path for sparklines */
export function generateSparkline(values = [], width = 100, height = 36, padding = 4) {
  if (!values || values.length === 0) {
    return { linePath: "", areaPath: "", points: [] };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = height - padding * 2;
  const w = width;

  const points = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * w : w / 2;
    const y = height - padding - ((v - min) / range) * h;
    return { x, y, value: v };
  });

  if (points.length === 1) {
    const p = points[0];
    return {
      linePath: `M 0 ${p.y} L ${w} ${p.y}`,
      areaPath: `M 0 ${p.y} L ${w} ${p.y} L ${w} ${height} L 0 ${height} Z`,
      points,
    };
  }

  // Smooth bezier curve
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 2;
    const cpy1 = p0.y;
    const cpx2 = p0.x + (p1.x - p0.x) / 2;
    const cpy2 = p1.y;
    linePath += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
  }

  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;

  return { linePath, areaPath, points };
}

/* ---------------- Hooks ---------------- */

export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const startVal = from.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = startVal + (target - startVal) * eased;
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* Tracks the pixel width of an element so the SVG chart can be fully responsive */
export function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.clientWidth));
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}