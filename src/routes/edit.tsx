import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  DEFAULT_DATA,
  resetMachineData,
  setMachineData,
  useMachineData,
  type Breakdown,
  type LiveStat,
  type MachineData,
  type Part,
  type PartEvent,
  type PartKey,
  type Reading,
  type Report,
  type SideKey,
  type Spec,
} from "@/lib/machine-data";

export const Route = createFileRoute("/edit")({
  head: () => ({
    meta: [{ title: "Edit Machine Data · Machine 360" }],
  }),
  component: EditPage,
});

function EditPage() {
  const stored = useMachineData();
  const [draft, setDraft] = useState<MachineData>(stored);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = () => {
    setMachineData(draft);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2200);
  };

  const reset = () => {
    if (confirm("Reset ALL data to defaults? This cannot be undone.")) {
      resetMachineData();
      setDraft(DEFAULT_DATA);
    }
  };

  const patch = (p: Partial<MachineData>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="text-sm font-semibold truncate">Edit Machine Data</div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-accent"
              title="Reset to defaults"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-3.5" />
              {savedAt ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <p className="text-sm text-muted-foreground">
          Edit any field below. Changes are stored locally in this browser and reflected on the
          dashboard after you press <span className="font-medium text-foreground">Save</span>.
        </p>

        {/* Machine info */}
        <Card title="Machine Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Name"
              value={draft.machine.name}
              onChange={(v) => patch({ machine: { ...draft.machine, name: v } })}
            />
            <Field
              label="Type"
              value={draft.machine.type}
              onChange={(v) => patch({ machine: { ...draft.machine, type: v } })}
            />
            <Field
              label="Asset ID"
              value={draft.machine.assetId}
              onChange={(v) => patch({ machine: { ...draft.machine, assetId: v } })}
            />
            <Field
              label="Model"
              value={draft.machine.model}
              onChange={(v) => patch({ machine: { ...draft.machine, model: v } })}
            />
            <Field
              label="Location"
              value={draft.machine.location}
              onChange={(v) => patch({ machine: { ...draft.machine, location: v } })}
            />
            <Field
              label="Installed"
              value={draft.machine.installed}
              onChange={(v) => patch({ machine: { ...draft.machine, installed: v } })}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Function"
                value={draft.machine.function}
                onChange={(v) => patch({ machine: { ...draft.machine, function: v } })}
              />
            </div>
            <SelectField
              label="Status"
              value={draft.machine.status}
              options={[
                { v: "ok", l: "Operational" },
                { v: "warning", l: "Warning" },
                { v: "critical", l: "Critical" },
              ]}
              onChange={(v) =>
                patch({ machine: { ...draft.machine, status: v as MachineData["machine"]["status"] } })
              }
            />
          </div>
        </Card>

        {/* Specs */}
        <Card
          title="Specifications"
          action={
            <AddBtn
              onClick={() =>
                patch({ specs: [...draft.specs, { label: "New Spec", value: "" }] })
              }
            />
          }
        >
          <div className="space-y-3">
            {draft.specs.map((s, i) => (
              <Row key={i} onRemove={() => patch({ specs: draft.specs.filter((_, j) => j !== i) })}>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <Field
                    label="Label"
                    value={s.label}
                    onChange={(v) => updateArr(draft.specs, i, { label: v }, (a) => patch({ specs: a }))}
                  />
                  <Field
                    label="Value"
                    value={s.value}
                    onChange={(v) => updateArr(draft.specs, i, { value: v }, (a) => patch({ specs: a }))}
                  />
                </div>
              </Row>
            ))}
          </div>
        </Card>

        {/* Live Data */}
        <Card
          title="Live Condition Data"
          action={
            <AddBtn
              onClick={() =>
                patch({
                  liveData: [
                    ...draft.liveData,
                    { label: "New", value: "0", unit: "", detail: "", level: "ok" },
                  ],
                })
              }
            />
          }
        >
          <div className="space-y-4">
            {draft.liveData.map((d, i) => (
              <Row
                key={i}
                onRemove={() => patch({ liveData: draft.liveData.filter((_, j) => j !== i) })}
              >
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                  <Field
                    label="Label"
                    value={d.label}
                    onChange={(v) =>
                      updateArr(draft.liveData, i, { label: v }, (a) => patch({ liveData: a }))
                    }
                  />
                  <Field
                    label="Value"
                    value={d.value}
                    onChange={(v) =>
                      updateArr(draft.liveData, i, { value: v }, (a) => patch({ liveData: a }))
                    }
                  />
                  <Field
                    label="Unit"
                    value={d.unit}
                    onChange={(v) =>
                      updateArr(draft.liveData, i, { unit: v }, (a) => patch({ liveData: a }))
                    }
                  />
                  <Field
                    label="Detail"
                    value={d.detail}
                    onChange={(v) =>
                      updateArr(draft.liveData, i, { detail: v }, (a) => patch({ liveData: a }))
                    }
                  />
                  <SelectField
                    label="Level"
                    value={d.level}
                    options={[
                      { v: "ok", l: "OK" },
                      { v: "warning", l: "Warning" },
                      { v: "critical", l: "Critical" },
                    ]}
                    onChange={(v) =>
                      updateArr(
                        draft.liveData,
                        i,
                        { level: v as LiveStat["level"] },
                        (a) => patch({ liveData: a }),
                      )
                    }
                  />
                </div>
              </Row>
            ))}
          </div>
        </Card>

        {/* Maintenance Summary */}
        <Card title="Maintenance Summary">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Preventive — Last"
              value={draft.maintenanceSummary.preventive.last}
              onChange={(v) =>
                patch({
                  maintenanceSummary: {
                    ...draft.maintenanceSummary,
                    preventive: { ...draft.maintenanceSummary.preventive, last: v },
                  },
                })
              }
            />
            <Field
              label="Preventive — Next"
              value={draft.maintenanceSummary.preventive.next}
              onChange={(v) =>
                patch({
                  maintenanceSummary: {
                    ...draft.maintenanceSummary,
                    preventive: { ...draft.maintenanceSummary.preventive, next: v },
                  },
                })
              }
            />
            <Field
              label="LLF — Last"
              value={draft.maintenanceSummary.llf.last}
              onChange={(v) =>
                patch({
                  maintenanceSummary: {
                    ...draft.maintenanceSummary,
                    llf: { ...draft.maintenanceSummary.llf, last: v },
                  },
                })
              }
            />
            <Field
              label="LLF — Next"
              value={draft.maintenanceSummary.llf.next}
              onChange={(v) =>
                patch({
                  maintenanceSummary: {
                    ...draft.maintenanceSummary,
                    llf: { ...draft.maintenanceSummary.llf, next: v },
                  },
                })
              }
            />
            <Field
              label="Installed"
              value={draft.maintenanceSummary.installed}
              onChange={(v) =>
                patch({
                  maintenanceSummary: { ...draft.maintenanceSummary, installed: v },
                })
              }
            />
          </div>
        </Card>

        {/* Parts */}
        <Card
          title="Parts & Tools"
          action={
            <AddBtn
              label="Add part"
              onClick={() =>
                patch({
                  parts: [
                    ...draft.parts,
                    {
                      id: `part-${Date.now()}`,
                      name: "New Part",
                      serial: "",
                      installed: "",
                      health: "good",
                      events: [],
                    },
                  ],
                })
              }
            />
          }
        >
          <div className="space-y-5">
            {draft.parts.map((p, i) => (
              <PartEditor
                key={p.id}
                part={p}
                onChange={(np) => updateArr(draft.parts, i, np, (a) => patch({ parts: a }))}
                onRemove={() => patch({ parts: draft.parts.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Card>

        {/* Breakdowns */}
        <Card
          title="Breakdown History"
          action={
            <AddBtn
              onClick={() =>
                patch({
                  breakdowns: [
                    { date: "", duration: "", issue: "", rootCause: "", action: "" },
                    ...draft.breakdowns,
                  ],
                })
              }
            />
          }
        >
          <div className="space-y-4">
            {draft.breakdowns.map((b, i) => (
              <BreakdownEditor
                key={i}
                value={b}
                onChange={(nb) =>
                  updateArr(draft.breakdowns, i, nb, (a) => patch({ breakdowns: a }))
                }
                onRemove={() =>
                  patch({ breakdowns: draft.breakdowns.filter((_, j) => j !== i) })
                }
              />
            ))}
          </div>
        </Card>

        {/* Vibration data */}
        <Card title="Vibration Readings">
          <div className="space-y-6">
            {(["motor", "blower"] as PartKey[]).map((pk) => (
              <div key={pk}>
                <div className="text-sm font-semibold capitalize mb-3">{pk}</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(["DE", "NDE"] as SideKey[]).map((sk) => (
                    <ReadingsEditor
                      key={sk}
                      title={sk === "DE" ? "Drive End" : "Non-Drive End"}
                      readings={draft.vibration[pk][sk]}
                      onChange={(rs) =>
                        patch({
                          vibration: {
                            ...draft.vibration,
                            [pk]: { ...draft.vibration[pk], [sk]: rs },
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Reports */}
        <Card
          title="Maintenance Reports"
          action={
            <AddBtn
              label="Add report"
              onClick={() =>
                patch({
                  reports: [
                    {
                      date: "",
                      technician: "",
                      task: "New Report",
                      notes: "",
                      rootCause: "",
                      before: draft.reports[0]?.before ?? "",
                      after: draft.reports[0]?.after ?? "",
                    },
                    ...draft.reports,
                  ],
                })
              }
            />
          }
        >
          <div className="space-y-4">
            {draft.reports.map((r, i) => (
              <ReportEditor
                key={i}
                value={r}
                onChange={(nr) => updateArr(draft.reports, i, nr, (a) => patch({ reports: a }))}
                onRemove={() => patch({ reports: draft.reports.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Card>

        {/* Floating save */}
        <div className="fixed bottom-4 inset-x-0 px-4 sm:hidden z-30">
          <button
            onClick={save}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg"
          >
            <Save className="size-4" />
            {savedAt ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------- sub editors ---------- */

function PartEditor({
  part,
  onChange,
  onRemove,
}: {
  part: Part;
  onChange: (p: Part) => void;
  onRemove: () => void;
}) {
  const updateEvent = (i: number, patch: Partial<PartEvent>) =>
    onChange({
      ...part,
      events: part.events.map((e, j) => (j === i ? { ...e, ...patch } : e)),
    });

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{part.name || "Unnamed part"}</div>
        <RemoveBtn onClick={onRemove} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name" value={part.name} onChange={(v) => onChange({ ...part, name: v })} />
        <Field
          label="Serial"
          value={part.serial}
          onChange={(v) => onChange({ ...part, serial: v })}
        />
        <Field
          label="Installed"
          value={part.installed}
          onChange={(v) => onChange({ ...part, installed: v })}
        />
        <SelectField
          label="Health"
          value={part.health}
          options={[
            { v: "good", l: "Good" },
            { v: "warning", l: "Warning" },
            { v: "critical", l: "Critical" },
          ]}
          onChange={(v) => onChange({ ...part, health: v as Part["health"] })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Events
          </div>
          <AddBtn
            label="Add event"
            small
            onClick={() =>
              onChange({
                ...part,
                events: [{ date: "", type: "serviced", note: "" }, ...part.events],
              })
            }
          />
        </div>
        <div className="space-y-3">
          {part.events.map((e, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Field
                  label="Date"
                  value={e.date}
                  onChange={(v) => updateEvent(i, { date: v })}
                />
                <SelectField
                  label="Type"
                  value={e.type}
                  options={[
                    { v: "replaced", l: "Replaced" },
                    { v: "failed", l: "Failed" },
                    { v: "serviced", l: "Serviced" },
                  ]}
                  onChange={(v) => updateEvent(i, { type: v as PartEvent["type"] })}
                />
                <div className="flex items-end">
                  <RemoveBtn
                    onClick={() =>
                      onChange({
                        ...part,
                        events: part.events.filter((_, j) => j !== i),
                      })
                    }
                  />
                </div>
              </div>
              <Field
                label="Note"
                value={e.note}
                onChange={(v) => updateEvent(i, { note: v })}
              />
              <TextArea
                label="Reason (shown when event is expanded)"
                value={e.reason ?? ""}
                onChange={(v) => updateEvent(i, { reason: v || undefined })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakdownEditor({
  value,
  onChange,
  onRemove,
}: {
  value: Breakdown;
  onChange: (b: Breakdown) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{value.issue || "New breakdown"}</div>
        <RemoveBtn onClick={onRemove} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Date" value={value.date} onChange={(v) => onChange({ ...value, date: v })} />
        <Field
          label="Duration"
          value={value.duration}
          onChange={(v) => onChange({ ...value, duration: v })}
        />
      </div>
      <Field label="Issue" value={value.issue} onChange={(v) => onChange({ ...value, issue: v })} />
      <TextArea
        label="Root cause"
        value={value.rootCause}
        onChange={(v) => onChange({ ...value, rootCause: v })}
      />
      <TextArea
        label="Action taken"
        value={value.action}
        onChange={(v) => onChange({ ...value, action: v })}
      />
    </div>
  );
}

function ReadingsEditor({
  title,
  readings,
  onChange,
}: {
  title: string;
  readings: Reading[];
  onChange: (r: Reading[]) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <AddBtn
          small
          label="Point"
          onClick={() => onChange([...readings, { t: "", v: 0 }])}
        />
      </div>
      <div className="space-y-2">
        {readings.map((r, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label="Time"
                value={r.t}
                onChange={(v) =>
                  onChange(readings.map((x, j) => (j === i ? { ...x, t: v } : x)))
                }
              />
            </div>
            <div className="flex-1">
              <Field
                label="Value (mm/s)"
                type="number"
                value={String(r.v)}
                onChange={(v) =>
                  onChange(
                    readings.map((x, j) => (j === i ? { ...x, v: Number(v) || 0 } : x)),
                  )
                }
              />
            </div>
            <RemoveBtn onClick={() => onChange(readings.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportEditor({
  value,
  onChange,
  onRemove,
}: {
  value: Report;
  onChange: (r: Report) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{value.task || "New report"}</div>
        <RemoveBtn onClick={onRemove} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Task" value={value.task} onChange={(v) => onChange({ ...value, task: v })} />
        <Field label="Date" value={value.date} onChange={(v) => onChange({ ...value, date: v })} />
        <Field
          label="Technician"
          value={value.technician}
          onChange={(v) => onChange({ ...value, technician: v })}
        />
      </div>
      <TextArea
        label="Technician notes"
        value={value.notes}
        onChange={(v) => onChange({ ...value, notes: v })}
      />
      <TextArea
        label="Root cause"
        value={value.rootCause}
        onChange={(v) => onChange({ ...value, rootCause: v })}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <ImageField
          label="Before photo"
          value={value.before}
          onChange={(v) => onChange({ ...value, before: v })}
        />
        <ImageField
          label="After photo"
          value={value.after}
          onChange={(v) => onChange({ ...value, after: v })}
        />
      </div>
    </div>
  );
}

/* ---------- primitives ---------- */

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      {value && (
        <img
          src={value}
          alt={label}
          className="w-full aspect-[4/3] object-cover rounded-md border border-border"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="block text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="...or paste image URL"
        className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}

function Row({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-end gap-2">
      {children}
      <RemoveBtn onClick={onRemove} />
    </div>
  );
}

function AddBtn({
  onClick,
  label = "Add",
  small,
}: {
  onClick: () => void;
  label?: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-border bg-background hover:bg-accent ${
        small ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs"
      }`}
    >
      <Plus className={small ? "size-3" : "size-3.5"} />
      {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 h-9 w-9 grid place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-critical hover:border-critical/40"
      aria-label="Remove"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function updateArr<T>(
  arr: T[],
  i: number,
  patch: Partial<T> | T,
  apply: (next: T[]) => void,
) {
  const next = arr.map((item, j) =>
    j === i ? ({ ...(item as object), ...(patch as object) } as T) : item,
  );
  apply(next);
}

/* unused types kept for clarity */
type _Unused = Spec;
