import { useEffect, useRef, useState } from "react";
import {
  Share2,
  ChevronDown,
  Check,
  Search,
  SlidersHorizontal,
  Table,
  BarChart2,
  TrendingUp,
  Inbox,
  Globe,
  Flame,
  UserCheck,
  Building,
  Mail,
  Users,
  MessageSquare,
} from "lucide-react";
import { useCountUp } from "./revenueUtils";
import CardEditFilter from "./Cardeditfilter";

const ALL_SOURCES = [
  {
    id: "google_ads",
    name: "Google Ads",
    leads: 58,
    active: 46,
    inactive: 12,
    share: 35.4,
    conversion: 14.2,
    growth: "+18.2%",
    category: "paid",
    icon: Globe,
  },
  {
    id: "website_direct",
    name: "Direct Website",
    leads: 42,
    active: 35,
    inactive: 7,
    share: 25.6,
    conversion: 11.5,
    growth: "+9.5%",
    category: "organic",
    icon: Flame,
  },
  {
    id: "social_media",
    name: "Social Media (Meta)",
    leads: 31,
    active: 23,
    inactive: 8,
    share: 18.9,
    conversion: 8.4,
    growth: "+14.1%",
    category: "paid",
    icon: Share2,
  },
  {
    id: "referrals",
    name: "Channel Partners",
    leads: 21,
    active: 16,
    inactive: 5,
    share: 12.8,
    conversion: 19.8,
    growth: "+5.4%",
    category: "referral",
    icon: UserCheck,
  },
  {
    id: "property_portals",
    name: "Property Portals",
    leads: 12,
    active: 8,
    inactive: 4,
    share: 7.3,
    conversion: 9.6,
    growth: "+7.0%",
    category: "portals",
    icon: Building,
  },
  {
    id: "email_campaigns",
    name: "Email Campaigns",
    leads: 9,
    active: 6,
    inactive: 3,
    share: 5.5,
    conversion: 6.2,
    growth: "+3.2%",
    category: "marketing",
    icon: Mail,
  },
  {
    id: "events_walkins",
    name: "Walk-ins & Events",
    leads: 7,
    active: 5,
    inactive: 2,
    share: 4.3,
    conversion: 22.0,
    growth: "+11.0%",
    category: "direct",
    icon: Users,
  },
  {
    id: "sms_whatsapp",
    name: "WhatsApp / Chatbot",
    leads: 5,
    active: 4,
    inactive: 1,
    share: 3.0,
    conversion: 7.5,
    growth: "+4.1%",
    category: "direct",
    icon: MessageSquare,
  },
];

const FILTER_OPTIONS = [
  { key: "top5", label: "Top 5 sources that receive more leads" },
  { key: "all", label: "All Sources" },
  { key: "paid", label: "Paid Campaigns (Google & Meta)" },
  { key: "organic", label: "Organic & Direct" },
  { key: "referral", label: "Referrals & Partners" },
];

