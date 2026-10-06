import { useEffect, useRef, useState } from "react";
import { Pencil, Check, Search } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   CardEditFilter — one reusable "Edit" button + filter popup.

   Drop it into the header of ANY dashboard card:

     <CardEditFilter onApply={(filter) => setFilter(filter)} />

   Props (all optional):
     onApply(filter)      called with the applied filter object (see DEFAULT_FILTER)
     onReset()            called when "Reset" is clicked inside the popup
     value                filter object to start from (defaults to DEFAULT_FILTER)
     filterTypes          which filter types to show, e.g. ["Date Range", "Agent"]
     lists                override the Project / Property / Source / Agent options
                          { Project: [...], Property: [...], Source: [...], Agent: [...] }
     label                button text (default "Edit")
     iconOnly             show only the pencil icon
     align                "right" (default) | "left" — which edge the popup lines up with
     buttonClassName      replace the default button styles
════════════════════════════════════════════════════════════ */

/* ── Options ── */
export const FILTER_TYPES = ["Date Range", "Project", "Property", "Source", "Agent"];
export const DATE_TYPES = ["All", "Created", "Scheduled", "Modified"];
export const RANGE_OPTIONS = [
    "Till Date",
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Current Month",
    "Last Quarter",
    "Custom",
];

export const DEFAULT_LISTS = {
    Project: ["vfp cygnus", "27 Grand", "32 Pinewood Drive", "5 Hinjewadi", "5 Hinjewadi,5 Hinjewadi", "Aamor", "Ace abode"],
    Property: ["Dolphin Palms", "108 rohit astera", "24k", "57 elevate", "57 Elevate", "66 Avenue", "Abhinav Pebbles"],
    Source: ["99 Acres", "Bayut", "Boards and Hoardings", "Brochures Distribution", "Call Logs", "Channel Partner", "Common Floor"],
    Agent: ["You", "Amit Sharma", "Ankush Kanojiya", "Arhum Sayyed", "Ayush Kalia", "Blisss 2 East", "Dhairya Kakkad"],
};

const LIST_TITLES = {
    Project: "Select Projects",
    Property: "Select Properties",
    Source: "Select Sources",
    Agent: "Select Agents",
};

export const DEFAULT_FILTER = {
    filterType: "Date Range",
    dateType: "Created",
    range: "Last 7 Days",
    customFrom: null,
    customTo: null,
    saveAsDefault: false,
    Project: [],
    Property: [],
    Source: [],
    Agent: [],
    withTeam: false,
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const fmtDate = (d) =>
    d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
const sameDay = (a, b) => !!a && !!b && a.toDateString() === b.toDateString();

/* ── Small shared pieces ── */

/* Closes a popup on outside click or Escape */
function useDismiss(ref, open, close) {
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) close();
        };
        const onKey = (e) => e.key === "Escape" && close();
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [ref, open, close]);
}

