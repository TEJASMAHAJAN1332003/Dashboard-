import { useEffect, useRef, useState } from "react";
import {
  X,
  Pencil,
  ChevronLeft,
  GripVertical,
  Check,
  Minus,
  ChevronDown,
  AlertCircle,
  Users,
  BarChart2,
  TrendingUp,
  Filter,
  Table2,
  Bell,
  PhoneCall,
  Target,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════
   Constants & default configs (exported so App.jsx can seed state)
════════════════════════════════════════════════════════════ */

/* ── Lead Bifurcation ── */
export const ALL_STATUSES = [
  "New",
  "Callback",
  "Pending",
  "Overdue",
  "Meeting Scheduled",
  "Site Visit Scheduled",
  "Meeting Done",
  "Site Visit Done",
  "Expression Of Interest",
];

const MAX_COUNT_OPTIONS = [10, 25, 50, 100, 200, 500];

export const DEFAULT_BIFURCATION = {
  order: ALL_STATUSES,
  selected: ALL_STATUSES,
  autoSelect: false,
  maxCount: 10,
  statuses: ALL_STATUSES, // final ordered list the dashboard cards render
};

/* ── Revenue ── */
const REVENUE_SCOPES = [
  { id: "deal", title: "Deal Value", sub: "track revenue from deal value" },
  { id: "brokerage", title: "Brokerage", sub: "track revenue from brokerage" },
];

export const DEFAULT_REVENUE = {
  scope: "deal", // "deal" | "brokerage"
  agentAccess: false,
};

/* ── Lead Funnel ── */
// Every lead status that can be mapped to a funnel stage (dropdown options)
export const FUNNEL_STATUSES = [
  "Booked",
  "Booking Cancel",
  "Callback",
  "Dropped",
  "Expression Of Interest",
  "Invoiced",
  "Meeting Done",
  "Meeting Scheduled",
  "New",
  "Not Interested",
  "Overdue",
  "Pending",
  "Site Visit Done",
  "Site Visit Scheduled",
];

const DEFAULT_STAGES = [
  { id: "s1", name: "Leads", statuses: ["New", "Callback", "Pending"] },
  { id: "s2", name: "Prospect", statuses: ["Meeting Scheduled", "Meeting Done"] },
  { id: "s3", name: "Opportunity", statuses: ["Site Visit Scheduled", "Site Visit Done"] },
  { id: "s4", name: "Booked", statuses: ["Expression Of Interest", "Booked"] },
  { id: "s5", name: "Invoiced", statuses: ["Invoiced"] },
];

export const DEFAULT_FUNNEL = {
  stages: DEFAULT_STAGES, // fixed rows (name + statuses)
  order: DEFAULT_STAGES.map((s) => s.id), // funnel order, set by drag
  ordered: DEFAULT_STAGES, // final ordered stages the dashboard funnel renders
};

/* ── Top Closures ── */
// Dropdown options, in the order shown in the dropdown
export const TOP_CLOSURE_STATUSES = [
  "Booked",
  "Booking Cancel",
  "Callback",
  "Dropped",
  "Expression Of Interest",
  "Invoiced",
  "Meeting Scheduled",
  "New",
  "Not Interested",
  "Pending",
  "Site Visit Scheduled",
  "Meeting Done",
  "Site Visit Done",
];

const TOP_SCOPES = [
  { id: "brokerage", title: "Total Brokerage Earned (default)", sub: "based on brokerage generated" },
  { id: "deal", title: "Total Deal Value", sub: "based on deal value generated" },
  { id: "booked", title: "No. of Booked", sub: "based on no. of booked leads" },
  { id: "site-visit", title: "Site Visit Done", sub: "based on completed site visits" },
  { id: "meeting", title: "Meeting Done", sub: "based on completed meetings" },
];

export const DEFAULT_TOP_CLOSURES = {
  statuses: ["Booked", "Expression Of Interest", "Invoiced", "Meeting Done", "Site Visit Done"],
  scope: "brokerage", // "brokerage" | "deal" | "booked" | "site-visit" | "meeting"
};

/* ── Widget registry (list view) ──
   NOTE: colors here are hex literals on purpose. WIDGETS is declared above
   ACCENT, so referencing ACCENT here would crash with
   "Cannot access 'ACCENT' before initialization". */
const WIDGETS = [
  {
    id: "lead-bifurcation",
    name: "Lead Bifurcation",
    description: "this widget will give you a quick breakdown of lead statuses and counts.",
    Icon: Table2,
    color: "#D4AF37",
    editable: true,
  },
  {
    id: "revenue",
    name: "Revenue",
    description: "this widget will provide a quick financial snapshot by role in base currency.",
    Icon: TrendingUp,
    color: "#D4AF37",
    editable: true,
  },
  {
    id: "lead-vs-source",
    name: "Lead Vs Source",
    description: "this widget will display the number of leads received from each source.",
    Icon: BarChart2,
    color: "#D4AF37",
  },
  {
    id: "lead-funnel",
    name: "Lead Funnel",
    description: "this widget will visualize leads through each lead stage.",
    Icon: Filter,
    color: "#D4AF37",
    editable: true,
  },
  {
    id: "top-closures",
    name: "Top Closures",
    description: "this widget will highlight top performers and their detailed metrics in one view.",
    Icon: Users,
    color: "#D4AF37",
    editable: true,
  },
  {
    id: "new-leads-intake",
    name: "New Leads Intake",
    description: "this widget will show new leads added within the select date range.",
    Icon: Target,
    color: "#D4AF37",
  },
  {
    id: "reminders",
    name: "Reminders",
    description: "this widget will highlight top performers and their detailed metrics in one view.",
    Icon: Bell,
    color: "#D4AF37",
  },
  {
    id: "agent-talktime",
    name: "Agent Talktime",
    description: "this widget will highlight top performers and their detailed metrics in one view.",
    Icon: PhoneCall,
    color: "#D4AF37",
  },
];

/* Theme (matches Lead Funnel: gold + black on white) */
const ACCENT = "#D4AF37"; // gold
const ACCENT_SOFT = "#fefce8"; // very light yellow (selected / drag backgrounds)
const INK = "#111111"; // black used on gold and for solid buttons
const RED = "#ef4444";

const cardStyle = {
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 14,
  marginBottom: 14,
};

const moveItem = (arr, from, to) => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/* ════════════════════════════════════════════════════════════
   Small shared UI pieces
════════════════════════════════════════════════════════════ */

function Box({ checked, indeterminate }) {
  const on = checked || indeterminate;
  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${on ? ACCENT : "#d4d4d4"}`,
        background: on ? ACCENT : "#fff",
        color: INK,
        transition: "all 0.15s",
      }}
    >
      {indeterminate ? (
        <Minus size={11} strokeWidth={3} />
      ) : checked ? (
        <Check size={11} strokeWidth={3} />
      ) : null}
    </span>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        padding: 0,
        flexShrink: 0,
        background: checked ? ACCENT : "#d4d4d4",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function CardHead({ title, sub, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>{title}</p>
        {sub && <p style={{ fontSize: 11, color: "#737373", margin: "2px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* Multi-select dropdown: chips + clear (×) + chevron, "Select All" + checklist */
function MultiSelect({ options, value, onChange, invalid, chipLimit = 1, wide = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const allChecked = options.length > 0 && options.every((o) => value.includes(o));
  const someChecked = value.length > 0 && !allChecked;

  const toggle = (o) =>
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  const toggleAll = () => onChange(allChecked ? [] : [...options]);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          minHeight: 40,
          padding: "5px 8px",
          borderRadius: 8,
          border: `1px solid ${invalid ? RED : open ? ACCENT : "#d4d4d4"}`,
          background: "#fff",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflow: "hidden",
          }}
        >
          {value.length === 0 && (
            <span style={{ fontSize: 12, color: "#a3a3a3" }}>Select status</span>
          )}
          {value.slice(0, chipLimit).map((v) => (
            <span
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                maxWidth: "100%",
                padding: "2px 6px",
                borderRadius: 4,
                background: "#e5e5e5",
                fontSize: 11.5,
                color: "#404040",
              }}
            >
              <X
                size={10}
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
              />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {v}
              </span>
            </span>
          ))}
          {value.length > chipLimit && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#525252", flexShrink: 0 }}>
              +{value.length - chipLimit}
            </span>
          )}
        </div>

        {value.length > 0 && (
          <X
            size={13}
            color="#737373"
            style={{ flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          />
        )}
        <ChevronDown size={14} color="#525252" style={{ flexShrink: 0 }} />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            ...(wide ? { left: 0, right: 0 } : { right: 0, width: 210 }),
            top: "100%",
            marginTop: 4,
            zIndex: 10,
            borderRadius: 12,
            border: "1px solid #e5e5e5",
            background: "#fff",
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            padding: 6,
          }}
        >
          <div
            onClick={toggleAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 8px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#0A0A0A",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box checked={allChecked} indeterminate={someChecked} />
            Select All
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {options.map((o) => {
              const checked = value.includes(o);
              return (
                <div
                  key={o}
                  onClick={() => toggle(o)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: checked ? 600 : 500,
                    color: "#262626",
                    background: checked ? ACCENT_SOFT : "transparent",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Box checked={checked} />
                  <span>{o}</span>
                </div>
              );
            })}
            {options.length === 0 && (
              <p style={{ fontSize: 12, color: "#a3a3a3", textAlign: "center", margin: "10px 0" }}>
                No statuses available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Radio cards (title + subtitle) */
function ScopeCards({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((r) => {
        const active = value === r.id;
        return (
          <div
            key={r.id}
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={() => onChange(r.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(r.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${active ? ACCENT : "#e5e5e5"}`,
              background: active ? ACCENT_SOFT : "#fff",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${active ? ACCENT : "#a3a3a3"}`,
                background: "#fff",
              }}
            >
              {active && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />
              )}
            </span>
            <span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>
                {r.title}
              </span>
              <span style={{ display: "block", fontSize: 11, color: "#a3a3a3" }}>{r.sub}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* A draggable row used by both "Display Order" lists */
function DragRow({ label, index, dragging, onDragStart, onDragOver, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 10px",
        borderRadius: 7,
        border: "1px solid #e5e5e5",
        background: dragging ? ACCENT_SOFT : "#f7f7f7",
        opacity: dragging ? 0.7 : 1,
        fontSize: 12.5,
        color: "#262626",
        cursor: "move",
        userSelect: "none",
      }}
    >
      <GripVertical size={13} color="#a3a3a3" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#525252" }}>{index + 1}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EditWidgetsPanel
   Props:
     open / onClose
     bifurcation, onApplyBifurcation   – Lead Bifurcation config
     revenue,     onApplyRevenue       – Revenue config
     funnel,      onApplyFunnel        – Lead Funnel config
     topClosures, onApplyTopClosures   – Top Closures config
     statusCounts                      – optional { [status]: number }, used by
                                         "Auto-Select Top Statuses"
════════════════════════════════════════════════════════════ */
export default function EditWidgetsPanel({
  open,
  onClose,
  bifurcation = DEFAULT_BIFURCATION,
  onApplyBifurcation,
  revenue = DEFAULT_REVENUE,
  onApplyRevenue,
  funnel = DEFAULT_FUNNEL,
  onApplyFunnel,
  topClosures = DEFAULT_TOP_CLOSURES,
  onApplyTopClosures,
  statusCounts,
}) {
  const [editingId, setEditingId] = useState(null); // null = widget list

  /* Lead Bifurcation draft */
  const [order, setOrder] = useState(bifurcation.order);
  const [selected, setSelected] = useState(bifurcation.selected);
  const [autoSelect, setAutoSelect] = useState(bifurcation.autoSelect);
  const [maxCount, setMaxCount] = useState(bifurcation.maxCount);
  const [countOpen, setCountOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  /* Revenue draft */
  const [scope, setScope] = useState(revenue.scope);
  const [agentAccess, setAgentAccess] = useState(revenue.agentAccess);

  /* Lead Funnel draft */
  const [stages, setStages] = useState(funnel.stages);
  const [stageOrder, setStageOrder] = useState(funnel.order);
  const [stageDragIdx, setStageDragIdx] = useState(null);
  const [funnelTried, setFunnelTried] = useState(false);

  /* Top Closures draft */
  const [topStatuses, setTopStatuses] = useState(topClosures.statuses);
  const [topScope, setTopScope] = useState(topClosures.scope);

  const [toastMsg, setToastMsg] = useState("");
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(null);
  const countRef = useRef(null);

  /* Re-sync every draft with the applied configs each time the panel opens */
  useEffect(() => {
    if (!open) return;
    setEditingId(null);
    setOrder(bifurcation.order);
    setSelected(bifurcation.selected);
    setAutoSelect(bifurcation.autoSelect);
    setMaxCount(bifurcation.maxCount);
    setCountOpen(false);
    setScope(revenue.scope);
    setAgentAccess(revenue.agentAccess);
    setStages(funnel.stages);
    setStageOrder(funnel.order);
    setFunnelTried(false);
    setTopStatuses(topClosures.statuses);
    setTopScope(topClosures.scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Close the count dropdown on outside click */
  useEffect(() => {
    if (!countOpen) return;
    const onDown = (e) => {
      if (countRef.current && !countRef.current.contains(e.target)) setCountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [countOpen]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 3000);
  };

  /* ── Lead Bifurcation helpers ── */
  const displayOrder = order.filter((s) => selected.includes(s));
  const allSelected = selected.length === ALL_STATUSES.length;

  const toggleStatus = (s) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleDragOver = (e, overIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === overIdx) return;
    const next = moveItem(displayOrder, dragIdx, overIdx);
    // keep unselected statuses at the end of the full order
    setOrder([...next, ...order.filter((s) => !selected.includes(s))]);
    setDragIdx(overIdx);
  };

  const applyBifurcation = () => {
    let statuses = displayOrder;
    if (autoSelect && statusCounts) {
      statuses = [...displayOrder].sort(
        (a, b) => (statusCounts[b] ?? 0) - (statusCounts[a] ?? 0)
      );
    }
    statuses = statuses.slice(0, maxCount);
    onApplyBifurcation?.({ order, selected, autoSelect, maxCount, statuses });
    onClose();
    showToast("Lead bifurcation settings updated successfully!");
  };

  /* ── Revenue ── */
  const applyRevenue = () => {
    onApplyRevenue?.({ scope, agentAccess });
    onClose();
    showToast("Revenue settings updated successfully!");
  };

  /* ── Lead Funnel helpers ── */
  const updateStage = (id, patch) =>
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // A status can belong to only one stage: hide ones used by the other stages
  const optionsFor = (stage) => {
    const usedElsewhere = new Set(
      stages.filter((s) => s.id !== stage.id).flatMap((s) => s.statuses)
    );
    return FUNNEL_STATUSES.filter((st) => !usedElsewhere.has(st));
  };

  const orderedStages = stageOrder
    .map((id) => stages.find((s) => s.id === id))
    .filter(Boolean);

  const handleStageDragOver = (e, overIdx) => {
    e.preventDefault();
    if (stageDragIdx === null || stageDragIdx === overIdx) return;
    setStageOrder(moveItem(stageOrder, stageDragIdx, overIdx));
    setStageDragIdx(overIdx);
  };

  const applyFunnel = () => {
    const invalid = stages.some((s) => !s.name.trim() || s.statuses.length === 0);
    if (invalid) {
      setFunnelTried(true);
      return;
    }
    const cleaned = stages.map((s) => ({ ...s, name: s.name.trim() }));
    const ordered = stageOrder.map((id) => cleaned.find((s) => s.id === id));
    onApplyFunnel?.({ stages: cleaned, order: stageOrder, ordered });
    onClose();
    showToast("Lead funnel settings updated successfully!");
  };

  /* ── Top Closures ── */
  const applyTopClosures = () => {
    onApplyTopClosures?.({ statuses: topStatuses, scope: topScope });
    onClose();
    showToast("Top closures settings updated successfully!");
  };

  const handleApply = () => {
    if (editingId === "lead-bifurcation") applyBifurcation();
    else if (editingId === "revenue") applyRevenue();
    else if (editingId === "lead-funnel") applyFunnel();
    else if (editingId === "top-closures") applyTopClosures();
  };

  const editingWidget = WIDGETS.find((w) => w.id === editingId);
  const applyDisabled =
    (editingId === "lead-bifurcation" && displayOrder.length === 0) ||
    (editingId === "top-closures" && topStatuses.length === 0);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.45)",
          transition: "opacity 0.3s, visibility 0.3s",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Slide-in panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Edit Widgets"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 50,
          height: "100%",
          width: "420px",
          maxWidth: "100vw",
          background: "#fff",
          borderLeft: "1px solid #e5e5e5",
          boxShadow: open ? "-20px 0 60px rgba(0,0,0,0.25)" : "none",
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
          transition:
            "transform 0.32s cubic-bezier(0.4,0,0.2,1), visibility 0.32s, box-shadow 0.32s",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "16px 18px 12px",
            background: INK,
            borderBottom: `2px solid ${ACCENT}`,
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>Leads</p>
            <p style={{ fontSize: 12, color: "#d4d4d4", margin: "2px 0 0" }}>
              Easily update lead module widgets
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close panel"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* ═════════ LIST VIEW ═════════ */}
        {!editingWidget && (
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 16px" }}>
            {WIDGETS.map(({ id, name, description, Icon, color, editable }) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 50,
                    borderRadius: 12,
                    background: INK,
                    border: "1px solid #262626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={color} strokeWidth={2} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
                    {name}
                  </p>
                  <p style={{ fontSize: 12, color: "#737373", margin: "3px 0 0", lineHeight: 1.4 }}>
                    {description}
                  </p>
                </div>

                {editable && (
                  <button
                    onClick={() => setEditingId(id)}
                    title={`Edit ${name}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      border: "1px solid #e5e5e5",
                      background: "#fff",
                      color: "#525252",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═════════ EDITOR VIEWS ═════════ */}
        {editingWidget && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 16px" }}>
              {/* Back + title */}
              <button
                onClick={() => setEditingId(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  background: "transparent",
                  padding: "6px 0 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                {editingWidget.name}
              </button>

              {/* ───── LEAD BIFURCATION ───── */}
              {editingId === "lead-bifurcation" && (
                <>
                  <div style={cardStyle}>
                    <CardHead
                      title="Available Statuses"
                      sub="Select status to display on the dashboard"
                      right={
                        <button
                          onClick={() => setSelected(ALL_STATUSES)}
                          disabled={allSelected}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 12,
                            fontWeight: 600,
                            color: allSelected ? "#a3a3a3" : "#0A0A0A",
                            textDecoration: "underline",
                            cursor: allSelected ? "default" : "pointer",
                            padding: 0,
                          }}
                        >
                          Select All
                        </button>
                      }
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {ALL_STATUSES.map((s) => (
                        <div
                          key={s}
                          onClick={() => toggleStatus(s)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid #e5e5e5",
                            background: "#fff",
                            fontSize: 12.5,
                            color: "#262626",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <Box checked={selected.includes(s)} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.15fr 1fr",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
                      <CardHead title="Display Order" sub="Drag to reorder selected statuses" />
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {displayOrder.map((s, idx) => (
                          <DragRow
                            key={s}
                            label={s}
                            index={idx}
                            dragging={dragIdx === idx}
                            onDragStart={() => setDragIdx(idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={() => setDragIdx(null)}
                          />
                        ))}
                        {displayOrder.length === 0 && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#a3a3a3",
                              textAlign: "center",
                              padding: "14px 0",
                              margin: 0,
                            }}
                          >
                            No statuses selected
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
                      <CardHead title="Default Settings" sub="top 10 statuses by frequency" />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#262626" }}>
                          Auto-Select Top Statuses
                        </span>
                        <Switch checked={autoSelect} onChange={setAutoSelect} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#262626" }}>Maximum Display Count</span>
                        <div style={{ position: "relative" }} ref={countRef}>
                          <button
                            type="button"
                            onClick={() => setCountOpen((v) => !v)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 7,
                              border: "1px solid #d4d4d4",
                              background: "#fff",
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "#0A0A0A",
                              cursor: "pointer",
                            }}
                          >
                            {maxCount}
                            <ChevronDown size={13} />
                          </button>
                          {countOpen && (
                            <ul
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                marginTop: 4,
                                zIndex: 5,
                                listStyle: "none",
                                padding: 4,
                                width: 64,
                                borderRadius: 8,
                                border: "1px solid #e5e5e5",
                                background: "#fff",
                                boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
                              }}
                            >
                              {MAX_COUNT_OPTIONS.map((n) => (
                                <li key={n}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMaxCount(n);
                                      setCountOpen(false);
                                    }}
                                    style={{
                                      width: "100%",
                                      textAlign: "left",
                                      padding: "6px 8px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: n === maxCount ? ACCENT_SOFT : "transparent",
                                      fontSize: 12.5,
                                      fontWeight: n === maxCount ? 600 : 400,
                                      color: "#262626",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {n}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ───── REVENUE ───── */}
              {editingId === "revenue" && (
                <>
                  {/* Revenue Scope */}
                  <div style={cardStyle}>
                    <CardHead title="Revenue Scope" sub="Select which revenue type to track" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {REVENUE_SCOPES.map((r) => {
                        const active = scope === r.id;
                        return (
                          <div
                            key={r.id}
                            role="radio"
                            aria-checked={active}
                            tabIndex={0}
                            onClick={() => setScope(r.id)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") && setScope(r.id)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: 8,
                              border: `1px solid ${active ? ACCENT : "#e5e5e5"}`,
                              background: active ? ACCENT_SOFT : "#fff",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `1px solid ${active ? ACCENT : "#a3a3a3"}`,
                                background: "#fff",
                              }}
                            >
                              {active && (
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: ACCENT,
                                  }}
                                />
                              )}
                            </span>
                            <span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#0A0A0A",
                                }}
                              >
                                {r.title}
                              </span>
                              <span style={{ display: "block", fontSize: 11, color: "#a3a3a3" }}>
                                {r.sub}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Currency Setting (fixed) */}
                  <div style={cardStyle}>
                    <CardHead
                      title="Currency Setting"
                      sub="Manage agent access to revenue widget"
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: 10,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>
                        Base Currency Only
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>
                        INR (₹)
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "#737373", margin: "4px 0 10px" }}>
                      All revenue data will be displayed in system base currency
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #fde68a",
                        background: "#fffbeb",
                      }}
                    >
                      <AlertCircle
                        size={15}
                        color="#d97706"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span>
                        <span
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#b45309",
                          }}
                        >
                          Fixed Setting
                        </span>
                        <span style={{ display: "block", fontSize: 11.5, color: "#b45309" }}>
                          Currency selection is not available for this widget
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div style={cardStyle}>
                    <CardHead
                      title="Access Control"
                      sub="Only admin can modify these settings"
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: 10,
                      }}
                    >
                      <span>
                        <span
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0A0A0A",
                          }}
                        >
                          Agent Widget Access
                        </span>
                        <span style={{ display: "block", fontSize: 11, color: "#737373" }}>
                          Allow agent to view revenue analytics widgets
                        </span>
                      </span>
                      <Switch checked={agentAccess} onChange={setAgentAccess} />
                    </div>
                  </div>
                </>
              )}

              {/* ───── LEAD FUNNEL ───── */}
              {editingId === "lead-funnel" && (
                <>
                  <div style={cardStyle}>
                    <CardHead
                      title="Stage Rename"
                      sub="Name your stages the way you want"
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {stages.map((stage) => {
                        const nameBad = funnelTried && !stage.name.trim();
                        const statusBad = funnelTried && stage.statuses.length === 0;
                        return (
                          <div
                            key={stage.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                              alignItems: "start",
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: "#262626",
                                  marginBottom: 5,
                                }}
                              >
                                Name<span style={{ color: RED }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={stage.name}
                                onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                                style={{
                                  width: "100%",
                                  height: 40,
                                  boxSizing: "border-box",
                                  padding: "0 10px",
                                  borderRadius: 8,
                                  border: `1px solid ${nameBad ? RED : "#d4d4d4"}`,
                                  background: "#fff",
                                  fontSize: 13,
                                  color: "#0A0A0A",
                                  outline: "none",
                                }}
                                onFocus={(e) => !nameBad && (e.target.style.borderColor = ACCENT)}
                                onBlur={(e) =>
                                  (e.target.style.borderColor = nameBad ? RED : "#d4d4d4")
                                }
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: "#262626",
                                  marginBottom: 5,
                                }}
                              >
                                Status<span style={{ color: RED }}>*</span>
                              </label>
                              <MultiSelect
                                options={optionsFor(stage)}
                                value={stage.statuses}
                                onChange={(v) => updateStage(stage.id, { statuses: v })}
                                invalid={statusBad}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {funnelTried &&
                      stages.some((s) => !s.name.trim() || s.statuses.length === 0) && (
                        <p style={{ fontSize: 11.5, color: RED, margin: "10px 0 0" }}>
                          Every stage needs a name and at least one status.
                        </p>
                      )}
                  </div>

                  <div
                    style={{
                      width: "50%",
                      minWidth: 180,
                      border: "1px solid #e5e5e5",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <CardHead title="Display Order" sub="Drag to reorder selected statuses" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {orderedStages.map((s, idx) => (
                        <DragRow
                          key={s.id}
                          label={s.name || "Untitled"}
                          index={idx}
                          dragging={stageDragIdx === idx}
                          onDragStart={() => setStageDragIdx(idx)}
                          onDragOver={(e) => handleStageDragOver(e, idx)}
                          onDragEnd={() => setStageDragIdx(null)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ───── TOP CLOSURES ───── */}
              {editingId === "top-closures" && (
                <>
                  <div style={cardStyle}>
                    <CardHead
                      title="Status Visibility"
                      sub="Control which tenant statuses are displayed"
                    />
                    <label
                      style={{
                        display: "block",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#262626",
                        marginBottom: 6,
                      }}
                    >
                      Select Visible Statuses
                    </label>
                    <MultiSelect
                      wide
                      chipLimit={2}
                      options={TOP_CLOSURE_STATUSES}
                      value={topStatuses}
                      onChange={(v) =>
                        setTopStatuses(TOP_CLOSURE_STATUSES.filter((s) => v.includes(s)))
                      }
                    />

                    <p style={{ fontSize: 12, color: "#737373", margin: "14px 0 8px" }}>Selected</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {topStatuses.map((s) => (
                        <span
                          key={s}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: "#efefef",
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: "#262626",
                          }}
                        >
                          {s}
                          <X
                            size={12}
                            color="#525252"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => setTopStatuses((prev) => prev.filter((x) => x !== s))}
                          />
                        </span>
                      ))}
                      {topStatuses.length === 0 && (
                        <span style={{ fontSize: 12, color: "#a3a3a3" }}>No statuses selected</span>
                      )}
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <CardHead title="Scope" sub="Select which revenue type to track" />
                    <ScopeCards options={TOP_SCOPES} value={topScope} onChange={setTopScope} />
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div
              style={{
                borderTop: "1px solid #e5e5e5",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 18,
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#262626",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applyDisabled}
                style={{
                  borderRadius: 12,
                  border: "none",
                  background: INK,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#facc15",
                  cursor: applyDisabled ? "not-allowed" : "pointer",
                  opacity: applyDisabled ? 0.5 : 1,
                }}
              >
                Apply Setting
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ── Success toast ── */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
          maxWidth: 280,
          padding: "14px 18px",
          borderRadius: 12,
          background: INK,
          border: "1px solid #262626",
          color: "#fff",
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.35,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          transition: "opacity 0.25s, transform 0.25s, visibility 0.25s",
          opacity: toast ? 1 : 0,
          transform: toast ? "translateY(0)" : "translateY(-12px)",
          visibility: toast ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      >
        <span>{toastMsg}</span>
        <Check size={26} strokeWidth={2.4} color={ACCENT} style={{ flexShrink: 0 }} />
      </div>
    </>
  );
}