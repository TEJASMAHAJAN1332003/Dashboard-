# 📊 Sales Dashboard — CRM Team Dashboard

A rich, real-time CRM dashboard built with **React + Vite + Tailwind CSS**, featuring animated widgets, agent talktime tracking, lead funnel visualization, revenue reporting, and an attendance clock system.

---

## 🗂 Project Structure

```
src/
├── App.jsx                        # Root layout & page assembly
├── Dashboard/
│   ├── Dashboard1.jsx             # Top navigation header with dashboard switcher
│   ├── TotalLeadsCard.jsx         # Lead count card with animated bar chart
│   ├── DataTable.jsx              # Leads table with tab filtering & search
│   ├── ClockCard.jsx              # Attendance clock-in/out widget
│   ├── RevenueWidget.jsx          # Revenue metrics with period selectors & sparklines
│   ├── RevenueEntityBreakdown.jsx # Revenue breakdown by entity (pie + table)
│   ├── LeadsVsSource.jsx          # Lead source distribution (table & bar views)
│   ├── LeadFunnel.jsx             # CRM pipeline funnel (SVG ribbon stages)
│   ├── TopClosersCard.jsx         # Leaderboard for top-performing agents
│   ├── NewLeadIntakeCard.jsx      # Lead intake metrics (Total / Data / Direct)
│   ├── RemindersCard.jsx          # Task reminders with priority & assignee
│   ├── AgentTalktimeTable.jsx     # 12-column agent call performance table
│   ├── revenueData.js             # Static revenue dataset
│   └── revenueUtils.js            # Shared utilities (countUp hook, formatINR, sparkline gen)
```

---

## 🧱 Layout Architecture

### Row 1 — Summary Row (App.jsx)
```
[ TotalLeadsCard (260px) ] [ DataTable (flex-1) ] [ ClockCard (240px) ]
```
- Uses a **flex row** with `min-height: 340px` to ensure consistent height across all three cards.
- Each column is wrapped in `flex flex-col` so child components can use `flex-1` to fill the available height.

### Row 2 — Revenue & Source Row
```
[ RevenueWidget (50%) ] [ LeadsVsSource (50%) ]
```
- Uses CSS Grid with `min-height: 300px`.

### Row 3 — Lead Funnel (Full Width)

### Row 4 — Agents & Reminders
```
[ TopClosersCard (33%) ] [ NewLeadIntakeCard (33%) ] [ RemindersCard (33%) ]
```

### Row 5 — Agent Talktime Table (Full Width)

---

## 🐛 Bug Fixes (v1.1.0 — 2026-09-30)

### Root Cause Analysis
Multiple layout components used `justify-between` at their **root flex column**, which is only appropriate when the container has a fixed known height. In a responsive layout where card heights are determined by content, `justify-between` caused:
- Footer elements being pushed to the very bottom of the viewport
- Table rows stacking at the bottom of cards
- Inconsistent spacing between header and body sections

Additionally, wrapper divs in `App.jsx` for `TotalLeadsCard`, `DataTable`, and `ClockCard` did not propagate height to their children, so `h-full` on child components had nothing to latch onto.

---

### Fix 1 — App.jsx Row 1 height propagation
**Problem:** The flex row wrapper divs around `TotalLeadsCard`, `DataTable`, and `ClockCard` had no flex-direction, so child `h-full` or `flex-1` had no effect.

**Fix:** Added `flex flex-col` to each wrapper and a `min-height: 340px` on the section element. This creates a proper height context for children.

---

### Fix 2 — DataTable.jsx flex-1 propagation + overflow
**Problem:** Root div used `h-full` (which resolved to nothing since parent had no height). The table body wrapper was `overflow-x-auto` only, which allowed the table to grow past the card boundary.

**Fix:** Changed root to `flex-1` (fills flex column parent), added `overflow-y-auto` to the body wrapper so rows scroll inside the card rather than overflowing.

---

### Fix 3 — ClockCard.jsx flex-1 fill
**Problem:** Card used `max-w-[240px] h-full` — the `h-full` resolved to nothing without a flex-col parent context. Card appeared collapsed/floating.

**Fix:** Replaced `max-w / h-full` with `flex-1` so the card always fills its flex-column parent.

---

### Fix 4 — TotalLeadsCard.jsx flex-1 fill
**Problem:** Same as ClockCard — used `max-w-[260px] h-full` which resolved to nothing.

**Fix:** Replaced with `flex-1` to fill column parent.

---

### Fix 5 — Removed justify-between from card roots (global pattern fix)
**Problem:** All major card components used `justify-between` on their root `flex flex-col` div. In a content-driven layout, `justify-between` pushes the footer / last element to the very bottom of the available space, creating visually broken gaps.

**Fix:** Removed `justify-between` from all card roots. The flex layout with `gap` and `mt-*` margin utilities on child sections provides proper natural spacing.

**Affected files:**
- AgentTalktimeTable.jsx
- TopClosersCard.jsx
- NewLeadIntakeCard.jsx
- RemindersCard.jsx
- RevenueWidget.jsx
- LeadsVsSource.jsx
- LeadFunnel.jsx

---

### Fix 6 — AgentTalktimeTable.jsx table body min-height
**Problem:** The table body container had `min-h-[220px]` which was too small.

**Fix:** Increased to `min-h-[250px]` for breathing room.

---

## 🔑 Key Design Principles

> Rules the codebase MUST follow going forward.

1. **Never use `justify-between` on a `flex-col` root unless the container has a fixed/known height.** Use `gap`, `mt-*`, and `pt-*` for spacing instead.

2. **For height propagation in flex layouts:** the chain must be `parent: flex flex-col` then `child: flex-1`. If any link in the chain is missing, `flex-1` / `h-full` silently resolves to nothing.

3. **Use `min-height` on section rows** rather than relying on dynamic card content to define row heights. This prevents row collapsing on sparse data.

4. **Scrollable areas inside cards** should use `overflow-y-auto` not `overflow-hidden` unless you explicitly want to clip content.

5. **`max-w-*` constraints** should live on the **wrapper in the parent layout**, not inside the component itself. A component should not know its own max-width — that is a layout concern.

---

## 🚀 Running Locally

```bash
cd task_manager
npm install
npm run dev
```

App will be available at http://localhost:5173

---

## 🛠 Tech Stack

| Technology       | Purpose                              |
|-----------------|--------------------------------------|
| React 18         | Component framework                  |
| Vite             | Dev server & bundler                 |
| Tailwind CSS     | Utility-first styling                |
| Lucide React     | Icon library                         |
| React Router DOM | Client-side routing (task sub-routes) |

---

## 📋 Known Limitations / TODO

- All data is mocked (static const arrays) — needs API integration layer
- ClockCard attendance state resets on page refresh — needs localStorage persistence
- No mobile breakpoint optimization for Row 1 (3-column flex collapses poorly on < 768px)
- Agent Talktime Table needs pagination for > 20 agents
"# DashbordRepo" 
"# Dashboard-" 
