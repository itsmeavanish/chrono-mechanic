import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Cog,
  Factory,
  FileText,
  Gauge,
  Hash,
  MapPin,
  Settings,
  ShieldCheck,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import machineImg from "@/assets/machine.jpg";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Machine 360 — BM-04 Blow Molding Unit" },
      {
        name: "description",
        content:
          "Complete history, live vibration trends and maintenance reports for the BM-04 Blow Molding Unit at Reliance Industries.",
      },
      { property: "og:title", content: "Machine 360 — BM-04 Blow Molding Unit" },
      {
        property: "og:description",
        content:
          "Specs, parts history, vibration analytics and maintenance reports — everything about one machine in one place.",
      },
    ],
  }),
  component: MachinePage,
});

/* ---------------- DATA (mock — one machine) ---------------- */

const machine = {
  name: "Blow Molding Unit BM-04",
  model: "Krupp Kautex KBB-50",
  tag: "RIL-VAD-BM-04",
  location: "Vadodara Plant · Bay 3 · Line B",
  installed: "12 Aug 2018",
  lastMaintenance: "14 Jun 2026",
  status: "Operational",
};

const specs = [
  { label: "Rated Power", value: "75 kW", icon: Zap },
  { label: "Clamp Force", value: "500 kN", icon: Gauge },
  { label: "Shot Weight", value: "1,200 g", icon: Hash },
  { label: "Cycle Time", value: "18 s", icon: Activity },
  { label: "Operating Temp", value: "180 – 230 °C", icon: Cog },
  { label: "Air Pressure", value: "8 – 10 bar", icon: Settings },
];

type PartEvent = {
  date: string;
  type: "replaced" | "failed" | "serviced";
  note: string;
  reason?: string;
};

type Part = {
  id: string;
  name: string;
  serial: string;
  installed: string;
  health: "good" | "warning" | "critical";
  events: PartEvent[];
};

const parts: Part[] = [
  {
    id: "blow",
    name: "Blow Pin Assembly",
    serial: "BP-2245-A",
    installed: "12 Aug 2018",
    health: "warning",
    events: [
      { date: "10 Jun 2026", type: "serviced", note: "Re-calibrated blow timing" },
      {
        date: "22 Feb 2026",
        type: "failed",
        note: "Pin seal blow-out",
        reason:
          "Worn O-ring caused air leakage during high-pressure cycle. Replaced seal kit and re-torqued housing bolts.",
      },
      { date: "04 Nov 2025", type: "replaced", note: "Nozzle tip — wear limit reached" },
    ],
  },
  {
    id: "motor",
    name: "Main Drive Motor",
    serial: "ABB-M3BP-200",
    installed: "12 Aug 2018",
    health: "good",
    events: [
      { date: "14 Jun 2026", type: "serviced", note: "Bearing grease top-up" },
      {
        date: "08 Jan 2026",
        type: "failed",
        note: "Overheat trip",
        reason:
          "Cooling fan obstructed by debris. Cleaned intake, replaced thermal sensor, restored airflow.",
      },
      { date: "19 Mar 2024", type: "replaced", note: "Drive-end bearing 6314-C3" },
    ],
  },
  {
    id: "hydraulic",
    name: "Hydraulic Pump",
    serial: "RX-HP-118",
    installed: "05 Sep 2020",
    health: "good",
    events: [
      { date: "02 May 2026", type: "serviced", note: "Oil filter change" },
      {
        date: "17 Aug 2025",
        type: "failed",
        note: "Pressure drop below 6 bar",
        reason:
          "Internal seal degradation in pump head. Rebuilt pump cartridge, flushed lines.",
      },
    ],
  },
  {
    id: "heater",
    name: "Barrel Heater Bands",
    serial: "HB-Z4-08",
    installed: "11 Dec 2022",
    health: "critical",
    events: [
      {
        date: "20 Jun 2026",
        type: "failed",
        note: "Zone-3 heater open circuit",
        reason: "Element burnout. Awaiting replacement band — running on bypass profile.",
      },
      { date: "11 Dec 2022", type: "replaced", note: "Full set replaced (4 zones)" },
    ],
  },
];

