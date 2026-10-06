/**
 * BLISS REALTY - Revenue Performance mock data (data only, no JSX).
 *
 * Replace `revenueData` with your backend response later. Expected shape:
 *
 *   revenueData[periodKey] = {
 *     totalRevenue:    number,                       // INR, current period
 *     previousRevenue: number,                       // INR, previous equivalent period
 *     timeline: [{ label, revenue, fullLabel? }],    // chart buckets
 *     entities: [{ name, revenue }],                 // revenue by entity
 *   }
 *
 * On the backend these numbers would be aggregated from CRM records:
 * closed property transactions, booking amounts, brokerage/commission,
 * rental transactions and other income.
 */

/* Period filter options. `xAxisLabel` titles the chart x-axis, `unit` is used in the stats. */
export const PERIOD_OPTIONS = [
  { key: "today", label: "Today", unit: "hour", xAxisLabel: "Time (hourly)" },
  { key: "last7Days", label: "Last 7 Days", unit: "day", xAxisLabel: "Day" },
  { key: "last30Days", label: "Last 30 Days", unit: "day", xAxisLabel: "Date" },
  { key: "lastQuarter", label: "Last Quarter", unit: "month", xAxisLabel: "Month" },
];

/* Colour per revenue entity. Unknown entities fall back to a neutral grey. */
/* Colour per revenue entity: yellow / black / greys. Unknown entities fall back to grey. */
export const ENTITY_COLORS = {
  "Property Sales": "#D4AF37",
  "Property Booking": "#111111",
  "Brokerage / Commission": "#737373",
  "Rental Deals": "#fde68a",
  "Other Revenue": "#d4d4d4",
};

const toTimeline = (labels, values, fullLabels) =>
  labels.map((label, i) => ({
    label,
    revenue: values[i],
    ...(fullLabels ? { fullLabel: fullLabels[i] } : {}),
  }));

const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"];
const HOURLY = [15000, 28000, 35000, 22000, 18000, 31000, 26000, 24000, 30000, 16000];

const WEEK_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAILY_7 = [165000, 210000, 185000, 240000, 195000, 175000, 80000];

const DAYS_30 = ["31 Aug", ...Array.from({ length: 29 }, (_, i) => `${i + 1} Sep`)];
const DAILY_30 = [
  140000, 155000, 132000, 178000, 190000, 120000, 130000, 150000, 168000, 182000,
  175000, 160000, 110000, 130000, 158000, 172000, 196000, 185000, 170000, 125000,
  140000, 164000, 180000, 205000, 192000, 174000, 130000, 141000, 188000, 210000,
];

const MONTHS = ["July", "August", "September"];
const MONTHLY = [4120000, 4830000, 5300000];

export const revenueData = {
  today: {
    totalRevenue: 245000,
    previousRevenue: 210000,
    timeline: toTimeline(HOURS, HOURLY),
    entities: [
      { name: "Property Sales", revenue: 150000 },
      { name: "Property Booking", revenue: 50000 },
      { name: "Brokerage / Commission", revenue: 30000 },
      { name: "Rental Deals", revenue: 10000 },
      { name: "Other Revenue", revenue: 5000 },
    ],
  },

  last7Days: {
    totalRevenue: 1250000,
    previousRevenue: 1080000,
    timeline: toTimeline(WEEK_SHORT, DAILY_7, WEEK_FULL),
    entities: [
      { name: "Property Sales", revenue: 760000 },
      { name: "Property Booking", revenue: 240000 },
      { name: "Brokerage / Commission", revenue: 140000 },
      { name: "Rental Deals", revenue: 75000 },
      { name: "Other Revenue", revenue: 35000 },
    ],
  },

  last30Days: {
    totalRevenue: 4850000,
    previousRevenue: 4300000,
    timeline: toTimeline(DAYS_30, DAILY_30),
    entities: [
      { name: "Property Sales", revenue: 3120000 },
      { name: "Property Booking", revenue: 890000 },
      { name: "Brokerage / Commission", revenue: 520000 },
      { name: "Rental Deals", revenue: 210000 },
      { name: "Other Revenue", revenue: 110000 },
    ],
  },

  lastQuarter: {
    totalRevenue: 14250000,
    previousRevenue: 12800000,
    timeline: toTimeline(MONTHS, MONTHLY),
    entities: [
      { name: "Property Sales", revenue: 9300000 },
      { name: "Property Booking", revenue: 2850000 },
      { name: "Brokerage / Commission", revenue: 1350000 },
      { name: "Rental Deals", revenue: 480000 },
      { name: "Other Revenue", revenue: 270000 },
    ],
  },
};