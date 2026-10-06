import { useState, useRef, useEffect } from "react";
import {
  PhoneCall,
  ChevronDown,
  Check,
  Search,
  SlidersHorizontal,
  Clock,
} from "lucide-react";

// Palette taken from CampaignTypesCard
// Gold   #D4AF37
// Black  #0A0A0A
// Greys  #2f2f2f  #6b6b6b  #b5b5b5  #f1f1f1

const INITIAL_TALKTIME_DATA = [
  {
    id: 1,
    name: "Pratik Prakash",
    role: "Senior Sales Lead",
    avatar: "PP",
    totalCalls: 84,
    connectedCalls: 68,
    totalDuration: "4h 32m",
    totalSeconds: 16320,
    incomingCalls: 28,
    incomingAnswered: 26,
    incomingMissed: 2,
    incomingDuration: "1h 45m",
    outgoingCalls: 56,
    outgoingDuration: "2h 47m",
    outgoingAnswered: 42,
    outgoingNotAnswered: 14,
    status: "active",
  },
  {
    id: 2,
    name: "Tejas",
    role: "Property Consultant",
    avatar: "T",
    totalCalls: 72,
    connectedCalls: 58,
    totalDuration: "3h 50m",
    totalSeconds: 13800,
    incomingCalls: 22,
    incomingAnswered: 20,
    incomingMissed: 2,
    incomingDuration: "1h 15m",
    outgoingCalls: 50,
    outgoingDuration: "2h 35m",
    outgoingAnswered: 38,
    outgoingNotAnswered: 12,
    status: "active",
  },
  {
    id: 3,
    name: "Sachin Mohite",
    role: "Key Account Manager",
    avatar: "SM",
    totalCalls: 65,
    connectedCalls: 49,
    totalDuration: "3h 12m",
    totalSeconds: 11520,
    incomingCalls: 19,
    incomingAnswered: 17,
    incomingMissed: 2,
    incomingDuration: "58m",
    outgoingCalls: 46,
    outgoingDuration: "2h 14m",
    outgoingAnswered: 32,
    outgoingNotAnswered: 14,
    status: "active",
  },
  {
    id: 4,
    name: "Rohit Veer",
    role: "Sales Associate",
    avatar: "RV",
    totalCalls: 58,
    connectedCalls: 44,
    totalDuration: "2h 45m",
    totalSeconds: 9900,
    incomingCalls: 16,
    incomingAnswered: 14,
    incomingMissed: 2,
    incomingDuration: "48m",
    outgoingCalls: 42,
    outgoingDuration: "1h 57m",
    outgoingAnswered: 30,
    outgoingNotAnswered: 12,
    status: "away",
  },
  {
    id: 5,
    name: "Swarupa Shinde",
    role: "Client Advisor",
    avatar: "SS",
    totalCalls: 52,
    connectedCalls: 41,
    totalDuration: "2h 28m",
    totalSeconds: 8880,
    incomingCalls: 15,
    incomingAnswered: 14,
    incomingMissed: 1,
    incomingDuration: "42m",
    outgoingCalls: 37,
    outgoingDuration: "1h 46m",
    outgoingAnswered: 27,
    outgoingNotAnswered: 10,
    status: "active",
  },
];

const LEAD_FILTER_OPTIONS = [
  "All Leads",
  "Hot Leads",
  "Warm Leads",
  "Cold Enquiries",
];

const PERIOD_FILTER_OPTIONS = [
  "Last 7 Days",
  "Today",
  "Yesterday",
  "Last 30 Days",
  "Last Quarter",
];

