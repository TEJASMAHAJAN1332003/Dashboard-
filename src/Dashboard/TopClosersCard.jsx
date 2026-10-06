import { useState, useRef, useEffect } from "react";
import { Trophy, ChevronDown, Inbox } from "lucide-react";
import { formatCompactINR } from "./revenueUtils";
import CardEditFilter, { DEFAULT_FILTER } from "./Cardeditfilter";

// Palette taken from CampaignTypesCard
// Gold   #D4AF37
// Black  #0A0A0A
// Greys  #2f2f2f  #6b6b6b  #b5b5b5  #f1f1f1

const INITIAL_CLOSERS = [
  {
    id: 1,
    name: "Avdhut kale",
    role: "Senior Sales Manager",
    avatar: "AK",
    leads: 12,
    eoi: 0,
    invoiced: 0,
    booked: 1,
    meetings: 0,
    siteVisits: 0,
    brokerage: 0,
    deals: 1,
    salesINR: 11800000,
    conversion: 8.33,
    rank: 1,
    accent: "#D4AF37", // Gold
    badge: "Top Performer",
  },
  {
    id: 2,
    name: "Santosh Prajapati",
    role: "Sales Manager",
    avatar: "SP",
    leads: 8,
    eoi: 1,
    invoiced: 0,
    booked: 0,
    meetings: 2,
    siteVisits: 1,
    brokerage: 0,
    deals: 0,
    salesINR: 5200000,
    conversion: 0,
    rank: 2,
    accent: "#6b6b6b", // Mid grey
    badge: "High Growth",
  },
  {
    id: 3,
    name: "Saurabh Navale",
    role: "Sales Manager",
    avatar: "SN",
    leads: 15,
    eoi: 0,
    invoiced: 0,
    booked: 0,
    meetings: 1,
    siteVisits: 2,
    brokerage: 0,
    deals: 0,
    salesINR: 4150000,
    conversion: 0,
    rank: 3,
    accent: "#2f2f2f", // Dark grey
    badge: "Closer",
  },
  {
    id: 4,
    name: "Pratik Yadav",
    role: "DGM",
    avatar: "PY",
    leads: 20,
    eoi: 2,
    invoiced: 1,
    booked: 2,
    meetings: 5,
    siteVisits: 3,
    brokerage: 50000,
    deals: 2,
    salesINR: 28000000,
    conversion: 10.0,
    rank: 4,
    accent: "#0A0A0A", // Near-black
    badge: "Consistent",
  },
];

/* Scope options shown in the "Sort By" popup.
   `field` is the agent property each scope sorts on (highest first). */
const SORT_SCOPES = [
  {
    key: "brokerage",
    title: "Total Brokerage Earned (Default)",
    sub: "based on brokerage generated",
    field: "brokerage",
  },
  {
    key: "deal",
    title: "Total Deal Value",
    sub: "based on deal value generated",
    field: "salesINR",
  },
  {
    key: "booked",
    title: "No. of Booked",
    sub: "based on no. of booked leads",
    field: "booked",
  },
  {
    key: "site-visit",
    title: "Site Visit Done",
    sub: "based on completed site visits",
    field: "siteVisits",
  },
  {
    key: "meeting",
    title: "Meeting Done",
    sub: "based on completed meetings",
    field: "meetings",
  },
];

const DEFAULT_SCOPE = "brokerage";