const breakdowns = [
  {
    date: "20 Jun 2026",
    duration: "3h 20m",
    issue: "Heater Zone-3 open circuit",
    rootCause: "Element burnout (life expired)",
    action: "Bypassed zone, scheduled replacement band ETA 28 Jun",
  },
  {
    date: "22 Feb 2026",
    duration: "5h 10m",
    issue: "Blow pin seal failure",
    rootCause: "Worn O-ring under high-pressure cycle",
    action: "Replaced seal kit, re-torqued housing, updated PM interval to 90 days",
  },
  {
    date: "08 Jan 2026",
    duration: "2h 45m",
    issue: "Motor overheat trip",
    rootCause: "Obstructed cooling intake",
    action: "Cleared debris, replaced thermal sensor, added monthly intake check",
  },
];

/* ---------------- GRAPH DATA ---------------- */

type Reading = { t: string; v: number };

const vibrationData: Record<"blow" | "motor", Reading[]> = {
  blow: [
    { t: "08:00", v: 2.1 },
    { t: "09:00", v: 2.4 },
    { t: "10:00", v: 3.2 },
    { t: "11:00", v: 4.1 },
    { t: "12:00", v: 5.8 },
    { t: "13:00", v: 6.4 },
    { t: "14:00", v: 5.9 },
    { t: "15:00", v: 7.2 },
    { t: "16:00", v: 6.1 },
  ],
  motor: [
    { t: "08:00", v: 1.2 },
    { t: "09:00", v: 1.4 },
    { t: "10:00", v: 1.8 },
    { t: "11:00", v: 2.1 },
    { t: "12:00", v: 2.5 },
    { t: "13:00", v: 2.3 },
    { t: "14:00", v: 2.6 },
    { t: "15:00", v: 3.0 },
    { t: "16:00", v: 2.8 },
  ],
};

const OK_MAX = 3;
const WARN_MAX = 6;
const Y_MAX = 9;

function levelOf(v: number): "ok" | "warning" | "critical" {
  if (v <= OK_MAX) return "ok";
  if (v <= WARN_MAX) return "warning";
  return "critical";
}

/* ---------------- REPORTS ---------------- */

const reports = [
  {
    date: "14 Jun 2026",
    technician: "R. Mehta",
    task: "Quarterly PM — Drive train",
    notes:
      "Bearing grease top-up, alignment within tolerance (0.04 mm). Recommend re-check coupling at next PM.",
    rootCause: "Routine preventive — no fault",
    before: beforeImg,
    after: afterImg,
  },
  {
    date: "10 Jun 2026",
    technician: "S. Iyer",
    task: "Blow timing re-calibration",
    notes:
      "Adjusted blow delay from 0.42s to 0.38s after observing flash on parison. Output stable across 50 cycles.",
    rootCause: "Drift in solenoid response time",
    before: beforeImg,
    after: afterImg,
  },
  {
    date: "02 May 2026",
    technician: "A. Khan",
    task: "Hydraulic oil filter change",
    notes: "Filter ΔP at 1.8 bar — replaced. Oil sample sent for analysis, results pending.",
    rootCause: "Scheduled consumable replacement",
    before: beforeImg,
    after: afterImg,
  },
  {
    date: "22 Feb 2026",
    technician: "R. Mehta",
    task: "Blow pin seal replacement",
    notes:
      "Full seal kit replaced after blow-out. Housing bolts re-torqued to 45 Nm. Test cycle: 20 shots OK.",
    rootCause: "Worn O-ring — exceeded service life",
    before: beforeImg,
    after: afterImg,
  },
  {
    date: "08 Jan 2026",
    technician: "S. Iyer",
    task: "Motor cooling restoration",
    notes:
      "Cleared debris from intake louvres, replaced PT100 thermal sensor. Temp stable at 62 °C under load.",
    rootCause: "Obstructed cooling intake",
    before: beforeImg,
    after: afterImg,
  },
];

