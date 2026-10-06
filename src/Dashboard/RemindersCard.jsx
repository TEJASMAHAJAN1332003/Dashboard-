import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Check,
  Clock,
  Inbox,
} from "lucide-react";

const INITIAL_REMINDERS = [
  {
    id: 1,
    title: "Client Site Visit - Mr. Singhania",
    dueTime: "Today · 3:30 PM",
    priority: "High",
    assignee: "Pratik",
    type: "Site Visit",
    completed: false,
  },
  {
    id: 2,
    title: "Token Follow-up - Villa 4B Palm Woods",
    dueTime: "Tomorrow · 11:00 AM",
    priority: "Urgent",
    assignee: "Tejas",
    type: "Payment",
    completed: false,
  },
  {
    id: 3,
    title: "Document Verification - Lead #1042",
    dueTime: "Today · 5:00 PM",
    priority: "Medium",
    assignee: "Sachin",
    type: "KYC",
    completed: false,
  },
  {
    id: 4,
    title: "Agreement Finalization - DLF Phase 2",
    dueTime: "Oct 02 · 2:00 PM",
    priority: "High",
    assignee: "Swarupa",
    type: "Legal",
    completed: false,
  },
];

const PERIOD_OPTIONS = ["Today", "Last 7 Days", "Next 7 Days", "All Pending"];

const PRIORITY_BADGES = {
  Urgent: "bg-black text-white border-black",
  High: "bg-yellow-400 text-black border-yellow-400",
  Medium: "bg-yellow-50 text-black border-yellow-300",
  Low: "bg-neutral-50 text-neutral-600 border-neutral-200",
};

export default function RemindersCard({ className = "" }) {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [period, setPeriod] = useState("Last 7 Days");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [showEmptySample, setShowEmptySample] = useState(false);
  const periodRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const onDown = (e) => {
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleComplete = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const activeCount = reminders.filter((r) => !r.completed).length;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-sm">
            <Bell size={16} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold tracking-tight text-black">
                Reminder
              </h2>
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              Assigned Tasks &amp; Performance Actions
            </p>
          </div>
        </div>

        {/* Period Filter Dropdown */}
        <div className="flex items-center gap-1.5" ref={periodRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPeriodOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={periodOpen}
              className="flex h-7 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[11px] font-medium text-neutral-700 transition hover:border-black hover:bg-white hover:text-black active:scale-95"
            >
              <span>{period}</span>
              <ChevronDown
                size={12}
                className={`text-neutral-400 transition-transform duration-200 ${periodOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {periodOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18)]"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={period === opt}
                      onClick={() => {
                        setPeriod(opt);
                        setPeriodOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${period === opt
                        ? "bg-yellow-50 font-semibold text-black"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                        }`}
                    >
                      <span>{opt}</span>
                      {period === opt && (
                        <Check size={13} className="text-black" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="mt-3 min-h-[190px] flex-1 overflow-hidden">
        {showEmptySample ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 shadow-inner">
              <Inbox size={18} />
            </span>
            <p className="mt-2 text-xs font-semibold text-black">
              No Data Found!
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              No upcoming events found.
            </p>
            <button
              type="button"
              onClick={() => setShowEmptySample(false)}
              className="mt-2 text-[11px] font-medium text-black underline underline-offset-2 hover:text-neutral-600"
            >
              Load Pending Reminders
            </button>
          </div>
        ) : (
          /* Reminders List */
          <div className="h-full space-y-2 overflow-y-auto pr-1">
            {reminders.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleComplete(item.id)}
                className={`group/item flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all duration-200 ${item.completed
                  ? "border-neutral-100 bg-neutral-50/40 opacity-60"
                  : "border-neutral-100 bg-white hover:border-yellow-400 hover:shadow-sm"
                  }`}
              >
                {/* Left: Checkbox + Title + Time */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${item.completed
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white group-hover/item:border-black"
                      }`}
                  >
                    {item.completed && <Check size={11} strokeWidth={3} />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-xs font-semibold ${item.completed
                        ? "text-neutral-400 line-through"
                        : "text-black"
                        }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-400">
                      <Clock size={11} />
                      <span>{item.dueTime}</span>
                      <span>·</span>
                      <span className="font-medium text-neutral-500">
                        {item.assignee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Priority tag */}
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-semibold ${PRIORITY_BADGES[item.priority] ||
                    "border-neutral-200 bg-neutral-100 text-neutral-600"
                    }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
        <span>{activeCount} actions requiring follow-up</span>
        <button
          type="button"
          onClick={() => setShowEmptySample((v) => !v)}
          className="text-[10px] font-medium text-neutral-400 underline hover:text-black"
        >
          {showEmptySample ? "Show Reminders" : "Preview Zero State"}
        </button>
      </div>
    </div>
  );
}