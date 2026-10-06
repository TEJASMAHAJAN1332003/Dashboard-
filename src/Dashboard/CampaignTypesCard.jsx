import { useEffect, useMemo, useRef, useState } from "react";
import CardEditFilter from "./Cardeditfilter";

/**
 * CampaignTypesCard
 * Concentric radial rings with the total in the centre.
 *  - Largest status = outer ring, ring length is relative to the largest status
 *  - Hover / focus a ring (or its legend row) to see that status in the centre
 *  - Click to lock it and get onSelect(status | null) for table filtering
 *  - Staggered draw-in, count-up number, reduced-motion safe
 *  - Edit button opens the shared CardEditFilter popup; onEditApply(filter) receives the result
 */

const GOLD = "#D4AF37";
const INK = "#111111";
const MUTED = "#6b6b6b";
// outer -> inner shades; the active ring turns gold
const SHADES = [INK, "#3a3a3a", "#6b6b6b", "#a0a0a0"];

const DEFAULT_DATA = [
    { label: "New", value: 901 },
    { label: "Callback", value: 5181 },
    { label: "Pending", value: 1682 },
    { label: "Overdue", value: 1110 },
];

const SIZE = 200;
const C0 = SIZE / 2;
const R_OUTER = 88;
const RING_STEP = 16;
const STROKE = 12;
const MAX_SWEEP = 0.85; // largest ring covers 85% of the circle, like a progress ring

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const fn = (e) => setReduced(e.matches);
        mq.addEventListener("change", fn);
        return () => mq.removeEventListener("change", fn);
    }, []);
    return reduced;
}

function useCountUp(target, duration = 600, disabled = false) {
    const [val, setVal] = useState(disabled ? target : 0);
    const fromRef = useRef(disabled ? target : 0);
    useEffect(() => {
        if (disabled) {
            setVal(target);
            fromRef.current = target;
            return;
        }
        const from = fromRef.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const v = from + (target - from) * (1 - Math.pow(1 - t, 3));
            fromRef.current = v;
            setVal(v);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, disabled]);
    return Math.round(val);
}

function CampaignTypesCard({
    title = "Lead Status",
    subtitle = "Current distribution",
    data = DEFAULT_DATA,
    onSelect,
    onEditApply,
}) {
    const reduced = useReducedMotion();
    const [mounted, setMounted] = useState(false);
    const [hover, setHover] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const total = useMemo(() => data.reduce((s, d) => s + d.value, 0) || 1, [data]);

    const rings = useMemo(() => {
        const sorted = [...data].sort((a, b) => b.value - a.value);
        const max = sorted[0]?.value || 1;
        return sorted.map((d, i) => {
            const r = R_OUTER - i * RING_STEP;
            const circ = 2 * Math.PI * r;
            return {
                ...d,
                r,
                circ,
                pct: (d.value / total) * 100,
                arcLen: (d.value / max) * MAX_SWEEP * circ,
                base: SHADES[i % SHADES.length],
            };
        });
    }, [data, total]);

    const focusLabel = hover ?? selected;
    const focus = rings.find((r) => r.label === focusLabel) || null;
    const centerValue = useCountUp(focus ? focus.value : total, 600, reduced);

    const toggle = (label) => {
        const next = selected === label ? null : label;
        setSelected(next);
        onSelect?.(next);
    };

    return (
        <div className="flex h-full w-full flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-black">{title}</p>
                    <p className="text-xs text-neutral-500">{subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    {selected && (
                        <button
                            type="button"
                            onClick={() => toggle(selected)}
                            className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-600 transition hover:border-black hover:text-black"
                        >
                            Clear ✕
                        </button>
                    )}
                    {/* Shared Edit button + filter popup */}
                    <CardEditFilter onApply={onEditApply} />
                </div>
            </div>

            <div
                className="flex min-h-[170px] flex-1 items-center justify-center py-2"
                onPointerLeave={() => setHover(null)}
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="block aspect-square h-full max-h-[240px] w-auto max-w-full"
                    role="img"
                    aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
                >
                    <g transform={`rotate(-90 ${C0} ${C0})`}>
                        {rings.map((ring, i) => {
                            const isFocus = focusLabel === ring.label;
                            const dim = focusLabel !== null && !isFocus;
                            return (
                                <g key={ring.label} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 200ms" }}>
                                    {/* full light track */}
                                    <circle
                                        cx={C0}
                                        cy={C0}
                                        r={ring.r}
                                        fill="none"
                                        stroke="#f0f0f0"
                                        strokeWidth={STROKE}
                                        style={{ cursor: "pointer" }}
                                        onPointerEnter={() => setHover(ring.label)}
                                        onClick={() => toggle(ring.label)}
                                    />
                                    {/* value arc */}
                                    <circle
                                        cx={C0}
                                        cy={C0}
                                        r={ring.r}
                                        fill="none"
                                        stroke={isFocus ? GOLD : ring.base}
                                        strokeWidth={isFocus ? STROKE + 2 : STROKE}
                                        strokeLinecap="round"
                                        strokeDasharray={`${mounted ? ring.arcLen : 0} ${ring.circ}`}
                                        style={{
                                            cursor: "pointer",
                                            transition: reduced
                                                ? "none"
                                                : `stroke-dasharray 1000ms cubic-bezier(.2,.8,.2,1) ${i * 130}ms, stroke 200ms, stroke-width 200ms`,
                                        }}
                                        onPointerEnter={() => setHover(ring.label)}
                                        onClick={() => toggle(ring.label)}
                                    />
                                </g>
                            );
                        })}
                    </g>

                    <g pointerEvents="none" textAnchor="middle">
                        <text x={C0} y={C0 - 4} fontSize="9" fontWeight="500" fill={MUTED}>
                            {focus ? focus.label : "Total"}
                        </text>
                        <text x={C0} y={C0 + 14} fontSize="19" fontWeight="800" fill={INK}>
                            {centerValue.toLocaleString()}
                        </text>
                        {focus && (
                            <text x={C0} y={C0 + 25} fontSize="8" fontWeight="600" fill={MUTED}>
                                {focus.pct.toFixed(1)}%
                            </text>
                        )}
                    </g>
                </svg>
            </div>

            {/* compact legend, doubles as keyboard-accessible filter */}
            <div className="grid shrink-0 grid-cols-2 gap-1 border-t border-neutral-100 pt-2">
                {rings.map((ring) => {
                    const isFocus = focusLabel === ring.label;
                    return (
                        <button
                            key={ring.label}
                            type="button"
                            aria-pressed={selected === ring.label}
                            onClick={() => toggle(ring.label)}
                            onPointerEnter={() => setHover(ring.label)}
                            onPointerLeave={() => setHover(null)}
                            onFocus={() => setHover(ring.label)}
                            onBlur={() => setHover(null)}
                            className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1 outline-none transition focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${isFocus ? "border-[#D4AF37]/60 bg-neutral-50" : "border-transparent hover:bg-neutral-50"
                                }`}
                        >
                            <span className="flex min-w-0 items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full ring-1 ring-black/10"
                                    style={{ backgroundColor: isFocus ? GOLD : ring.base }}
                                />
                                <span className="truncate text-xs text-neutral-600">{ring.label}</span>
                            </span>
                            <span className="text-xs font-semibold tabular-nums text-black">
                                {ring.value.toLocaleString()}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default CampaignTypesCard;