/* ---------------- COMPONENT ---------------- */

function MachinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-16">
        <SectionOverview />
        <SectionGraph />
        <SectionReports />
      </main>
      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>Reliance Industries · Maintenance Intelligence</span>
          <span>v0.1 · Internal preview</span>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Factory className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Machine 360</div>
            <div className="text-xs text-muted-foreground">Reliance Industries</div>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
          <a href="#overview" className="hover:text-foreground">Overview</a>
          <a href="#vibration" className="hover:text-foreground">Vibration</a>
          <a href="#reports" className="hover:text-foreground">Reports</a>
        </nav>
        <StatusPill status="ok" label="Operational" />
      </div>
    </header>
  );
}

/* ===== SECTION 1 ===== */

function SectionOverview() {
  const [openPart, setOpenPart] = useState<string | null>("blow");
  const [openEvent, setOpenEvent] = useState<string | null>(null);

  return (
    <section id="overview" className="space-y-6">
      <SectionHeader
        eyebrow="Section 01"
        title="Machine Overview"
        subtitle="Specifications, parts and complete service history."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="aspect-[16/7] overflow-hidden bg-muted">
            <img
              src={machineImg}
              alt={machine.name}
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {machine.tag}
            </div>
            <h3 className="text-2xl font-semibold mt-1">{machine.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Model {machine.model}</p>

            <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
              <InfoRow icon={MapPin} label="Location" value={machine.location} />
              <InfoRow icon={Calendar} label="Installed" value={machine.installed} />
              <InfoRow icon={Wrench} label="Last Maintenance" value={machine.lastMaintenance} />
              <InfoRow icon={ShieldCheck} label="Status" value={machine.status} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Specifications
          </h4>
          <ul className="mt-4 space-y-3">
            {specs.map((s) => (
              <li key={s.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <s.icon className="size-4" />
                  {s.label}
                </span>
                <span className="font-medium">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Parts & events */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Parts &amp; Tools</h4>
            <span className="text-xs text-muted-foreground">{parts.length} tracked</span>
          </div>
          <div className="space-y-2">
            {parts.map((p) => {
              const isOpen = openPart === p.id;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border overflow-hidden bg-background"
                >
                  <button
                    onClick={() => setOpenPart(isOpen ? null : p.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HealthDot level={p.health} />
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.serial} · installed {p.installed}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`size-4 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <ul className="border-t border-border bg-muted/40 px-4 py-3 space-y-2">
                      {p.events.map((e, i) => {
                        const key = `${p.id}-${i}`;
                        const expanded = openEvent === key;
                        return (
                          <li key={key}>
                            <button
                              onClick={() =>
                                e.reason && setOpenEvent(expanded ? null : key)
                              }
                              className={`w-full text-left flex items-start gap-3 py-1.5 ${
                                e.reason ? "cursor-pointer" : "cursor-default"
                              }`}
                            >
                              <EventBadge type={e.type} />
                              <div className="flex-1">
                                <div className="text-sm">
                                  <span className="font-medium">{e.date}</span>
                                  <span className="text-muted-foreground"> · {e.note}</span>
                                </div>
                                {expanded && e.reason && (
                                  <div className="mt-2 text-xs text-muted-foreground rounded-md bg-card border border-border p-3">
                                    <span className="font-medium text-foreground">
                                      Reason:{" "}
                                    </span>
                                    {e.reason}
                                  </div>
                                )}
                              </div>
                              {e.reason && (
                                <ChevronRight
                                  className={`size-3.5 text-muted-foreground mt-1 transition-transform ${
                                    expanded ? "rotate-90" : ""
                                  }`}
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h4 className="font-semibold mb-4">Breakdown History</h4>
          <ol className="relative border-l border-border ml-2 space-y-5">
            {breakdowns.map((b) => (
              <li key={b.date} className="pl-5">
                <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-sm font-medium">{b.issue}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {b.date} · downtime {b.duration}
                </div>
                <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted px-3 py-2">
                    <div className="text-muted-foreground">Root cause</div>
                    <div className="text-foreground mt-0.5">{b.rootCause}</div>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <div className="text-muted-foreground">Action taken</div>
                    <div className="text-foreground mt-0.5">{b.action}</div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ===== SECTION 2 ===== */

function SectionGraph() {
  const [selected, setSelected] = useState<"blow" | "motor">("blow");
  const data = vibrationData[selected];
  const current = data[data.length - 1].v;
  const status = levelOf(current);

  return (
    <section id="vibration" className="space-y-6">
      <SectionHeader
        eyebrow="Section 02"
        title="Vibration Trend"
        subtitle="Live signal status across critical parts."
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Status strip */}
        <div className="grid grid-cols-3 border-b border-border">
          <StatusBar level="ok" active={status === "ok"} label="OK · 0 – 3 mm/s" />
          <StatusBar
            level="warning"
            active={status === "warning"}
            label="Warning · 3 – 6 mm/s"
          />
          <StatusBar
            level="critical"
            active={status === "critical"}
            label="Critical · > 6 mm/s"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              {(["blow", "motor"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selected === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {k === "blow" ? "Blow Part" : "Motor"}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Latest reading{" "}
              <span className="font-semibold text-foreground">{current.toFixed(1)} mm/s</span>
            </div>
          </div>

          <VibrationChart data={data} />
        </div>
      </div>
    </section>
  );
}

function VibrationChart({ data }: { data: Reading[] }) {
  const W = 800;
  const H = 320;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xOf = (i: number) =>
    PAD_L + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yOf = (v: number) => PAD_T + innerH - (v / Y_MAX) * innerH;

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.v)}`).join(" ");
  const area = `${path} L${xOf(data.length - 1)},${PAD_T + innerH} L${xOf(0)},${PAD_T + innerH} Z`;

  const okY = yOf(OK_MAX);
  const warnY = yOf(WARN_MAX);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[320px]">
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Threshold bands */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={innerW}
          height={warnY - PAD_T}
          fill="var(--critical)"
          opacity="0.06"
        />
        <rect
          x={PAD_L}
          y={warnY}
          width={innerW}
          height={okY - warnY}
          fill="var(--warning)"
          opacity="0.08"
        />
        <rect
          x={PAD_L}
          y={okY}
          width={innerW}
          height={PAD_T + innerH - okY}
          fill="var(--success)"
          opacity="0.07"
        />

        {/* Threshold lines */}
        <line x1={PAD_L} x2={W - PAD_R} y1={okY} y2={okY} stroke="var(--success)" strokeDasharray="4 4" />
        <line x1={PAD_L} x2={W - PAD_R} y1={warnY} y2={warnY} stroke="var(--critical)" strokeDasharray="4 4" />

        {/* Y axis labels (vibration level) */}
        {[
          { v: 1.5, label: "OK" },
          { v: 4.5, label: "Warning" },
          { v: 7.5, label: "Critical" },
        ].map((t) => (
          <text
            key={t.label}
            x={PAD_L - 10}
            y={yOf(t.v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {t.label}
          </text>
        ))}

        {/* X axis (timestamps) */}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={PAD_T + innerH}
          y2={PAD_T + innerH}
          stroke="var(--border)"
        />
        {data.map((d, i) => (
          <text
            key={d.t}
            x={xOf(i)}
            y={H - 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {d.t}
          </text>
        ))}

        {/* Area + line */}
        <path d={area} fill="url(#fill)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />

        {/* Points */}
        {data.map((d, i) => {
          const lvl = levelOf(d.v);
          const color =
            lvl === "ok"
              ? "var(--success)"
              : lvl === "warning"
              ? "var(--warning)"
              : "var(--critical)";
          return (
            <g key={i}>
              <circle cx={xOf(i)} cy={yOf(d.v)} r="4" fill={color} stroke="var(--card)" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        X: vibration level &nbsp;·&nbsp; Y: timestamp
      </div>
    </div>
  );
}

/* ===== SECTION 3 ===== */

function SectionReports() {
  const [active, setActive] = useState(0);
  const r = reports[active];

  return (
    <section id="reports" className="space-y-6">
      <SectionHeader
        eyebrow="Section 03"
        title="Last 5 Maintenance Reports"
        subtitle="Technician notes, before/after photos and root cause."
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-2 shadow-sm h-fit">
          {reports.map((rep, i) => (
            <button
              key={rep.date + i}
              onClick={() => setActive(i)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                active === i ? "bg-primary/10" : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{rep.task}</div>
                {active === i && <span className="size-2 rounded-full bg-primary" />}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Calendar className="size-3" />
                {rep.date}
                <span>·</span>
                <User className="size-3" />
                {rep.technician}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{r.task}</h3>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> {r.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" /> {r.technician}
                </span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-success/15 text-success font-medium border border-success/20">
              Completed
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <PhotoCard label="Before" src={r.before} />
            <PhotoCard label="After" src={r.after} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" /> Technician notes
              </div>
              <p className="text-sm mt-2 leading-relaxed">{r.notes}</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" /> Root cause
              </div>
              <p className="text-sm mt-2 leading-relaxed">{r.rootCause}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold mt-1.5 tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <Icon className="size-4 text-muted-foreground" />
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function HealthDot({ level }: { level: "good" | "warning" | "critical" }) {
  const cls =
    level === "good"
      ? "bg-success"
      : level === "warning"
      ? "bg-warning"
      : "bg-critical";
  return <span className={`size-2.5 rounded-full ${cls} shrink-0`} />;
}

function EventBadge({ type }: { type: PartEvent["type"] }) {
  const map = {
    replaced: { Icon: Wrench, cls: "bg-primary/10 text-primary" },
    failed: { Icon: AlertTriangle, cls: "bg-critical/10 text-critical" },
    serviced: { Icon: CheckCircle2, cls: "bg-success/10 text-success" },
  } as const;
  const { Icon, cls } = map[type];
  return (
    <span className={`size-6 rounded-md grid place-items-center ${cls} shrink-0 mt-0.5`}>
      <Icon className="size-3.5" />
    </span>
  );
}

function StatusPill({ status, label }: { status: "ok" | "warning" | "critical"; label: string }) {
  const cls =
    status === "ok"
      ? "bg-success/10 text-success border-success/20"
      : status === "warning"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-critical/10 text-critical border-critical/20";
  return (
    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${cls} flex items-center gap-2`}>
      <span className={`size-1.5 rounded-full ${
        status === "ok" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-critical"
      }`} />
      {label}
    </span>
  );
}

function StatusBar({
  level,
  active,
  label,
}: {
  level: "ok" | "warning" | "critical";
  active: boolean;
  label: string;
}) {
  const color =
    level === "ok" ? "bg-success" : level === "warning" ? "bg-warning" : "bg-critical";
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-r border-border last:border-r-0 ${
        active ? "bg-muted" : ""
      }`}
    >
      <span className={`size-2.5 rounded-full ${color} ${active ? "ring-4 ring-offset-0" : ""}`}
        style={active ? { boxShadow: `0 0 0 4px color-mix(in oklch, var(--${level === "ok" ? "success" : level === "warning" ? "warning" : "critical"}) 20%, transparent)` } : undefined}
      />
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function PhotoCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-background">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={src}
          alt={label}
          width={1024}
          height={1024}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
}
