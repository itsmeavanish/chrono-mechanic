import { useSyncExternalStore } from "react";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";

export type Level = "ok" | "warning" | "critical";
export type Health = "good" | "warning" | "critical";

export type Spec = { label: string; value: string };
export type LiveStat = { label: string; value: string; unit: string; detail: string; level: Level };

export type PartEvent = {
  date: string;
  type: "replaced" | "failed" | "serviced";
  note: string;
  reason?: string;
};
export type Part = {
  id: string;
  name: string;
  serial: string;
  installed: string;
  health: Health;
  events: PartEvent[];
};

export type Breakdown = {
  date: string;
  duration: string;
  issue: string;
  rootCause: string;
  action: string;
};

export type MaintenanceSummary = {
  preventive: { last: string; next: string };
  llf: { last: string; next: string };
  installed: string;
};

export type Reading = { t: string; v: number };
export type PartKey = "motor" | "blower";
export type SideKey = "DE" | "NDE";

export type Report = {
  date: string;
  technician: string;
  task: string;
  notes: string;
  rootCause: string;
  before: string;
  after: string;
};

export type MachineInfo = {
  name: string;
  type: string;
  assetId: string;
  model: string;
  location: string;
  function: string;
  installed: string;
  status: Level;
};

export type MachineData = {
  machine: MachineInfo;
  specs: Spec[];
  liveData: LiveStat[];
  maintenanceSummary: MaintenanceSummary;
  parts: Part[];
  breakdowns: Breakdown[];
  vibration: Record<PartKey, Record<SideKey, Reading[]>>;
  reports: Report[];
};

export const DEFAULT_DATA: MachineData = {
  machine: {
    name: "AHU-Quench SH1",
    type: "Air Handling Unit — Quench",
    assetId: "AHU-QUENCH-SH1",
    model: "Krupp Kautex KBB-50",
    location: "PSF CP4 Plant · Bay 3",
    function: "Supply air system — supplies clean & conditioned quench air",
    installed: "12 Aug 2018",
    status: "warning",
  },
  specs: [
    { label: "Rated Power", value: "75 kW" },
    { label: "Clamp Force", value: "500 kN" },
    { label: "Shot Weight", value: "1,200 g" },
    { label: "Cycle Time", value: "18 s" },
    { label: "Operating Temp", value: "180–230 °C" },
    { label: "Air Pressure", value: "8–10 bar" },
  ],
  liveData: [
    { label: "Vibration", value: "5.9", unit: "mm/s", detail: "Blower DE · trend ↑", level: "warning" },
    { label: "Bearing Temp", value: "62", unit: "°C", detail: "Within range", level: "ok" },
    { label: "Filter ΔP", value: "1.4", unit: "bar", detail: "Replace > 1.8", level: "ok" },
  ],
  maintenanceSummary: {
    preventive: { last: "14 Jun 2026", next: "14 Sep 2026" },
    llf: { last: "02 May 2026", next: "02 Aug 2026" },
    installed: "12 Aug 2018",
  },
  parts: [
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
          reason: "Internal seal degradation in pump head. Rebuilt pump cartridge, flushed lines.",
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
  ],
  breakdowns: [
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
  ],
  vibration: {
    motor: {
      DE: [
        { t: "08:00", v: 1.2 },
        { t: "10:00", v: 1.6 },
        { t: "12:00", v: 1.9 },
        { t: "14:00", v: 2.1 },
        { t: "16:00", v: 2.4 },
        { t: "18:00", v: 2.1 },
      ],
      NDE: [
        { t: "08:00", v: 1.4 },
        { t: "10:00", v: 1.8 },
        { t: "12:00", v: 2.3 },
        { t: "14:00", v: 2.6 },
        { t: "16:00", v: 2.9 },
        { t: "18:00", v: 2.8 },
      ],
    },
    blower: {
      DE: [
        { t: "08:00", v: 2.1 },
        { t: "10:00", v: 3.2 },
        { t: "12:00", v: 4.4 },
        { t: "14:00", v: 5.1 },
        { t: "16:00", v: 5.8 },
        { t: "18:00", v: 5.9 },
      ],
      NDE: [
        { t: "08:00", v: 2.6 },
        { t: "10:00", v: 4.0 },
        { t: "12:00", v: 5.4 },
        { t: "14:00", v: 6.3 },
        { t: "16:00", v: 6.9 },
        { t: "18:00", v: 7.2 },
      ],
    },
  },
  reports: [
    {
      date: "22 May 2026",
      technician: "Pending Assessment",
      task: "Complete Overhaul & Part Replacement",
      notes:
        "Spare parts replaced: Shaft, Impeller, Bearings, Blower Pulley, Motor pulley, Belt, and Vibration isolators.",
      rootCause: "Pending assessment update — kept editable for upcoming details.",
      before: beforeImg,
      after: afterImg,
    },
    {
      date: "20 Sep 2015",
      technician: "Historical Record",
      task: "Blower & Motor Assembly Overhaul",
      notes: "Spare parts replaced: Blower Fan Pulley, Motor Pulley, Belt, and Blower Motor.",
      rootCause: "Wear and tear over operational period",
      before: beforeImg,
      after: afterImg,
    },
    {
      date: "29 Aug 2014",
      technician: "Historical Record",
      task: "Cooling & Air Handling Unit Overhaul",
      notes:
        "Spare parts replaced: 4x Cooling coil, 1x Rollamatic filter assembly, Air washer unit, 3x Doors, 7x Coil valves, Both Bearings, and Rotor assembly.",
      rootCause: "Major scheduled maintenance cycle",
      before: beforeImg,
      after: afterImg,
    },
    {
      date: "13 Jan 2012",
      technician: "Historical Record",
      task: "Impeller & Pulley Maintenance",
      notes:
        "Spare parts replaced/serviced: Impeller Balancing, Blower Pulley changed, Motor Pulley changed, Structure & casing painting.",
      rootCause: "Scheduled preventive maintenance & wear",
      before: beforeImg,
      after: afterImg,
    },
    {
      date: "20 Feb 2007",
      technician: "Historical Record",
      task: "Rotor & Drive Assembly Replacement",
      notes:
        "Spare parts replaced/serviced: Motor Pulley replaced, Blower pulley replaced, Shaft with rotor replaced, Both bearings replaced, Belt laser alignment done.",
      rootCause: "Extensive wear causing drive instability",
      before: beforeImg,
      after: afterImg,
    },
  ],
};

const STORAGE_KEY = "machine-data-v1";
const EVENT = "machine-data-changed";

let cache: MachineData | null = null;

function read(): MachineData {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = DEFAULT_DATA;
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as MachineData) : DEFAULT_DATA;
  } catch {
    cache = DEFAULT_DATA;
  }
  return cache;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const handler = () => cb();
  if (typeof window !== "undefined") window.addEventListener(EVENT, handler);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener(EVENT, handler);
  };
}

export function setMachineData(next: MachineData) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }
  listeners.forEach((l) => l());
}

export function resetMachineData() {
  setMachineData(DEFAULT_DATA);
}

export function useMachineData(): MachineData {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_DATA);
}