function RadioRow({ label, selected, onSelect }) {
    return (
        <div onClick={onSelect} className="group flex cursor-pointer items-center gap-2">
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white transition-colors ${selected ? "border-[#D4AF37]" : "border-neutral-400 group-hover:border-neutral-600"
                    }`}
            >
                {selected && <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />}
            </span>
            <span
                className={`text-[13px] transition-colors ${selected ? "font-medium text-neutral-800" : "text-neutral-600 group-hover:text-neutral-900"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

function CheckBox({ checked }) {
    return (
        <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${checked
                ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]"
                : "border-neutral-300 bg-white group-hover:border-neutral-400"
                }`}
        >
            {checked && <Check size={11} strokeWidth={3} />}
        </span>
    );
}

/* Range calendar: first click = From, second click = To */
function RangeCalendar({ from, to, onChange }) {
    const [view, setView] = useState(() => {
        const base = from || new Date();
        return new Date(base.getFullYear(), base.getMonth(), 1);
    });

    const year = view.getFullYear();
    const month = view.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, i - offset + 1));

    const pick = (d) => {
        if (!from || to || d < from) onChange(d, null); // start a new range
        else onChange(from, d); // complete the range
    };

    const shiftMonth = (n) => setView(new Date(year, month + n, 1));

    return (
        <div className="absolute right-0 top-full z-20 mt-1 w-[280px] rounded-xl border border-neutral-800 bg-[#111111] p-3 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
            <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={() => shiftMonth(-1)} className="px-2 text-lg hover:text-[#D4AF37]">
                    ‹
                </button>
                <span className="text-[13px] font-semibold">
                    {MONTHS[month]} {year}
                </span>
                <button type="button" onClick={() => shiftMonth(1)} className="px-2 text-lg hover:text-[#D4AF37]">
                    ›
                </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
                {WEEKDAYS.map((w) => (
                    <span key={w} className="py-1">{w}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 text-center text-[12px]">
                {cells.map((d) => {
                    const outside = d.getMonth() !== month;
                    const isEdge = sameDay(d, from) || sameDay(d, to);
                    const inRange = from && to && d > from && d < to;
                    return (
                        <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => pick(d)}
                            className={`m-px h-8 rounded-lg transition ${isEdge
                                ? "bg-[#D4AF37] font-bold text-[#0A0A0A]"
                                : inRange
                                    ? "bg-[#D4AF37]/25"
                                    : "hover:bg-white/10"
                                } ${outside && !isEdge ? "text-neutral-500" : ""}`}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[12px]">
                <div className="flex gap-2">
                    <span className="w-10 text-neutral-400">From:</span>
                    <span>{fmtDate(from)}</span>
                </div>
                <div className="flex gap-2">
                    <span className="w-10 text-neutral-400">To:</span>
                    <span>{fmtDate(to)}</span>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════ */
export default function CardEditFilter({
    onApply,
    onReset,
    value,
    filterTypes = FILTER_TYPES,
    lists,
    label = "Edit",
    iconOnly = false,
    align = "right",
    buttonClassName,
}) {
    const base = { ...DEFAULT_FILTER, ...(value || {}), filterType: value?.filterType || filterTypes[0] };

    const [open, setOpen] = useState(false);
    const [applied, setApplied] = useState(base); // last applied filter
    const [draft, setDraft] = useState(base); // what's being edited in the popup
    const [calOpen, setCalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapRef = useRef(null);

    const close = () => {
        setOpen(false);
        setCalOpen(false);
    };
    useDismiss(wrapRef, open, close);

    const options = { ...DEFAULT_LISTS, ...(lists || {}) };
    const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

    const toggleOpen = () => {
        if (!open) {
            setDraft(applied); // always start from the last applied filter
            setSearch("");
            setCalOpen(false);
        }
        setOpen((v) => !v);
    };

    const handleReset = () => {
        setDraft({ ...DEFAULT_FILTER, filterType: filterTypes[0] });
        setSearch("");
        setCalOpen(false);
        onReset?.();
    };

    const handleApply = () => {
        setApplied(draft);
        onApply?.(draft);
        close();
    };

    /* checklist (Project / Property / Source / Agent) */
    const isListType = ["Project", "Property", "Source", "Agent"].includes(draft.filterType);
    const items = isListType ? options[draft.filterType] || [] : [];
    const q = search.trim().toLowerCase();
    const filtered = q ? items.filter((i) => i.toLowerCase().includes(q)) : items;
    const checked = isListType ? draft[draft.filterType] : [];
    const toggleItem = (item) =>
        set({
            [draft.filterType]: checked.includes(item)
                ? checked.filter((i) => i !== item)
                : [...checked, item],
        });

    const defaultBtn =
        "flex h-7 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] font-medium text-neutral-700 transition hover:border-[#D4AF37] hover:bg-neutral-100 hover:text-black active:scale-95";

    return (
        <div className="relative" ref={wrapRef}>
            {/* ── Trigger button ── */}
            <button
                type="button"
                title={label}
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={toggleOpen}
                className={`${buttonClassName || defaultBtn} ${open ? "!border-[#D4AF37]" : ""}`}
            >
                <Pencil size={12} />
                {!iconOnly && <span>{label}</span>}
            </button>

            {/* ── Popup ── */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Edit filter"
                    className={`absolute top-full z-50 mt-2 w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] ring-1 ring-black/5 select-none ${align === "left" ? "left-0" : "right-0"
                        }`}
                >
                    <div className="flex p-4">
                        {/* Column 1: Filter Type */}
                        <div className="shrink-0 border-r border-neutral-100 pr-3">
                            <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">Filter Type</h4>
                            <div className="space-y-3">
                                {filterTypes.map((item) => (
                                    <RadioRow
                                        key={item}
                                        label={item}
                                        selected={draft.filterType === item}
                                        onSelect={() => {
                                            set({ filterType: item });
                                            setSearch("");
                                            setCalOpen(false);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Date Range panel */}
                        {draft.filterType === "Date Range" && (
                            <>
                                <div className="border-r border-neutral-100 px-3">
                                    <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">Date Type</h4>
                                    <div className="space-y-3">
                                        {DATE_TYPES.map((item) => (
                                            <RadioRow
                                                key={item}
                                                label={item}
                                                selected={draft.dateType === item}
                                                onSelect={() => set({ dateType: item })}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 pl-3">
                                    <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">Range</h4>
                                    <div className="space-y-3">
                                        {RANGE_OPTIONS.map((item) => (
                                            <RadioRow
                                                key={item}
                                                label={item}
                                                selected={draft.range === item}
                                                onSelect={() => {
                                                    set({ range: item });
                                                    setCalOpen(item === "Custom");
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="relative mt-3">
                                        <input
                                            type="text"
                                            readOnly
                                            value={
                                                draft.customFrom
                                                    ? `${fmtDate(draft.customFrom)}${draft.customTo ? ` – ${fmtDate(draft.customTo)}` : ""}`
                                                    : ""
                                            }
                                            onClick={() => {
                                                set({ range: "Custom" });
                                                setCalOpen(true);
                                            }}
                                            placeholder="Select date"
                                            className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] text-neutral-700 placeholder:text-neutral-300 transition-colors focus:border-[#D4AF37] focus:outline-none"
                                        />
                                        {calOpen && draft.range === "Custom" && (
                                            <RangeCalendar
                                                from={draft.customFrom}
                                                to={draft.customTo}
                                                onChange={(f, t) => set({ customFrom: f, customTo: t })}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Checklist panel: Project / Property / Source / Agent */}
                        {isListType && (
                            <div className="min-w-0 flex-1 border-l border-neutral-100 pl-3">
                                <div className="flex items-center justify-between pb-2.5">
                                    <h4 className="text-[13px] font-semibold text-neutral-700">
                                        {LIST_TITLES[draft.filterType]}
                                    </h4>
                                    {draft.filterType === "Agent" && (
                                        <button
                                            type="button"
                                            onClick={() => set({ withTeam: !draft.withTeam })}
                                            className="group flex cursor-pointer items-center gap-1.5 select-none focus:outline-none"
                                        >
                                            <CheckBox checked={draft.withTeam} />
                                            <span className="text-[12px] font-medium text-neutral-600">With Team</span>
                                        </button>
                                    )}
                                </div>

                                <div className="relative mb-2.5">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="type to search"
                                        className="w-full rounded-full border border-neutral-200 bg-[#FAFAFA] py-1 pl-3.5 pr-8 text-[13px] text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-[#D4AF37] focus:bg-white focus:outline-none"
                                    />
                                    <Search
                                        size={13}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                    />
                                </div>

                                <div className="custom-scrollbar max-h-[200px] space-y-1 overflow-y-auto pr-0.5">
                                    {filtered.map((item) => {
                                        const isChecked = checked.includes(item);
                                        return (
                                            <div
                                                key={item}
                                                onClick={() => toggleItem(item)}
                                                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors select-none hover:bg-neutral-100/70"
                                            >
                                                <CheckBox checked={isChecked} />
                                                <span
                                                    className={`truncate text-[13px] ${isChecked
                                                        ? "font-medium text-neutral-800"
                                                        : "font-normal text-neutral-700 group-hover:text-neutral-900"
                                                        }`}
                                                >
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <div className="py-4 text-center text-xs text-neutral-400">No results found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                        <label
                            onClick={() => set({ saveAsDefault: !draft.saveAsDefault })}
                            className="flex cursor-pointer items-center gap-2 select-none"
                        >
                            <span
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${draft.saveAsDefault ? "bg-[#D4AF37]" : "bg-neutral-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${draft.saveAsDefault ? "translate-x-4" : "translate-x-0.5"
                                        }`}
                                />
                            </span>
                            <span className="text-[13px] font-medium text-neutral-600">Save as default</span>
                        </label>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-[13px] font-medium text-neutral-700 underline underline-offset-2 transition-colors hover:text-black"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={close}
                                className="text-[13px] font-medium text-neutral-700 transition-colors hover:text-black"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="rounded-xl bg-[#111111] px-5 py-2 text-[13px] font-semibold text-[#facc15] shadow-sm transition-colors hover:bg-[#262626]"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}