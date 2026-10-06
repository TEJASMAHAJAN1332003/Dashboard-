import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  ChevronDown,
  Pencil,
  SlidersHorizontal,
  RotateCcw,
  Check,
  MoreHorizontal,
  Users,
  Search,
} from "lucide-react";
import AgentsPopup from "./AgentsPopup";

const DASHBOARDS = ["My Dashboard", "My Team Dashboard", "Organization Dashboard"];

const FILTER_TYPES = ["Date Range", "Project", "Property", "Source", "Agent"];
const DATE_TYPES = ["All", "Created", "Scheduled", "Modified"];
const RANGE_OPTIONS = [
  "Till Date",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Current Month",
  "Last Quarter",
  "Custom",
];

const PROJECT_LIST = [
  "vfp cygnus",
  "27 Grand",
  "32 Pinewood Drive",
  "5 Hinjewadi",
  "5 Hinjewadi,5 Hinjewadi",
  "Aamor",
  "Ace abode",
];

const PROPERTY_LIST = [
  "Dolphin Palms",
  "108 rohit astera",
  "24k",
  "57 elevate",
  "57 Elevate",
  "66 Avenue",
  "Abhinav Pebbles",
];

const SOURCE_LIST = [
  "99 Acres",
  "Bayut",
  "Boards and Hoardings",
  "Brochures Distribution",
  "Call Logs",
  "Channel Partner",
  "Common Floor",
];

