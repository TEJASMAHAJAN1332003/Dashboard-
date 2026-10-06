import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";

export const ALL_EMPLOYEES = [
  { id: "you", name: "You", team: "Management", role: "Team Lead" },
  { id: "amit", name: "Amit Sharma", team: "Blisss 2 East", role: "Senior Sales Lead" },
  { id: "ankush", name: "Ankush Kanojiya", team: "Blisss 2 East", role: "Sales Associate" },
  { id: "arhum", name: "Arhum Sayyed", team: "Blisss 2 East", role: "Sales Consultant" },
  { id: "ayush", name: "Ayush Kalia", team: "Sterling Sales", role: "Property Advisor" },
  { id: "blisss", name: "Blisss 2 East", team: "Blisss 2 East", role: "Branch Lead" },
  { id: "dhairya", name: "Dhairya Kakkad", team: "Sterling Sales", role: "Client Advisor" },
  { id: "avdhut", name: "Avdhut kale", team: "West Closers", role: "Senior Sales Manager" },
  { id: "santosh", name: "Santosh Prajapati", team: "West Closers", role: "Sales Manager" },
  { id: "saurabh", name: "Saurabh Navale", team: "Sterling Sales", role: "Sales Manager" },
  { id: "sneha", name: "Sneha Kulkarni", team: "West Closers", role: "Sales Executive" },
  { id: "sachin", name: "Sachin Mohite", team: "Enterprise Solutions", role: "Key Account Manager" },
  { id: "rohit", name: "Rohit Veer", team: "Enterprise Solutions", role: "Sales Associate" },
  { id: "swarupa", name: "Swarupa Shinde", team: "Enterprise Solutions", role: "Client Advisor" },
  { id: "tejas", name: "Tejas", team: "Enterprise Solutions", role: "Property Consultant" },
];

/**
 * AgentsPopup Component
 * Replicates the screenshot dropdown popup:
 * - Header with "Agents" and "With Team" checkbox button
 * - Search bar with "type to search" placeholder and search icon
 * - List of agents/employees with rounded square checkboxes
 * - "With Team" toggles team-alignment, automatically grouping and selecting
 *   all team members of the selected agent.
 */
export default function AgentsPopup({
  selectedIds = ["amit"],
  onSelectedChange,
  withTeam = false,
  onWithTeamChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter agents according to the search query
  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_EMPLOYEES;
    return ALL_EMPLOYEES.filter(
      (agent) =>
        agent.name.toLowerCase().includes(q) ||
        agent.team.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Toggle "With Team" mode and align users with their team members
  const handleToggleWithTeam = () => {
    const nextWithTeam = !withTeam;
    onWithTeamChange?.(nextWithTeam);

    if (nextWithTeam && selectedIds.length > 0) {
      // Find all teams represented by current selections and align team members
      const activeTeams = new Set(
        ALL_EMPLOYEES.filter((a) => selectedIds.includes(a.id)).map((a) => a.team)
      );
      const alignedIds = ALL_EMPLOYEES.filter((a) => activeTeams.has(a.team)).map(
        (a) => a.id
      );
      onSelectedChange?.(alignedIds);
    }
  };

  // Toggle selection of an individual agent (or whole team if withTeam is active)
  const handleAgentClick = (agent) => {
    const isCurrentlySelected = selectedIds.includes(agent.id);

    if (withTeam) {
      // Find all members in the same team
      const teamMemberIds = ALL_EMPLOYEES.filter((a) => a.team === agent.team).map(
        (a) => a.id
      );

      if (isCurrentlySelected) {
        // Deselect all team members
        const next = selectedIds.filter((id) => !teamMemberIds.includes(id));
        onSelectedChange?.(next);
      } else {
        // Select all team members together (align user with their team)
        const next = Array.from(new Set([...selectedIds, ...teamMemberIds]));
        onSelectedChange?.(next);
      }
    } else {
      // Individual agent toggle
      if (isCurrentlySelected) {
        onSelectedChange?.(selectedIds.filter((id) => id !== agent.id));
      } else {
        onSelectedChange?.([...selectedIds, agent.id]);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Agents selection popup"
      className="absolute left-0 top-full z-50 mt-2 w-[240px] rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── HEADER: "Agents" + "With Team" toggle ── */}
      <div className="flex items-center justify-between pb-2.5">
        <span className="text-[14px] font-semibold tracking-tight text-neutral-800">
          Agents
        </span>

        <button
          type="button"
          onClick={handleToggleWithTeam}
          className="group flex cursor-pointer items-center gap-1.5 select-none focus:outline-none"
          title="Align selected user with their team members"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
              withTeam
                ? "border-[#6b7280] bg-[#6b7280] text-white"
                : "border-neutral-300 bg-white group-hover:border-neutral-400"
            }`}
          >
            {withTeam && <Check size={11} strokeWidth={3} />}
          </span>
          <span className="text-[12px] font-medium text-neutral-600 transition-colors group-hover:text-neutral-900">
            With Team
          </span>
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative mb-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="type to search"
          className="w-full rounded-full border border-neutral-200 bg-[#FAFAFA] py-1 pl-3.5 pr-8 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#9ca3af] focus:bg-white focus:outline-none transition-colors"
        />
        <Search
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
      </div>

      {/* ── AGENTS / EMPLOYEES LIST ── */}
      <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
        {filteredAgents.map((agent) => {
          const isSelected = selectedIds.includes(agent.id);

          return (
            <div
              key={agent.id}
              onClick={() => handleAgentClick(agent)}
              className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-100/70 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Rounded square checkbox */}
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                    isSelected
                      ? "border-[#9ca3af] bg-[#9ca3af] text-white"
                      : "border-neutral-300 bg-white group-hover:border-neutral-400"
                  }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </span>

                {/* Name */}
                <span
                  className={`truncate text-[13px] ${
                    isSelected
                      ? "font-medium text-neutral-800"
                      : "font-normal text-neutral-700 group-hover:text-neutral-900"
                  }`}
                >
                  {agent.name}
                </span>
              </div>

              {/* Team alignment tag shown when "With Team" is active */}
              {withTeam && (
                <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 max-w-[70px] truncate">
                  {agent.team}
                </span>
              )}
            </div>
          );
        })}

        {filteredAgents.length === 0 && (
          <div className="py-4 text-center text-xs text-neutral-400">
            No agents found
          </div>
        )}
      </div>

      {/* ── FOOTER: Selection summary & clear ── */}
      {selectedIds.length > 0 && (
        <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
          <span>
            {selectedIds.length} {selectedIds.length === 1 ? "agent" : "agents"}
            {withTeam && " (aligned)"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectedChange?.([]);
            }}
            className="font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
