import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Cog,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Hash,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
  Thermometer,
  User,
  Waves,
  Wrench,
  Zap,
} from "lucide-react";
import machineImg from "@/assets/machine.jpg";
import { ChatWidget } from "@/components/ChatWidget";
import {
  useMachineData,
  type PartEvent,
  type Reading,
  type PartKey,
  type SideKey,
} from "@/lib/machine-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AHU-Quench SH1 · Machine 360" },
      {
        name: "description",
        content:
          "Complete history, live vibration trends and maintenance reports for AHU-Quench SH1 at Reliance Industries.",
      },
      { property: "og:title", content: "AHU-Quench SH1 · Machine 360" },
      {
        property: "og:description",
        content:
          "Specs, parts history, live readings, vibration analytics and maintenance reports.",
      },
    ],
  }),
  component: MachinePage,
});

const SPEC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Rated Power": Zap,
  "Clamp Force": Gauge,
  "Shot Weight": Hash,
  "Cycle Time": Activity,
  "Operating Temp": Cog,
  "Air Pressure": Settings,
};
const LIVE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Vibration: Waves,
  "Bearing Temp": Thermometer,
  "Filter ΔP": Droplets,
};

const OK_MAX = 3;
const WARN_MAX = 6;
const Y_MAX = 9;

function levelOf(v: number): "ok" | "warning" | "critical" {
  if (v <= OK_MAX) return "ok";
  if (v <= WARN_MAX) return "warning";
  return "critical";
}


function MachinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-16">
        <SectionOverview />
        <SectionGraph />
        <SectionReports />
      </main>
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>Reliance Industries · Maintenance Intelligence</span>
          <span>v0.2 · Internal preview</span>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

