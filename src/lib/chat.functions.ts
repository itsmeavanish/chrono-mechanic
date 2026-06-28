import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MACHINE_CONTEXT = `You are a maintenance assistant for ONE specific machine. Answer concisely, in plain language, in 2-5 sentences unless the user explicitly asks for more detail. If a question is unrelated to this machine or maintenance, politely redirect.

MACHINE PROFILE
- Name: AHU-Quench SH1 (Blow Molding Unit BM-04 line)
- Asset ID: AHU-QUENCH-SH1
- Equipment type: Air Handling Unit — Quench
- Location: PSF CP4 Plant · Bay 3 · Line B
- Function: Supply air system — supplies clean and conditioned quench air
- Model: Krupp Kautex KBB-50
- Installed: 12 Aug 2018
- Rated power 75 kW · Clamp 500 kN · Shot 1200 g · Cycle 18s · Temp 180-230°C · Air 8-10 bar

CURRENT STATUS: Operational (Yellow — Blow Pin warning, Heater Zone-3 critical)

LIVE READINGS
- Vibration Motor DE 2.1 mm/s (OK), NDE 2.8 mm/s (OK)
- Vibration Blower DE 5.9 mm/s (Warning), NDE 7.2 mm/s (Critical)
- Bearing temp 62°C (OK)
- Filter DP 1.4 bar (OK, replace > 1.8)

PARTS HEALTH
- Blow Pin Assembly (BP-2245-A): Warning. Last failure 22 Feb 2026 — worn O-ring caused seal blow-out.
- Main Drive Motor (ABB-M3BP-200): Good. Overheat trip 08 Jan 2026 — cooling intake debris.
- Hydraulic Pump (RX-HP-118): Good. Pressure drop Aug 2025 — pump cartridge rebuilt.
- Barrel Heater Bands (HB-Z4-08): Critical. Zone-3 open circuit on 20 Jun 2026 — element burnout, running on bypass.

MAINTENANCE
- Last preventive maintenance: 14 Jun 2026 (R. Mehta) — bearing grease, alignment 0.04mm
- Next preventive due: 14 Sep 2026
- Last LLF: 02 May 2026 · Next LLF due: 02 Aug 2026
- Last 5 services: PM 14 Jun, Blow timing 10 Jun, Oil filter 02 May, Blow pin seal 22 Feb, Motor cooling 08 Jan.

Be specific, cite dates/values from above when relevant. If asked about something not in the profile, say it is not in the current records.`;

const Input = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export const askMachine = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;
    
    if (geminiKey) {
      // Native Gemini REST API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const contents = data.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: { text: MACHINE_CONTEXT } },
          contents,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as any;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "(no response)";
      return { text };
    } 
    
    if (lovableKey) {
      // Lovable OpenAI-compatible Gateway
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableKey,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: MACHINE_CONTEXT }, ...data.messages],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        if (res.status === 429) throw new Error("Rate limit — please try again in a moment.");
        if (res.status === 402)
          throw new Error("AI credits exhausted. Add credits in Lovable settings.");
        throw new Error(`Lovable AI error ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content?.trim() ?? "(no response)";
      return { text };
    }

    throw new Error("Missing GEMINI_API_KEY or LOVABLE_API_KEY");
  });