const AGENT_LIST = [
  "You",
  "Amit Sharma",
  "Ankush Kanojiya",
  "Arhum Sayyed",
  "Ayush Kalia",
  "Blisss 2 East",
  "Dhairya Kakkad",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmtDate = (d) =>
  d
    ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";
const sameDay = (a, b) => !!a && !!b && a.toDateString() === b.toDateString();

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
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="px-2 text-lg hover:text-[#D4AF37]"
        >
          ‹
        </button>
        <span className="text-[13px] font-semibold">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="px-2 text-lg hover:text-[#D4AF37]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
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

/* Closes a dropdown on outside click or Escape */
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

export default function DashboardHeader({
  userName = "Pratik",
  /** Controlled: which dashboard is currently active (managed by App.jsx) */
  activeDashboard = "My Dashboard",
  onEditWidgets,
  onGlobalFilter,
  onReset,
  onApply,
  onDashboardChange,
  onAgentSelect,
}) {
  const [dashOpen, setDashOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(["amit"]);
  const [withTeam, setWithTeam] = useState(false);

  /* Global Filter states */
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("Date Range");
  const [dateType, setDateType] = useState("Created");
  const [range, setRange] = useState("Last 7 Days");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedFilterAgents, setSelectedFilterAgents] = useState([]);
  const [filterWithTeam, setFilterWithTeam] = useState(false);

  const dashRef = useRef(null);
  const actionsRef = useRef(null);
  const agentsRef = useRef(null);
  const globalFilterRef = useRef(null);
  useDismiss(dashRef, dashOpen, () => setDashOpen(false));
  useDismiss(actionsRef, actionsOpen, () => setActionsOpen(false));
  useDismiss(agentsRef, agentsOpen, () => setAgentsOpen(false));
  useDismiss(globalFilterRef, globalFilterOpen, () => setGlobalFilterOpen(false));

  const handleResetFilter = () => {
    setFilterType("Date Range");
    setDateType("Created");
    setRange("Last 7 Days");
    setCustomFrom(null);
    setCustomTo(null);
    setCalOpen(false);
    setSaveAsDefault(false);
    setFilterSearch("");
    setSelectedProjects([]);
    setSelectedProperties([]);
    setSelectedSources([]);
    setSelectedFilterAgents([]);
    setFilterWithTeam(false);
  };

  const handleApplyFilter = () => {
    onGlobalFilter?.({
      filterType,
      dateType,
      range,
      customFrom,
      customTo,
      saveAsDefault,
    });
    setGlobalFilterOpen(false);
  };

  const handleSelectedAgentsChange = (newSelected) => {
    setSelectedAgents(newSelected);
    onAgentSelect?.(newSelected, withTeam);
  };

  const handleWithTeamChange = (newWithTeam) => {
    setWithTeam(newWithTeam);
    onAgentSelect?.(selectedAgents, newWithTeam);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const isTeamDashboard =
    activeDashboard === "My Team Dashboard" ||
    activeDashboard === "Organization Dashboard";

  const pickDashboard = (name) => {
    setDashOpen(false);
    setAgentsOpen(false);
    onDashboardChange?.(name);
  };

  const ghostBtn =
    "group flex h-10 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] lg:px-3";

  return (
    <header className="w-full bg-[#F5F5F5] px-4 py-3 sm:px-6">
      {/* ── TOPBAR (dark) ── */}
      <div className="mx-auto grid max-w-[2200px] grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-neutral-800 bg-[#0A0A0A] px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_10px_30px_-12px_rgba(0,0,0,0.45)]">

        {/* ── LEFT: Dashboard switcher + optional Agents tab ── */}
        <div className="flex items-center gap-1 justify-self-start">

          {/* Dashboard switcher button */}
          <div className="relative" ref={dashRef}>
            <button
              onClick={() => setDashOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dashOpen}
              className={`flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${!agentsOpen ? "hover:bg-white/10" : "hover:bg-white/10 opacity-80"
                }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37] text-[#0A0A0A] shadow-[0_6px_14px_-4px_rgba(212,175,55,0.5)]">
                <LayoutGrid size={17} strokeWidth={2.2} />
              </span>
              <span className="text-[14px] font-semibold tracking-tight text-white">
                {activeDashboard}
              </span>
              <ChevronDown
                size={15}
                className={`text-neutral-400 transition-transform duration-200 ${dashOpen ? "rotate-180 text-[#D4AF37]" : ""}`}
              />
            </button>

            {dashOpen && (
              <ul
                role="listbox"
                className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-neutral-800 bg-[#141414] p-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]"
              >
                {DASHBOARDS.map((name) => {
                  const active = name === activeDashboard;
                  return (
                    <li key={name}>
                      <button
                        role="option"
                        aria-selected={active}
                        onClick={() => pickDashboard(name)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${active
                          ? "bg-[#D4AF37]/15 font-semibold text-white"
                          : "text-neutral-300 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        {name}
                        {active && <Check size={16} className="text-[#D4AF37]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Agents tab / popup — visible on My Team Dashboard ── */}
          {isTeamDashboard && (
            <div className="relative" ref={agentsRef}>
              <button
                onClick={() => setAgentsOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={agentsOpen}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium transition ${agentsOpen || selectedAgents.length > 0
                  ? "border-[#D4AF37]/60 bg-[#D4AF37]/15 text-white shadow-sm"
                  : "border-white/15 bg-transparent text-neutral-300 hover:border-[#D4AF37] hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Users size={14} strokeWidth={2.2} />
                <span>Agents</span>
                {selectedAgents.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-black">
                    {selectedAgents.length}
                  </span>
                )}
                <ChevronDown
                  size={13}
                  className={`text-neutral-400 transition-transform duration-200 ${agentsOpen ? "rotate-180 text-[#D4AF37]" : ""
                    }`}
                />
              </button>

              {agentsOpen && (
                <AgentsPopup
                  selectedIds={selectedAgents}
                  onSelectedChange={handleSelectedAgentsChange}
                  withTeam={withTeam}
                  onWithTeamChange={handleWithTeamChange}
                />
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Edit Widgets + Global Filter + Actions ── */}
        <div className="flex items-center gap-1 justify-self-end">
          <button
            onClick={onEditWidgets}
            title="Edit Widgets"
            className={ghostBtn}
          >
            <Pencil size={16} className="text-neutral-400 group-hover:text-white" />
            <span className="hidden lg:inline">Edit Widgets</span>
          </button>

          {/* Global Filter dropdown */}
          <div className="relative" ref={globalFilterRef}>
            <button
              onClick={() => setGlobalFilterOpen((v) => !v)}
              title="Global Filter"
              aria-haspopup="dialog"
              aria-expanded={globalFilterOpen}
              className={`group flex h-10 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] lg:px-3 ${globalFilterOpen
                ? "bg-white/15 text-white"
                : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <SlidersHorizontal
                size={16}
                className={`transition-colors ${globalFilterOpen ? "text-[#D4AF37]" : "text-neutral-400 group-hover:text-white"
                  }`}
              />
              <span className="hidden lg:inline">Global Filter</span>
            </button>

            {globalFilterOpen && (
              <div
                role="dialog"
                aria-label="Global Filter"
                className="absolute right-0 top-full z-50 mt-2 w-[520px] rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] ring-1 ring-black/5 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── COLUMNS ── */}
                <div className="flex p-4">
                  {/* Column 1: Filter Type */}
                  <div className="shrink-0 border-r border-neutral-100 pr-3">
                    <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">
                      Filter Type
                    </h4>
                    <div className="space-y-3">
                      {FILTER_TYPES.map((item) => {
                        const isSelected = filterType === item;
                        return (
                          <div
                            key={item}
                            onClick={() => setFilterType(item)}
                            className="group flex cursor-pointer items-center gap-2"
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected
                                ? "border-[#D4AF37] bg-white"
                                : "border-neutral-400 bg-white group-hover:border-neutral-600"
                                }`}
                            >
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                              )}
                            </span>
                            <span
                              className={`text-[13px] transition-colors ${isSelected
                                ? "font-medium text-neutral-800"
                                : "text-neutral-600 group-hover:text-neutral-900"
                                }`}
                            >
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel — changes based on filterType */}
                  {filterType === "Date Range" && (
                    <>
                      {/* Column 2: Date Type */}
                      <div className="border-r border-neutral-100 px-3">
                        <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">
                          Date Type
                        </h4>
                        <div className="space-y-3">
                          {DATE_TYPES.map((item) => {
                            const isSelected = dateType === item;
                            return (
                              <div
                                key={item}
                                onClick={() => setDateType(item)}
                                className="group flex cursor-pointer items-center gap-2"
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected
                                    ? "border-[#D4AF37] bg-white"
                                    : "border-neutral-400 bg-white group-hover:border-neutral-600"
                                    }`}
                                >
                                  {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                                  )}
                                </span>
                                <span
                                  className={`text-[13px] transition-colors ${isSelected
                                    ? "font-medium text-neutral-800"
                                    : "text-neutral-600 group-hover:text-neutral-900"
                                    }`}
                                >
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 3: Range */}
                      <div className="flex-1 pl-3">
                        <h4 className="pb-3 text-[13px] font-semibold text-neutral-700">
                          Range
                        </h4>
                        <div className="space-y-3">
                          {RANGE_OPTIONS.map((item) => {
                            const isSelected = range === item;
                            return (
                              <div
                                key={item}
                                onClick={() => {
                                  setRange(item);
                                  setCalOpen(item === "Custom");
                                }}
                                className="group flex cursor-pointer items-center gap-2"
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected
                                    ? "border-[#D4AF37] bg-white"
                                    : "border-neutral-400 bg-white group-hover:border-neutral-600"
                                    }`}
                                >
                                  {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                                  )}
                                </span>
                                <span
                                  className={`text-[13px] transition-colors ${isSelected
                                    ? "font-medium text-neutral-800"
                                    : "text-neutral-600 group-hover:text-neutral-900"
                                    }`}
                                >
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Date input + From/To range calendar */}
                        <div className="relative mt-3">
                          <input
                            type="text"
                            readOnly
                            value={
                              customFrom
                                ? `${fmtDate(customFrom)}${customTo ? ` – ${fmtDate(customTo)}` : ""}`
                                : ""
                            }
                            onClick={() => {
                              setRange("Custom");
                              setCalOpen(true);
                            }}
                            placeholder="Select date"
                            className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] text-neutral-700 placeholder:text-neutral-300 focus:border-[#D4AF37] focus:outline-none transition-colors"
                          />
                          {calOpen && range === "Custom" && (
                            <RangeCalendar
                              from={customFrom}
                              to={customTo}
                              onChange={(f, t) => {
                                setCustomFrom(f);
                                setCustomTo(t);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Checklist panel for Project / Property / Source / Agent */}
                  {(filterType === "Project" || filterType === "Property" || filterType === "Source" || filterType === "Agent") && (() => {
                    const listMap = {
                      Project: { items: PROJECT_LIST, selected: selectedProjects, setSelected: setSelectedProjects, title: "Select Projects" },
                      Property: { items: PROPERTY_LIST, selected: selectedProperties, setSelected: setSelectedProperties, title: "Select Properties" },
                      Source: { items: SOURCE_LIST, selected: selectedSources, setSelected: setSelectedSources, title: "Select Sources" },
                      Agent: { items: AGENT_LIST, selected: selectedFilterAgents, setSelected: setSelectedFilterAgents, title: "Select Agents" },
                    };
                    const { items, selected, setSelected, title } = listMap[filterType];
                    const q = filterSearch.trim().toLowerCase();
                    const filtered = q ? items.filter((i) => i.toLowerCase().includes(q)) : items;

                    const toggleItem = (item) => {
                      setSelected((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                      );
                    };

                    return (
                      <div className="min-w-0 flex-1 border-l border-neutral-100 pl-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between pb-2.5">
                          <h4 className="text-[13px] font-semibold text-neutral-700">
                            {title}
                          </h4>
                          {filterType === "Agent" && (
                            <button
                              type="button"
                              onClick={() => setFilterWithTeam((v) => !v)}
                              className="group flex cursor-pointer items-center gap-1.5 select-none focus:outline-none"
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${filterWithTeam
                                  ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]"
                                  : "border-neutral-300 bg-white group-hover:border-neutral-400"
                                  }`}
                              >
                                {filterWithTeam && <Check size={11} strokeWidth={3} />}
                              </span>
                              <span className="text-[12px] font-medium text-neutral-600">
                                With Team
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Search */}
                        <div className="relative mb-2.5">
                          <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            placeholder="type to search"
                            className="w-full rounded-full border border-neutral-200 bg-[#FAFAFA] py-1 pl-3.5 pr-8 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:bg-white focus:outline-none transition-colors"
                          />
                          <Search
                            size={13}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                          />
                        </div>

                        {/* Checklist */}
                        <div className="max-h-[200px] space-y-1 overflow-y-auto pr-0.5 custom-scrollbar">
                          {filtered.map((item) => {
                            const isChecked = selected.includes(item);
                            return (
                              <div
                                key={item}
                                onClick={() => toggleItem(item)}
                                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-100/70 select-none"
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${isChecked
                                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]"
                                    : "border-neutral-300 bg-white group-hover:border-neutral-400"
                                    }`}
                                >
                                  {isChecked && <Check size={11} strokeWidth={3} />}
                                </span>
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
                            <div className="py-4 text-center text-xs text-neutral-400">
                              No results found
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ── FOOTER BAR ── */}
                <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                  {/* Save as default toggle */}
                  <label
                    onClick={() => setSaveAsDefault((v) => !v)}
                    className="flex cursor-pointer items-center gap-2 select-none"
                  >
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${saveAsDefault ? "bg-[#D4AF37]" : "bg-neutral-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${saveAsDefault ? "translate-x-4" : "translate-x-0.5"
                          }`}
                      />
                    </span>
                    <span className="text-[13px] font-medium text-neutral-600">
                      Save as default
                    </span>
                  </label>

                  {/* Actions: Reset, Cancel, Apply */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className="text-[13px] font-medium text-neutral-700 underline underline-offset-2 hover:text-black transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalFilterOpen(false)}
                      className="text-[13px] font-medium text-neutral-700 hover:text-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilter}
                      className="rounded-xl bg-[#111111] px-5 py-2 text-[13px] font-semibold text-[#facc15] shadow-sm hover:bg-[#262626] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="mx-2 hidden h-6 w-px bg-white/15 sm:block" />

          {/* Actions dropdown */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setActionsOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#D4AF37] px-4 text-sm font-semibold text-[#0A0A0A] shadow-[0_8px_18px_-6px_rgba(212,175,55,0.45)] transition hover:bg-[#c29f2f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
            >
              <MoreHorizontal size={16} />
              Actions
              <ChevronDown
                size={15}
                className={`text-[#0A0A0A]/70 transition-transform duration-200 ${actionsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {actionsOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-neutral-800 bg-[#141414] p-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]"
              >
                <button
                  role="menuitem"
                  onClick={() => { onReset?.(); setActionsOpen(false); window.location.reload(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-neutral-300">
                    <RotateCcw size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">Reset</span>
                    <span className="block text-xs text-neutral-400">Clear filters and go back to default</span>
                  </span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => { onApply?.(); setActionsOpen(false); }}
                  className="mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#D4AF37]/15"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37] text-[#0A0A0A] shadow-[0_6px_12px_-4px_rgba(212,175,55,0.6)]">
                    <Check size={16} strokeWidth={2.6} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">Apply</span>
                    <span className="block text-xs text-neutral-400">Update the dashboard with your selection</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── WELCOME: sits below the topbar ── */}
      <div className="mx-auto mt-4 flex max-w-[2200px] items-center gap-3 px-1">
        <div className="leading-tight">
          <h1 className="text-lg font-bold tracking-tight text-[#0A0A0A] sm:text-xl">
            Welcome back, <span className="text-[#D4AF37]">{userName}</span>!
          </h1>
        </div>
      </div>
    </header>
  );
}