function Header() {
  const { machine } = useMachineData();
  const label =
    machine.status === "ok" ? "Operational" : machine.status === "warning" ? "Warning" : "Critical";
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 sm:size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
            <Factory className="size-4 sm:size-5" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-semibold truncate">Machine 360</div>
            <div className="text-[11px] text-muted-foreground truncate">Reliance Industries</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={machine.status} label={label} />
          <Link
            to="/edit"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors"
          >
            <Pencil className="size-3.5" />
            <span className="hidden sm:inline">Edit data</span>
            <span className="sm:hidden">Edit</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


/* ===== SECTION 1 ===== */

function SectionOverview() {
  const [openPart, setOpenPart] = useState<string | null>("blow");
  const [openEvent, setOpenEvent] = useState<string | null>(null);

  return (
    <section id="overview" className="space-y-5 sm:space-y-6">
      <SectionHeader
        eyebrow="Section 01"
        title="Machine Overview"
        subtitle="Basic info, live readings and complete service history."
      />

      {/* Hero card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="aspect-[3/2] sm:aspect-[16/6] overflow-hidden bg-muted">
          <img
            src={machineImg}
            alt={machine.name}
            width={1024}
            height={1024}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-wider text-primary font-medium">
            {machine.type}
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold mt-1 leading-tight">{machine.name}</h3>
          <p className="text-sm text-muted-foreground mt-1.5">{machine.function}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            <InfoRow icon={Hash} label="Asset ID" value={machine.assetId} />
            <InfoRow icon={MapPin} label="Location" value={machine.location} />
            <InfoRow icon={Cog} label="Model" value={machine.model} />
            <InfoRow icon={Calendar} label="Installed" value={machine.installed} />
          </div>
        </div>
      </div>

      {/* Live Condition Data */}
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Live Condition Data
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {liveData.map((d) => (
            <LiveStat key={d.label} {...d} />
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Specifications
        </h4>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {specs.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between text-sm gap-3 border-b border-border/60 last:border-0 sm:border-0 py-1.5"
            >
              <span className="flex items-center gap-2 text-muted-foreground min-w-0">
                <s.icon className="size-4 shrink-0" />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="font-medium shrink-0">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Parts */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
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
                  className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-accent transition-colors gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <HealthDot level={p.health} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {p.serial} · installed {p.installed}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`size-4 text-muted-foreground transition-transform shrink-0 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <ul className="border-t border-border bg-muted/40 px-3.5 py-3 space-y-1">
                    {p.events.map((e, i) => {
                      const key = `${p.id}-${i}`;
                      const expanded = openEvent === key;
                      return (
                        <li key={key}>
                          <button
                            onClick={() => e.reason && setOpenEvent(expanded ? null : key)}
                            className={`w-full text-left flex items-start gap-3 py-1.5 ${
                              e.reason ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            <EventBadge type={e.type} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">
                                <span className="font-medium">{e.date}</span>
                                <span className="text-muted-foreground"> · {e.note}</span>
                              </div>
                              {expanded && e.reason && (
                                <div className="mt-2 text-xs text-muted-foreground rounded-md bg-card border border-border p-3">
                                  <span className="font-medium text-foreground">Reason: </span>
                                  {e.reason}
                                </div>
                              )}
                            </div>
                            {e.reason && (
                              <ChevronRight
                                className={`size-3.5 text-muted-foreground mt-1 transition-transform shrink-0 ${
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

      {/* Breakdowns + Maintenance summary */}
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <h4 className="font-semibold mb-4">Breakdown History</h4>
          {breakdowns.length > 0 ? (
            <ol className="relative border-l border-border ml-1.5 space-y-5">
              {breakdowns.map((b) => (
                <li key={b.date} className="pl-5">
                  <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-sm font-medium">{b.issue}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.date} · downtime {b.duration}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-muted/30 rounded-xl border border-dashed border-border/60">
              <CheckCircle2 className="size-8 text-success/80 mb-3" />
              <div className="text-sm font-medium">No Recent Breakdowns</div>
              <div className="text-xs text-muted-foreground mt-1.5 max-w-[200px] leading-relaxed">
                Machine has been running smoothly without unexpected downtime.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <h4 className="font-semibold mb-4">Maintenance Summary</h4>
          <div className="space-y-4">
            <MaintBlock
              title="Preventive Maintenance"
              last={maintenanceSummary.preventive.last}
              next={maintenanceSummary.preventive.next}
            />
            <MaintBlock
              title="LLF Inspection"
              last={maintenanceSummary.llf.last}
              next={maintenanceSummary.llf.next}
            />
            <div className="rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-muted-foreground">Installed</span>
              </div>
              <span className="text-sm font-medium">{maintenanceSummary.installed}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== SECTION 2 ===== */

function SectionGraph() {
  const [part, setPart] = useState<PartKey>("blower");
  const [side, setSide] = useState<SideKey>("NDE");
  const data = vibration[part][side];
  const current = data[data.length - 1].v;
  const status = levelOf(current);

  return (
    <section id="vibration" className="space-y-5 sm:space-y-6">
      <SectionHeader
        eyebrow="Section 02"
        title="Vibration Trend"
        subtitle="Live signal across Motor & Blower — Drive End / Non-Drive End."
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 border-b border-border">
          <StatusBar level="ok" active={status === "ok"} short="OK" full="0–3 mm/s" />
          <StatusBar
            level="warning"
            active={status === "warning"}
            short="Warning"
            full="3–6 mm/s"
          />
          <StatusBar
            level="critical"
            active={status === "critical"}
            short="Critical"
            full="> 6 mm/s"
          />
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Part selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              {(["motor", "blower"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setPart(k)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    part === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {k === "motor" ? "Motor" : "Blower"}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground w-full sm:w-auto sm:text-right">
              Latest{" "}
              <span className="font-semibold text-foreground">{current.toFixed(1)} mm/s</span>
            </div>
          </div>

          {/* DE / NDE toggle */}
          <div className="inline-flex p-1 rounded-lg bg-muted text-sm">
            {(["DE", "NDE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                  side === s
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "DE" ? "Drive End" : "Non-Drive End"}
              </button>
            ))}
          </div>

          <VibrationChart data={data} />
        </div>
      </div>
    </section>
  );
}

function VibrationChart({ data }: { data: Reading[] }) {
  const W = 800;
  const H = 300;
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
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[260px] sm:h-[300px]">
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

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

        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={okY}
          y2={okY}
          stroke="var(--success)"
          strokeDasharray="4 4"
        />
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={warnY}
          y2={warnY}
          stroke="var(--critical)"
          strokeDasharray="4 4"
        />

        {[
          { v: 1.5, label: "OK" },
          { v: 4.5, label: "Warn" },
          { v: 7.5, label: "Crit" },
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

        <path d={area} fill="url(#fill)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />

        {data.map((d, i) => {
          const lvl = levelOf(d.v);
          const color =
            lvl === "ok"
              ? "var(--success)"
              : lvl === "warning"
              ? "var(--warning)"
              : "var(--critical)";
          return (
            <circle
              key={i}
              cx={xOf(i)}
              cy={yOf(d.v)}
              r="4"
              fill={color}
              stroke="var(--card)"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        X: vibration level &nbsp;·&nbsp; Y: timestamp (mm/s)
      </div>
    </div>
  );
}

/* ===== SECTION 3 ===== */

function SectionReports() {
  const [active, setActive] = useState(0);
  const r = reports[active];

  return (
    <section id="reports" className="space-y-5 sm:space-y-6">
      <SectionHeader
        eyebrow="Section 03"
        title="Overhauling History"
        subtitle="Major component replacements, visual evidence, and root causes."
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-5 sm:gap-6">
        {/* Mobile: horizontal scroller. Desktop: vertical list */}
        <div className="min-w-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-2 lg:shadow-sm">
          <div className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:pb-0 snap-x snap-mandatory">
            {reports.map((rep, i) => (
              <button
                key={rep.date + i}
                onClick={() => setActive(i)}
                className={`shrink-0 lg:shrink w-[240px] lg:w-full text-left px-4 py-3 rounded-xl border lg:border-0 snap-start transition-colors ${
                  active === i
                    ? "bg-primary/10 border-primary/30 lg:border-0"
                    : "bg-card hover:bg-accent border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{rep.task}</div>
                  {active === i && (
                    <span className="size-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                  <Calendar className="size-3 shrink-0" />
                  {rep.date}
                  <span>·</span>
                  <User className="size-3 shrink-0" />
                  <span className="truncate">{rep.technician}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold">{r.task}</h3>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> {r.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" /> {r.technician}
                </span>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-success/15 text-success font-medium border border-success/20">
              Completed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <PhotoCard label="Before" src={r.before} />
            <PhotoCard label="After" src={r.after} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" /> Technician notes
              </div>
              <p className="text-sm mt-2 leading-relaxed">{r.notes}</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
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
    <div className="px-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold mt-1.5 tracking-tight">{title}</h2>
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
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 min-w-0">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <div className="leading-tight min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function LiveStat({
  icon: Icon,
  label,
  value,
  unit,
  detail,
  level,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  detail: string;
  level: "ok" | "warning" | "critical";
}) {
  const ring =
    level === "ok"
      ? "border-success/30 bg-success/5"
      : level === "warning"
      ? "border-warning/40 bg-warning/5"
      : "border-critical/30 bg-critical/5";
  const dot =
    level === "ok" ? "bg-success" : level === "warning" ? "bg-warning" : "bg-critical";
  return (
    <div className={`rounded-2xl border ${ring} p-4 sm:p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <span className={`size-2 rounded-full ${dot}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{detail}</div>
    </div>
  );
}

function MaintBlock({ title, last, next }: { title: string; last: string; next: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-sm font-medium flex items-center gap-2">
        <Wrench className="size-4 text-primary" />
        {title}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last</div>
          <div className="font-medium mt-0.5">{last}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Next due
          </div>
          <div className="font-medium mt-0.5 text-primary">{next}</div>
        </div>
      </div>
    </div>
  );
}

function HealthDot({ level }: { level: "good" | "warning" | "critical" }) {
  const cls =
    level === "good" ? "bg-success" : level === "warning" ? "bg-warning" : "bg-critical";
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

function StatusPill({
  status,
  label,
}: {
  status: "ok" | "warning" | "critical";
  label: string;
}) {
  const cls =
    status === "ok"
      ? "bg-success/10 text-success border-success/20"
      : status === "warning"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-critical/10 text-critical border-critical/20";
  const dot =
    status === "ok" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-critical";
  return (
    <span
      className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full border ${cls} flex items-center gap-1.5 shrink-0`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StatusBar({
  level,
  active,
  short,
  full,
}: {
  level: "ok" | "warning" | "critical";
  active: boolean;
  short: string;
  full: string;
}) {
  const color =
    level === "ok" ? "bg-success" : level === "warning" ? "bg-warning" : "bg-critical";
  return (
    <div
      className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-r border-border last:border-r-0 ${
        active ? "bg-muted" : ""
      }`}
    >
      <span className={`size-2.5 rounded-full ${color}`} />
      <span className={active ? "text-foreground" : "text-muted-foreground"}>
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">
          {short} · {full}
        </span>
      </span>
    </div>
  );
}

function PhotoCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="min-w-0 rounded-xl overflow-hidden border border-border bg-background">
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
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
}
