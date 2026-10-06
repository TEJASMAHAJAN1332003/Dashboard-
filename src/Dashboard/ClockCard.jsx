import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

const YELLOW = "#D4AF37";
const BLACK = "#111111";

/* Small entrance + fade animations (self-contained) */
const CSS = `
@keyframes clk-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes clk-fade {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
.clk-rise { animation: clk-rise 550ms cubic-bezier(.22,1,.36,1) both; }
.clk-fade { animation: clk-fade 250ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .clk-rise, .clk-fade { animation: none; }
}
`;

/* Current time, updated every frame so the second hand sweeps smoothly */
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    let raf;
    const tick = () => {
      setNow(new Date());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return now;
}

/* Static dial: ticks + numerals */
const TICKS = Array.from({ length: 60 }, (_, i) => i);
const NUMERALS = Array.from({ length: 12 }, (_, i) => i + 1);
const pt = (deg, r) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
};

function AnalogClock({ now, period }) {
  const ms = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  const secDeg = sec * 6;
  const minDeg = min * 6;
  const hrDeg = hr * 30;

  return (
    <svg
      viewBox="0 0 200 200"
      className="block h-full max-h-full w-auto max-w-full"
      role="img"
      aria-label="Analog clock"
    >
      {/* Face */}
      <circle cx="100" cy="100" r="96" fill={BLACK} />
      <circle cx="100" cy="100" r="90" fill="#ffffff" />
      <circle cx="100" cy="100" r="90" fill="none" stroke={YELLOW} strokeWidth="2" />

      {/* Ticks */}
      {TICKS.map((i) => {
        const major = i % 5 === 0;
        const [x1, y1] = pt(i * 6, 84);
        const [x2, y2] = pt(i * 6, major ? 76 : 80);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={major ? BLACK : "#b5b5b5"}
            strokeWidth={major ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* Numerals */}
      {NUMERALS.map((n) => {
        const [x, y] = pt(n * 30, 62);
        return (
          <text
            key={n}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={BLACK}
          >
            {n}
          </text>
        );
      })}

      {/* AM / PM badge */}
      <rect
        x="86"
        y="122"
        width="28"
        height="14"
        rx="7"
        fill={period === "AM" ? YELLOW : BLACK}
      />
      <text
        x="100"
        y="132"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fill={period === "AM" ? BLACK : "#ffffff"}
      >
        {period}
      </text>

      {/* Hour hand */}
      <g transform={`rotate(${hrDeg} 100 100)`}>
        <line
          x1="100"
          y1="108"
          x2="100"
          y2="56"
          stroke={BLACK}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Minute hand */}
      <g transform={`rotate(${minDeg} 100 100)`}>
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="34"
          stroke={BLACK}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* Second hand (yellow) with a short tail */}
      <g transform={`rotate(${secDeg} 100 100)`}>
        <line
          x1="100"
          y1="118"
          x2="100"
          y2="26"
          stroke={YELLOW}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Centre cap */}
      <circle cx="100" cy="100" r="6.5" fill={BLACK} />
      <circle cx="100" cy="100" r="3" fill={YELLOW} />
    </svg>
  );
}

function ClockCard() {
  const now = useNow();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedInAt, setClockedInAt] = useState("");

  const hours24 = now.getHours();
  const hour12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? "PM" : "AM";
  const fullTime = `${pad(hour12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${period}`;

  const dateText = `${now.toLocaleString("en-US", {
    weekday: "long",
  })}, ${now.getDate()} ${now.toLocaleString("en-US", {
    month: "short",
  })} ${now.getFullYear()}`;

  const handleClock = () => {
    console.log(clockedIn ? "Clocked out at" : "Clocked in at", fullTime);
    if (!clockedIn) setClockedInAt(fullTime);
    setClockedIn((prev) => !prev);
  };

  return (
    <div className="clk-rise flex h-full w-full flex-1 flex-col rounded-2xl bg-white p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition duration-300 hover:shadow-lg">
      <style>{CSS}</style>

      {/* Analog clock: fills the available height */}
      <div
        role="timer"
        aria-label={`Current time ${fullTime}`}
        className="flex min-h-0 flex-1 items-center justify-center"
      >
        <AnalogClock now={now} period={period} />
      </div>

      {/* Today's date */}
      <p className="mt-2 text-sm font-semibold text-black">{dateText}</p>

      <p className="mt-1 text-[11px] font-medium leading-snug text-neutral-500">
        &quot;Attendance is the first step to accomplishment&quot;
      </p>

      {/* Clock In / Clock Out: black by default */}
      <button
        onClick={handleClock}
        className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-95 ${clockedIn
          ? "bg-yellow-400 text-black hover:bg-yellow-300"
          : "bg-black text-white hover:bg-neutral-800"
          }`}
      >
        <span key={clockedIn ? "out" : "in"} className="clk-fade inline-block">
          {clockedIn ? "Clock Out" : "Clock In"}
        </span>
      </button>

      {/* Status line expands and collapses smoothly */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${clockedIn ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-neutral-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
            </span>
            Clocked in at {clockedInAt}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClockCard;