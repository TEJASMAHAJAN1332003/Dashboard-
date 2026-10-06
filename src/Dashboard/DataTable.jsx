import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Sparkles,
  PhoneCall,
  Clock,
  AlertCircle,
  CalendarCheck,
  MapPin,
  Users,
  CheckCircle2,
  Target,
} from "lucide-react";
import CardEditFilter, { DEFAULT_FILTER } from "./Cardeditfilter";

// Icon mapping per label
const METRIC_ICONS = {
  New: Sparkles,
  Callback: PhoneCall,
  Pending: Clock,
  Overdue: AlertCircle,
  "Meeting Sched": CalendarCheck,
  "Site Visit Sched": MapPin,
  "Meeting Done": Users,
  "Site Visit Done": CheckCircle2,
  EOI: Target,
};

const DEFAULT_CARDS_BY_TAB = {
  All: [
    { id: "all-1", label: "New", count: 901, trend: "+100%", isPositive: true },
    { id: "all-2", label: "Callback", count: 5181, trend: "+24.3%", isPositive: true },
    { id: "all-3", label: "Pending", count: 1682, trend: "-1.4%", isPositive: false },
    { id: "all-4", label: "Overdue", count: 1110, trend: "-35.1%", isPositive: false },
    { id: "all-5", label: "Meeting Sched", count: 24, trend: "+14.3%", isPositive: true },
    { id: "all-6", label: "Site Visit Sched", count: 54, trend: "+12.5%", isPositive: true },
    { id: "all-7", label: "Meeting Done", count: 13, trend: "+100%", isPositive: true },
    { id: "all-8", label: "Site Visit Done", count: 70, trend: "+100%", isPositive: true },
    { id: "all-9", label: "EOI", count: 31, trend: "+67.6%", isPositive: true },
  ],
  Deleted: [
    { id: "del-1", label: "Deleted Leads", count: 142, trend: "-8.5%", isPositive: false },
    { id: "del-2", label: "Junk / Spam", count: 88, trend: "-12.0%", isPositive: false },
    { id: "del-3", label: "Disqualified", count: 56, trend: "-4.2%", isPositive: false },
    { id: "del-4", label: "Archived", count: 34, trend: "+2.1%", isPositive: true },
  ],
  Duplicate: [
    { id: "dup-1", label: "Duplicate Leads", count: 64, trend: "-15.2%", isPositive: false },
    { id: "dup-2", label: "Matching Phone", count: 38, trend: "-5.6%", isPositive: false },
    { id: "dup-3", label: "Matching Email", count: 26, trend: "-11.0%", isPositive: false },
    { id: "dup-4", label: "Merged", count: 47, trend: "+21.0%", isPositive: true },
  ],
};

const TABS = ["All", "Deleted", "Duplicate"];

// Edit Widgets panel status name -> card label (only where they differ)
const STATUS_TO_LABEL = {
  "Meeting Scheduled": "Meeting Sched",
  "Site Visit Scheduled": "Site Visit Sched",
  "Expression Of Interest": "EOI",
};
const toLabel = (status) => STATUS_TO_LABEL[status] ?? status;

/* Fixed card width = one slot of a full 9-card row (8 gaps of 0.75rem),
   so cards keep the same size no matter how many are visible. */
const CARD_WIDTH = "calc((100% - 6rem) / 9)";

/**
 * Props:
 *   statuses – ordered list of status names coming from the Edit Widgets
 *              panel (bifurcation.statuses). Controls the order, selection
 *              and max count of cards on the "All" tab.
 */
function DataTable({ statuses }) {
  const [activeTab, setActiveTab] = useState("All");
  const [cardsByTab] = useState(DEFAULT_CARDS_BY_TAB);

  // Filter applied from the Edit popup (use it to fetch / filter your data)
  const [filter, setFilter] = useState(DEFAULT_FILTER);

  // "All" tab follows the order / selection / max count from Edit Widgets.
  // Other tabs are unchanged.
  const getCards = (tab) => {
    const cards = cardsByTab[tab] || [];
    if (tab !== "All" || !statuses) return cards;
    return statuses
      .map((s) => cards.find((c) => c.label === toLabel(s)))
      .filter(Boolean);
  };

  const currentCards = getCards(activeTab);

  return (
    <div className="w-full rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow duration-200">
      {/* ── TOP HEADER: Tabs on the Left · Edit Option on the Right ── */}
      <div className="relative mb-3.5 flex items-center justify-between border-b border-neutral-200/70 pb-2.5">
        {/* Tabs: All | Deleted | Duplicate */}
        <div className="flex items-center gap-6 sm:gap-8">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            const count = getCards(tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`group relative flex items-center gap-1.5 pb-2 text-sm font-semibold transition-colors focus:outline-none ${isActive
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
                  }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] font-medium transition-colors ${isActive
                    ? "bg-neutral-100 text-neutral-800"
                    : "bg-neutral-50 text-neutral-400 group-hover:bg-neutral-100"
                    }`}
                >
                  {count}
                </span>

                {/* Dark active underline indicator matching reference */}
                {isActive && (
                  <span className="absolute -bottom-[11px] left-0 right-0 h-[2px] rounded-full bg-neutral-900 transition-all duration-200" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Corner: Edit button → opens the filter popup */}
        <div className="flex items-center gap-2">
          <CardEditFilter
            value={filter}
            onApply={(f) => setFilter(f)}
            onReset={() => setFilter(DEFAULT_FILTER)}
            align="right"
            buttonClassName="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          />
        </div>
      </div>

      {/* ── CARDS CONTAINER: Row of metric cards ── */}
      {currentCards.length === 0 ? (
        <div className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-4 text-center">
          <p className="text-xs font-medium text-neutral-500">No cards in {activeTab}</p>
        </div>
      ) : (
        <div className="flex w-full items-stretch gap-3 overflow-x-auto px-0.5 py-1 custom-scrollbar">
          {currentCards.map((metric) => {
            const Icon = METRIC_ICONS[metric.label] || Sparkles;
            return (
              <div
                key={metric.id}
                style={{ width: CARD_WIDTH }}
                className="group relative min-w-[190px] flex-none select-none rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Header: icon + label, menu on the right */}
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2 text-neutral-500">
                    <Icon size={14} strokeWidth={1.75} className="flex-shrink-0" />
                    <span className="truncate text-[13px] font-medium text-neutral-800">
                      {metric.label}
                    </span>
                  </div>

                  <MoreVertical size={14} className="flex-shrink-0 text-neutral-400" />
                </div>

                {/* Inset value box */}
                <div className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                  <span className="text-2xl font-semibold leading-none tracking-tight text-black">
                    {metric.count.toLocaleString()}
                  </span>
                  <span
                    className={`flex flex-shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${metric.isPositive
                      ? "bg-yellow-100 text-black ring-yellow-300"
                      : "bg-black text-white ring-black"
                      }`}
                  >
                    {metric.isPositive ? (
                      <TrendingUp size={11} strokeWidth={2.25} />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.25} />
                    )}
                    {metric.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DataTable;