export default function AgentTalktimeTable({ className = "" }) {
  const [data] = useState(INITIAL_TALKTIME_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [leadFilter, setLeadFilter] = useState("All Leads");
  const [periodFilter, setPeriodFilter] = useState("Last 7 Days");
  const [showEmptySample, setShowEmptySample] = useState(false);

  const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const leadRef = useRef(null);
  const periodRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (leadRef.current && !leadRef.current.contains(e.target)) {
        setLeadDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return row.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  const totalTeamCalls = filteredData.reduce((s, r) => s + r.totalCalls, 0);
  const totalConnected = filteredData.reduce((s, r) => s + r.connectedCalls, 0);
  const overallConnectionRate =
    totalTeamCalls > 0 ? ((totalConnected / totalTeamCalls) * 100).toFixed(1) : 0;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#D4AF37] shadow-sm">
            <PhoneCall size={17} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-black">
                Agent Talktime
              </h2>
              <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-semibold text-black">
                Connection Rate: {overallConnectionRate}%
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Monitor Agent Call Performance - Min/Max Talk Time
            </p>
          </div>
        </div>

        {/* Controls: Search, Lead Dropdown, Period Dropdown matching photo */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent..."
              className="h-8 w-36 rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-2.5 text-xs text-black outline-none transition placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white sm:w-44"
            />
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lead Filter Dropdown */}
          <div className="relative" ref={leadRef}>
            <button
              type="button"
              onClick={() => setLeadDropdownOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={leadDropdownOpen}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-700 transition hover:border-[#D4AF37] hover:bg-neutral-100 hover:text-black active:scale-95"
            >
              <SlidersHorizontal size={12} className="text-neutral-500" />
              <span>{leadFilter}</span>
              <ChevronDown
                size={12}
                className={`text-neutral-500 transition-transform duration-200 ${leadDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {leadDropdownOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)]"
              >
                {LEAD_FILTER_OPTIONS.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={leadFilter === opt}
                      onClick={() => {
                        setLeadFilter(opt);
                        setLeadDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${leadFilter === opt
                        ? "bg-[#D4AF37]/10 font-semibold text-black"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                        }`}
                    >
                      <span>{opt}</span>
                      {leadFilter === opt && (
                        <Check size={13} className="text-[#D4AF37]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Period Filter Dropdown matching photo "Last 7 Days" */}
          <div className="relative" ref={periodRef}>
            <button
              type="button"
              onClick={() => setPeriodDropdownOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={periodDropdownOpen}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-700 transition hover:border-[#D4AF37] hover:bg-neutral-100 hover:text-black active:scale-95"
            >
              <Clock size={12} className="text-neutral-500" />
              <span>{periodFilter}</span>
              <ChevronDown
                size={12}
                className={`text-neutral-500 transition-transform duration-200 ${periodDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {periodDropdownOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)]"
              >
                {PERIOD_FILTER_OPTIONS.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={periodFilter === opt}
                      onClick={() => {
                        setPeriodFilter(opt);
                        setPeriodDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${periodFilter === opt
                        ? "bg-[#D4AF37]/10 font-semibold text-black"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                        }`}
                    >
                      <span>{opt}</span>
                      {periodFilter === opt && (
                        <Check size={13} className="text-[#D4AF37]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Body: All 12 Columns Table or Empty State */}
      <div className="mt-4 flex-1 overflow-hidden min-h-[250px]">
        {showEmptySample || filteredData.length === 0 ? (
          /* Empty state matching the photo */
          <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 shadow-inner">
              <PhoneCall size={20} />
            </span>
            <p className="mt-2.5 text-xs font-semibold text-black">
              No Data Found!
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              No Agent Talktime data available for the selected criteria
            </p>
            {(showEmptySample || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setShowEmptySample(false);
                  setSearchQuery("");
                }}
                className="mt-2.5 text-xs font-medium text-neutral-700 underline decoration-[#D4AF37] underline-offset-2 hover:text-black"
              >
                Clear filter / Reload data
              </button>
            )}
          </div>
        ) : (
          /* Full 12-column Table with responsive horizontal scroll */
          <div className="h-full overflow-x-auto rounded-xl border border-neutral-100">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80 text-[11px] font-semibold text-neutral-500">
                  <th className="sticky left-0 bg-neutral-50/95 py-3 pl-4 pr-3 font-semibold backdrop-blur-xs">
                    Agent Name
                  </th>
                  <th className="px-3 py-3 font-semibold text-right">Total Calls</th>
                  <th className="px-3 py-3 font-semibold text-right">Connected Calls</th>
                  <th className="px-3 py-3 font-semibold text-right">Total Duration</th>
                  <th className="px-3 py-3 font-semibold text-right">Incoming Calls</th>
                  <th className="px-3 py-3 font-semibold text-right">Incoming Answered</th>
                  <th className="px-3 py-3 font-semibold text-right">Incoming Missed</th>
                  <th className="px-3 py-3 font-semibold text-right">Incoming Duration</th>
                  <th className="px-3 py-3 font-semibold text-right">Outgoing Calls</th>
                  <th className="px-3 py-3 font-semibold text-right">Outgoing Duration</th>
                  <th className="px-3 py-3 font-semibold text-right">Outgoing Answered</th>
                  <th className="py-3 pl-3 pr-4 font-semibold text-right">
                    Outgoing Not Answered
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredData.map((agent) => (
                  <tr
                    key={agent.id}
                    className="group/tr transition-colors duration-150 hover:bg-neutral-50/60"
                  >
                    {/* 1. Agent Name */}
                    <td className="sticky left-0 bg-white py-3 pl-4 pr-3 font-medium text-black group-hover/tr:bg-neutral-50/90 backdrop-blur-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-xs font-bold text-[#D4AF37]">
                          {agent.avatar}
                        </span>
                        <div>
                          <p className="font-semibold text-black">
                            {agent.name}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {agent.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Total Calls */}
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-black">
                      {agent.totalCalls}
                    </td>

                    {/* 3. Connected Calls */}
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-black">
                      {agent.connectedCalls}
                    </td>

                    {/* 4. Total Duration */}
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-black">
                      {agent.totalDuration}
                    </td>

                    {/* 5. Incoming Calls */}
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-700">
                      {agent.incomingCalls}
                    </td>

                    {/* 6. Incoming Answered */}
                    <td className="px-3 py-3 text-right tabular-nums text-black">
                      {agent.incomingAnswered}
                    </td>

                    {/* 7. Incoming Missed */}
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-[#6b6b6b]">
                      {agent.incomingMissed}
                    </td>

                    {/* 8. Incoming Duration */}
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-600">
                      {agent.incomingDuration}
                    </td>

                    {/* 9. Outgoing Calls */}
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-700">
                      {agent.outgoingCalls}
                    </td>

                    {/* 10. Outgoing Duration */}
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-600">
                      {agent.outgoingDuration}
                    </td>

                    {/* 11. Outgoing Answered */}
                    <td className="px-3 py-3 text-right tabular-nums text-black">
                      {agent.outgoingAnswered}
                    </td>

                    {/* 12. Outgoing Not Answered */}
                    <td className="py-3 pl-3 pr-4 text-right tabular-nums font-medium text-[#6b6b6b]">
                      {agent.outgoingNotAnswered}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span>Active Sales Agents: <b className="text-black">{filteredData.length}</b></span>
          <span>Total Calls: <b className="text-black">{totalTeamCalls}</b></span>
          <span>Connected: <b className="text-black">{totalConnected}</b></span>
        </div>

        <button
          type="button"
          onClick={() => setShowEmptySample((v) => !v)}
          className="text-[11px] font-medium text-neutral-500 underline decoration-[#D4AF37] hover:text-black"
        >
          {showEmptySample ? "Show Data" : "Preview Zero State"}
        </button>
      </div>
    </div>
  );
}