export default function LeadsVsSource({ className = "", onEditApply }) {
  const [filterKey, setFilterKey] = useState("top5");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'bars'
  const [hoveredSource, setHoveredSource] = useState(null);

  const filterRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Filter sources
  const visibleSources = ALL_SOURCES.filter((src) => {
    // Category or top 5 filter
    let matchesCategory = true;
    if (filterKey === "top5") {
      matchesCategory = ALL_SOURCES.slice(0, 5).some((s) => s.id === src.id);
    } else if (filterKey === "paid") {
      matchesCategory = src.category === "paid";
    } else if (filterKey === "organic") {
      matchesCategory = src.category === "organic" || src.category === "direct";
    } else if (filterKey === "referral") {
      matchesCategory = src.category === "referral" || src.category === "portals";
    }

    // Search query filter
    const matchesSearch =
      !searchQuery ||
      src.name.toLowerCase().includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const activeFilterOption =
    FILTER_OPTIONS.find((f) => f.key === filterKey) || FILTER_OPTIONS[0];

  const totalFilteredLeads = visibleSources.reduce(
    (sum, s) => sum + s.leads,
    0
  );
  const animatedTotal = useCountUp(totalFilteredLeads, 500);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-sm">
            <Share2 size={16} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-black">
                Leads vs Source
              </h2>
              <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                {animatedTotal} leads
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Lead distribution across acquisition channels
            </p>
          </div>
        </div>

        {/* Controls: Edit, Search, View Toggle, and Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          {/* Shared Edit button + filter popup */}
          <CardEditFilter onApply={onEditApply} />

          {/* Search Toggle */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search source..."
                  className="h-7 w-32 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] text-black outline-none transition focus:border-black focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="ml-1 text-[10px] text-neutral-400 hover:text-black"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title="Search source"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition hover:border-black hover:bg-white hover:text-black active:scale-95"
              >
                <Search size={13} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "table" ? "bars" : "table"))
            }
            title={
              viewMode === "table"
                ? "Switch to Bar view"
                : "Switch to Table view"
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition hover:border-black hover:bg-white hover:text-black active:scale-95"
          >
            {viewMode === "table" ? (
              <BarChart2 size={13} />
            ) : (
              <Table size={13} />
            )}
          </button>

          {/* Filter Dropdown with explicit text */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] font-medium text-neutral-700 shadow-sm transition hover:border-black hover:bg-white hover:text-black active:scale-95"
            >
              <SlidersHorizontal size={11} className="text-neutral-500" />
              <span className="max-w-[150px] truncate sm:max-w-[210px]">
                {activeFilterOption.label}
              </span>
              <ChevronDown
                size={12}
                className={`text-neutral-400 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {filterOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)]"
              >
                <li className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Filter Channels
                </li>
                {FILTER_OPTIONS.map((opt) => {
                  const isSelected = opt.key === filterKey;
                  return (
                    <li key={opt.key}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setFilterKey(opt.key);
                          setFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${isSelected
                          ? "bg-yellow-50 font-semibold text-black"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                          }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <Check size={14} className="shrink-0 text-black" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-3 min-h-[175px] flex-1 overflow-hidden">
        {visibleSources.length === 0 ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 shadow-inner">
              <Inbox size={18} />
            </span>
            <p className="mt-2 text-xs font-semibold text-black">
              No Data Found
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              No Status data available for the selected criteria
            </p>
            {(searchQuery || filterKey !== "top5") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterKey("top5");
                }}
                className="mt-2 text-[11px] font-medium text-black underline underline-offset-2 hover:text-neutral-600"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* Compact Table View */
          <div className="h-full overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-[10.5px] font-semibold text-neutral-400">
                  <th className="pb-1.5 pl-1 font-medium">Source</th>
                  <th className="pb-1.5 text-right font-medium">Leads</th>
                  <th className="pb-1.5 pl-4 font-medium">Share</th>
                  <th className="pb-1.5 pr-1 text-right font-medium">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {visibleSources.map((source) => {
                  const Icon = source.icon;
                  const isHovered = hoveredSource === source.id;

                  return (
                    <tr
                      key={source.id}
                      onMouseEnter={() => setHoveredSource(source.id)}
                      onMouseLeave={() => setHoveredSource(null)}
                      className={`group/row transition-colors duration-150 ${isHovered ? "bg-neutral-50" : "hover:bg-neutral-50/60"
                        }`}
                    >
                      {/* Source Name with Icon badge */}
                      <td className="py-2 pl-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black text-yellow-400 shadow-sm">
                            <Icon size={12} strokeWidth={2.4} />
                          </span>
                          <span className="font-semibold text-black">
                            {source.name}
                          </span>
                        </div>
                      </td>

                      {/* Leads Count */}
                      <td className="py-2 text-right font-bold tabular-nums text-black">
                        {source.leads}
                      </td>

                      {/* Share progress bar */}
                      <td className="py-2 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100 sm:w-24">
                            <div
                              className="h-full rounded-full bg-yellow-400 transition-all duration-700 ease-out"
                              style={{ width: `${Math.min(source.share, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium tabular-nums text-neutral-400">
                            {source.share}%
                          </span>
                        </div>
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-2 pr-1 text-right">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                          <TrendingUp size={9} strokeWidth={2.6} />
                          {source.conversion}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Distribution Bars View */
          <div className="h-full space-y-2 overflow-y-auto pr-1">
            {visibleSources.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.id}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/60 p-2 transition hover:border-yellow-400 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-yellow-400">
                        <Icon size={11} />
                      </span>
                      <span className="font-semibold text-black">
                        {source.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-medium">
                      <span className="font-bold text-black">
                        {source.leads} leads
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-[11px] text-neutral-500">
                        {source.share}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/70">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all duration-700 ease-out"
                      style={{ width: `${source.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 ring-1 ring-black/10" />
          Showing {visibleSources.length} acquisition channels
        </span>
        <span className="font-medium text-neutral-600">
          Total: <b className="text-black">{totalFilteredLeads}</b> leads
        </span>
      </div>
    </div>
  );
}