export default function TopClosersCard({ className = "" }) {
  const [closers] = useState(INITIAL_CLOSERS);
  const [sortBy, setSortBy] = useState(DEFAULT_SCOPE); // applied scope
  const [draftScope, setDraftScope] = useState(DEFAULT_SCOPE); // scope picked in popup
  const [sortOpen, setSortOpen] = useState(false);
  const [showEmptySample, setShowEmptySample] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [editFilter, setEditFilter] = useState(DEFAULT_FILTER); // filter applied from the Edit popup
  const sortRef = useRef(null);
  const cardRef = useRef(null);

  // Close popup and deselect agent on click outside
  useEffect(() => {
    const onDown = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setSelectedAgentId(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleSortPopup = () => {
    // Always start the popup from the currently applied scope
    if (!sortOpen) setDraftScope(sortBy);
    setSortOpen((v) => !v);
  };

  const applySortScope = () => {
    setSortBy(draftScope);
    setSortOpen(false);
  };

  const sortField = SORT_SCOPES.find((s) => s.key === sortBy)?.field || "brokerage";
  const sortedClosers = [...closers].sort((a, b) => b[sortField] - a[sortField]);

  const selectedAgent = closers.find((a) => a.id === selectedAgentId);

  const formatMillionINR = (val) => {
    if (val === 0) return "0";
    return (val / 1000000).toFixed(2) + " M";
  };

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#D4AF37] shadow-sm">
            <Trophy size={16} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-black">
              Top Closers &amp; Key Contributors
            </h2>
            <p className="text-[11px] text-neutral-500">
              Highlights of Agents driving the highest Sales Impact
            </p>
          </div>
        </div>

        {/* Controls: Sort By + Edit */}
        <div className="flex items-center gap-1.5">
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={toggleSortPopup}
              aria-haspopup="dialog"
              aria-expanded={sortOpen}
              className={`flex h-7 items-center gap-1.5 rounded-lg border bg-neutral-50 px-2.5 text-[11px] font-medium text-neutral-700 transition hover:border-[#D4AF37] hover:bg-neutral-100 hover:text-black active:scale-95 ${sortOpen ? "border-[#D4AF37]" : "border-neutral-200"
                }`}
            >
              <span>Sort By</span>
              <ChevronDown
                size={12}
                className={`text-neutral-500 transition-transform duration-200 ${sortOpen ? "rotate-180 text-[#D4AF37]" : ""
                  }`}
              />
            </button>

            {sortOpen && (
              <div
                role="dialog"
                aria-label="Sort By"
                className="absolute right-0 top-full z-50 mt-2 w-[300px] rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] ring-1 ring-black/5 select-none"
              >
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-black">Scope</p>
                  <p className="mt-0.5 border-b border-neutral-100 pb-2 text-[11px] text-neutral-500">
                    Select which metric to sort the users
                  </p>

                  <div
                    role="radiogroup"
                    className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-200"
                  >
                    {SORT_SCOPES.map((opt) => {
                      const active = draftScope === opt.key;
                      return (
                        <div
                          key={opt.key}
                          role="radio"
                          aria-checked={active}
                          tabIndex={0}
                          onClick={() => setDraftScope(opt.key)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") && setDraftScope(opt.key)
                          }
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors first:rounded-t-xl last:rounded-b-xl ${active ? "bg-[#fefce8]" : "bg-white hover:bg-neutral-50"
                            }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white transition-colors ${active ? "border-[#D4AF37]" : "border-neutral-400"
                              }`}
                          >
                            {active && (
                              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-black">
                              {opt.title}
                            </span>
                            <span className="block text-[11px] text-neutral-400">
                              {opt.sub}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end border-t border-neutral-100 px-3 py-3">
                  <button
                    type="button"
                    onClick={applySortScope}
                    className="rounded-xl bg-[#111111] px-5 py-2 text-[13px] font-semibold text-[#facc15] shadow-sm transition-colors hover:bg-[#262626]"
                  >
                    Apply Setting
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Edit button → opens the filter popup */}
          <CardEditFilter
            value={editFilter}
            onApply={(f) => setEditFilter(f)}
            onReset={() => setEditFilter(DEFAULT_FILTER)}
            align="right"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="mt-3 flex-1 overflow-hidden">
        {showEmptySample ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center min-h-[250px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 shadow-inner">
              <Inbox size={18} />
            </span>
            <p className="mt-2 text-xs font-semibold text-black">
              No Data Found!
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              No Top Closers &amp; Key Contributors found.
            </p>
            <button
              type="button"
              onClick={() => setShowEmptySample(false)}
              className="mt-2 text-[11px] font-medium text-neutral-700 underline decoration-[#D4AF37] underline-offset-2 hover:text-black"
            >
              Load Top Contributors
            </button>
          </div>
        ) : (
          /* Leaderboard & Stats Split View */
          <div className="flex flex-col md:flex-row gap-4 py-2">
            {/* Left Column: Agents List */}
            <div className={`w-full ${selectedAgent ? "md:w-[45%] pr-2" : ""} flex flex-col space-y-2 max-h-[300px] overflow-y-auto`}>
              {sortedClosers.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`group/row flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all duration-200 border ${selectedAgentId === agent.id
                    ? "border-[#D4AF37] bg-neutral-50 shadow-sm"
                    : "border-transparent hover:bg-neutral-50"
                    }`}
                >
                  {/* Agent info & Rank */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-black shadow-sm overflow-hidden border border-neutral-200">
                        {agent.avatar}
                      </div>
                      <span
                        className="absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm ring-1 ring-white"
                        style={{ backgroundColor: agent.accent || "#b5b5b5" }}
                      >
                        {agent.rank}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {agent.name}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{agent.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Selected Agent Details */}
            {selectedAgent && (
              <div className="w-full md:w-[55%] flex flex-col space-y-2.5 pl-4 md:border-l md:border-neutral-100 justify-center">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Total Leads :</span>
                  <span className="font-bold text-black">{selectedAgent.leads}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Expression Of Interest :</span>
                  <span className="font-bold text-black">{selectedAgent.eoi}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Invoiced :</span>
                  <span className="font-bold text-black">{selectedAgent.invoiced}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">No. of Booked :</span>
                  <span className="font-bold text-black">{selectedAgent.booked}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Meeting Done :</span>
                  <span className="font-bold text-black">{selectedAgent.meetings}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Site Visit Done :</span>
                  <span className="font-bold text-black">{selectedAgent.siteVisits}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Brokerage Earned :</span>
                  <span className="font-bold text-black">₹ {selectedAgent.brokerage}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Total Deal Value :</span>
                  <span className="font-bold text-black">₹ {formatMillionINR(selectedAgent.salesINR)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-neutral-500 font-medium">Conversion Rate :</span>
                  <span className="font-bold text-[#D4AF37]">{selectedAgent.conversion}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}