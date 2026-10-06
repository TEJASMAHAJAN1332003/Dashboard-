import {
  Inbox,
  Compass,
  Database,
  Send,
  TrendingUp,
} from "lucide-react";
import { useCountUp } from "./revenueUtils";
import CardEditFilter from "./Cardeditfilter";

// Palette taken from CampaignTypesCard
// Gold   #D4AF37
// Black  #0A0A0A
// Greys  #2f2f2f  #6b6b6b  #b5b5b5  #f1f1f1

const REAL_INTAKE_ITEMS = [
  {
    id: "total",
    title: "Leads - Total",
    count: 164,
    subtitle: "From Last 7 Days",
    growth: "+12.4%",
    icon: Compass,
    color: "#0A0A0A",
    bg: "bg-[#0A0A0A] text-[#D4AF37]",
  },
  {
    id: "data",
    title: "Leads - Data",
    count: 98,
    subtitle: "From Last 7 Days",
    growth: "+8.2%",
    icon: Database,
    color: "#6b6b6b",
    bg: "bg-neutral-100 text-[#6b6b6b]",
  },
  {
    id: "direct",
    title: "Leads - Direct",
    count: 66,
    subtitle: "From Last 7 Days",
    growth: "+15.1%",
    icon: Send,
    color: "#D4AF37",
    bg: "bg-[#D4AF37]/15 text-[#0A0A0A]",
  },
];

export default function NewLeadIntakeCard({ className = "", onEditApply }) {
  const items = REAL_INTAKE_ITEMS;

  const totalCount = items[0].count;
  const animatedTotal = useCountUp(totalCount, 500);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0A0A] text-[#D4AF37] shadow-sm">
            <Inbox size={16} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-black">
              New Lead Intake
            </h2>
            <p className="text-[11px] text-neutral-500">
              Organized intake for stronger conversion
            </p>
          </div>
        </div>

        {/* Controls: Edit */}
        <div className="flex items-center gap-1.5">
          {/* Shared Edit button + filter popup */}
          <CardEditFilter onApply={onEditApply} />
        </div>
      </div>

      {/* 3 Stacked Metric Rows Matching the Photo */}
      <div className="mt-3 flex-1 flex flex-col justify-between gap-2.5 min-h-[190px]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-3 transition-all duration-200 hover:border-[#D4AF37]/60 hover:bg-white hover:shadow-sm"
            >
              {/* Left: Icon + Title + Count + Subtitle */}
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </span>

                <div>
                  <p className="text-xs font-semibold text-neutral-600">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold tabular-nums tracking-tight text-black">
                    {item.id === "total" ? animatedTotal : item.count}
                  </p>
                  <p className="text-[10px] font-medium text-neutral-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right: Rounded gold outline pill */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-2.5 py-1 text-xs font-bold text-black shadow-2xs">
                  <span>{item.growth}</span>
                  <TrendingUp
                    size={12}
                    strokeWidth={2.5}
                    className="text-[#D4AF37]"
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
        <span>Verified Acquisition Channels</span>
        <span className="font-semibold text-neutral-700">
          Conversion Velocity: <b className="text-black">3.2 days</b>
        </span>
      </div>
    </div>
  );
}