import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard1 from "./Dashboard/Dashboard1";
import ClockCard from "./Dashboard/ClockCard";
import TotalLeadsCard from "./Dashboard/TotalLeadsCard";
import CampaignTypesCard from "./Dashboard/CampaignTypesCard";
import DataTable from "./Dashboard/DataTable";
import RevenueWidget from "./Dashboard/RevenueWidget";
import LeadsVsSource from "./Dashboard/LeadsVsSource";
import LeadFunnel from "./Dashboard/LeadFunnel";
import TopClosersCard from "./Dashboard/TopClosersCard";
import NewLeadIntakeCard from "./Dashboard/NewLeadIntakeCard";
import RemindersCard from "./Dashboard/RemindersCard";
import AgentTalktimeTable from "./Dashboard/AgentTalktimeTable";
import EditWidgetsPanel, { DEFAULT_BIFURCATION } from "./Dashboard/EditWidgetsPanel";

const SPACING = "px-4 md:px-6";

/* ──────────────────────────────────────────────────────────────
   Shared widget content
   `bifurcation` comes from Layout (set by the Edit Widgets panel)
────────────────────────────────────────────────────────────── */
function DashboardContent({ bifurcation }) {
  return (
    <main className="w-full max-w-[2200px] mx-auto pb-10">

      {/* ══ ROW 0: Metric Cards ══ */}
      <section aria-label="Metric Cards" className={`${SPACING} pb-0`}>
        <DataTable statuses={bifurcation.statuses} />
      </section>

      {/* ══ ROW 1: Total Leads · Lead Status · Clock ══ */}
      <section
        aria-label="Summary Row"
        className={`${SPACING} pt-4 pb-0 flex w-full gap-4 h-[340px]`}
      >
        <div className="min-w-0 flex-1 h-full overflow-hidden flex flex-col [&>*]:h-full [&>*]:min-h-0">
          <TotalLeadsCard active={128} inactive={36} />
        </div>
        <div className="w-[280px] shrink-0 h-full flex flex-col [&>*]:h-full [&>*]:min-h-0">
          <CampaignTypesCard />
        </div>
        <div className="w-[240px] shrink-0 h-full flex flex-col [&>*]:h-full">
          <ClockCard />
        </div>
      </section>

      {/* ══ ROW 2: Revenue + Leads vs Source ══ */}
      <section
        aria-label="Revenue and Sources Row"
        className={`${SPACING} pt-4 pb-0 grid grid-cols-1 lg:grid-cols-2 gap-4`}
        style={{ minHeight: "300px" }}
      >
        <RevenueWidget className="h-full min-h-[300px]" />
        <LeadsVsSource className="h-full min-h-[300px]" />
      </section>

      {/* ══ ROW 3: Lead Funnel ══ */}
      <section aria-label="Lead Funnel" className={`${SPACING} pt-4 pb-0`}>
        <LeadFunnel />
      </section>

      {/* ══ ROW 4: Top Closers · New Lead Intake · Reminders ══ */}
      <section
        aria-label="Agents and Reminders Row"
        className={`${SPACING} pt-4 pb-0 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch`}
      >
        <TopClosersCard className="h-full min-h-[360px]" />
        <NewLeadIntakeCard className="h-full min-h-[360px]" />
        <RemindersCard className="h-full min-h-[360px]" />
      </section>

      {/* ══ ROW 5: Agent Talktime Table ══ */}
      <section aria-label="Agent Talktime Table" className={`${SPACING} pt-4`}>
        <AgentTalktimeTable />
      </section>

    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
   LAYOUT
────────────────────────────────────────────────────────────── */
function Layout() {
  const [activeDashboard, setActiveDashboard] = useState("My Dashboard");
  const [editWidgetsOpen, setEditWidgetsOpen] = useState(false);

  // Applied Lead Bifurcation config (order / selection / max count)
  const [bifurcation, setBifurcation] = useState(DEFAULT_BIFURCATION);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <Dashboard1
        activeDashboard={activeDashboard}
        onDashboardChange={setActiveDashboard}
        onEditWidgets={() => setEditWidgetsOpen(true)}
      />
      <DashboardContent bifurcation={bifurcation} />
      <Outlet />
      <EditWidgetsPanel
        open={editWidgetsOpen}
        onClose={() => setEditWidgetsOpen(false)}
        bifurcation={bifurcation}
        onApplyBifurcation={setBifurcation}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   APP
────────────────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;