import { useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CheckSquare,
  Plus,
  Search,
  Check,
  Trash2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import AddTaskForm from "./AddTaskForm.jsx";

const CARDS = [
  { key: "today", title: "Today", icon: CalendarDays },
  { key: "upcoming", title: "Upcoming", icon: CalendarCheck },
  { key: "overdue", title: "Overdue", icon: CalendarX },
  { key: "completed", title: "Completed", icon: CheckSquare },
  { key: "all", title: "All Tasks", icon: LayoutGrid },
];

const PRIORITY_STYLES = {
  Critical: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  High: { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  Medium: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  Low: { dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200" },
};

const CARD_STYLES = [
  { from: "#D4AF37", to: "#b8960c" },
  { from: "#111111", to: "#2f2f2f" },
  { from: "#6b6b6b", to: "#404040" },
  { from: "#2f2f2f", to: "#111111" },
  { from: "#D4AF37", to: "#111111" },
];

const initialTasks = [
  {
    id: 1,
    title: "Sample task 1",
    assignTo: "Pratik Prakash",
    dueAt: "2026-09-01T10:00",
    description: "Follow up with client regarding property brochure.",
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Sample task 2",
    assignTo: "Tejas",
    dueAt: "2026-09-10T12:00",
    description: "Schedule site visit for 3BHK unit.",
    priority: "Low",
    completed: false,
  },
];

function getCounts(tasks) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const open = tasks.filter((t) => !t.completed);
  const due = (t) => new Date(t.dueAt);

  return {
    today: open.filter((t) => due(t) >= startOfToday && due(t) < endOfToday).length,
    upcoming: open.filter((t) => due(t) >= endOfToday).length,
    overdue: open.filter((t) => due(t) < startOfToday).length,
    completed: tasks.filter((t) => t.completed).length,
    all: tasks.length,
  };
}

function filterTasks(tasks, filterKey) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const due = (t) => new Date(t.dueAt);

  switch (filterKey) {
    case "today":
      return tasks.filter((t) => !t.completed && due(t) >= startOfToday && due(t) < endOfToday);
    case "upcoming":
      return tasks.filter((t) => !t.completed && due(t) >= endOfToday);
    case "overdue":
      return tasks.filter((t) => !t.completed && due(t) < startOfToday);
    case "completed":
      return tasks.filter((t) => t.completed);
    default:
      return tasks;
  }
}

function formatDue(dueAt) {
  if (!dueAt) return "—";
  const d = new Date(dueAt);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Task() {
  const [tasks, setTasks] = useState(initialTasks);
  const [formOpen, setFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = getCounts(tasks);

  const handleSave = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const visible = filterTasks(tasks, activeFilter).filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-4 sm:p-6 pb-10">
      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0A0A0A]">Manage Tasks</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Track, assign and manage all your team tasks</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)] transition hover:bg-neutral-800 active:scale-95"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const style = CARD_STYLES[i];
          const isActive = activeFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setActiveFilter(card.key)}
              className={`group flex min-w-[160px] flex-1 cursor-pointer flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 ${
                isActive
                  ? "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] scale-[1.02]"
                  : "hover:scale-[1.01] hover:shadow-md"
              }`}
              style={{
                background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
                opacity: isActive ? 1 : 0.85,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-white/15 p-1.5 text-white">
                  <Icon size={15} strokeWidth={2} />
                </span>
                {isActive && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold tabular-nums text-white">{counts[card.key]}</p>
                <p className="text-[11px] font-medium text-white/80">{card.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Task List ── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#D4AF37]">
              <LayoutList size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-black">
                {CARDS.find((c) => c.key === activeFilter)?.title || "All Tasks"}
              </p>
              <p className="text-[11px] text-neutral-500">{visible.length} task{visible.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 w-40 rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs text-black outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white sm:w-52"
            />
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>

        {/* Task rows */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <CalendarDays size={22} />
            </span>
            <p className="mt-3 text-sm font-semibold text-black">No Tasks Found</p>
            <p className="mt-1 text-xs text-neutral-500">
              {search ? "Try clearing your search" : "Add a new task to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {visible.map((task) => {
              const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES["Low"];
              return (
                <div
                  key={task.id}
                  className={`group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-50/60 ${
                    task.completed ? "opacity-55" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                      task.completed
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                        : "border-neutral-300 bg-white hover:border-black"
                    }`}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed && <Check size={12} strokeWidth={3} />}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          task.completed ? "text-neutral-400 line-through" : "text-black"
                        }`}
                      >
                        {task.title}
                      </p>
                      {/* Priority badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{task.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
                      <span>
                        <b className="font-medium text-neutral-600">Assigned:</b> {task.assignTo}
                      </span>
                      <span>
                        <b className="font-medium text-neutral-600">Due:</b> {formatDue(task.dueAt)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="mt-0.5 hidden shrink-0 items-center justify-center rounded-lg p-1.5 text-neutral-300 transition hover:bg-red-50 hover:text-red-500 group-hover:flex"
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 text-[11px] text-neutral-400">
          <span>{counts.completed} of {counts.all} tasks completed</span>
          <span className="font-medium text-neutral-500">
            {counts.overdue > 0 && (
              <span className="text-orange-500 font-semibold">{counts.overdue} overdue</span>
            )}
            {counts.overdue === 0 && "All caught up 🎉"}
          </span>
        </div>
      </div>

      <AddTaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default Task;