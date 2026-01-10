"use client";

import { useState } from "react";
import {
  Power,
  Droplets,
  CloudRain,
  AlertTriangle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function ManualControlPage() {
  const [mode, setMode] = useState("AUTO"); // AUTO | MANUAL
  const [pump, setPump] = useState(false);
  const [loading, setLoading] = useState(false);

  // Send command to backend → MQTT → ESP32
  const sendPumpCommand = async (cmd) => {
    setLoading(true);
    try {
      await fetch("/api/pump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = async () => {
    if (mode === "AUTO") {
      setMode("MANUAL");
    } else {
      await sendPumpCommand("OFF");
      setPump(false);
      setMode("AUTO");
    }
  };

  const togglePump = async () => {
    if (mode !== "MANUAL") return;

    if (pump) {
      await sendPumpCommand("OFF");
      setPump(false);
    } else {
      await sendPumpCommand("ON");
      setPump(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8">
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Manual Control
        </h1>
        <p className="text-slate-400">
          Override automated irrigation for maintenance and safety
        </p>
      </div>
</div>
      {/* MODE CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {mode === "AUTO" ? (
            <ToggleLeft size={36} className="text-slate-500" />
          ) : (
            <ToggleRight size={36} className="text-emerald-500" />
          )}
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase">
              Control Mode
            </p>
            <p className="text-2xl font-bold text-white">
              {mode}
            </p>
          </div>
        </div>

        <button
          onClick={toggleMode}
          className={`px-6 py-3 rounded-xl font-bold transition
            ${mode === "AUTO"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"}
          `}
        >
          Switch to {mode === "AUTO" ? "MANUAL" : "AUTO"}
        </button>
      </div>

      {/* CONTROL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PUMP CARD */}
        <div className={`rounded-3xl p-6 border transition
          ${pump
            ? "bg-emerald-500/10 border-emerald-500"
            : "bg-slate-900/60 border-slate-800"}
        `}>
          <div className="flex justify-between items-center mb-4">
            <Power className={pump ? "text-emerald-500" : "text-slate-500"} />
            <span className="text-xl font-bold text-white">
              {pump ? "ON" : "OFF"}
            </span>
          </div>

          <h3 className="text-slate-400 text-sm uppercase font-semibold mb-4">
            Pump Control
          </h3>

          <button
            onClick={togglePump}
            disabled={mode === "AUTO" || loading}
            className={`w-full py-3 rounded-xl font-bold transition
              ${mode === "AUTO"
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : pump
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"}
            `}
          >
            {loading ? "Sending..." : pump ? "Turn OFF Pump" : "Turn ON Pump"}
          </button>
        </div>

        {/* SAFETY STATUS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">
            Safety Status
          </h3>

          <StatusRow
            icon={<Droplets className="text-sky-400" />}
            label="Water Level"
            value="OK"
            status="OK"
          />

          <StatusRow
            icon={<CloudRain className="text-indigo-400" />}
            label="Rain Detected"
            value="NO"
            status="OK"
          />

          <StatusRow
            icon={<AlertTriangle className="text-yellow-400" />}
            label="System Mode"
            value={mode === "MANUAL" ? "Manual Override" : "Auto Mode"}
            status={mode === "MANUAL" ? "WARN" : "OK"}
          />
        </div>
      </div>
    </div>
  );
}

/* -------- COMPONENT -------- */

function StatusRow({ icon, label, value, status }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <div className="p-2 bg-slate-800 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase font-semibold">
            {label}
          </p>
          <p className="text-white font-bold">
            {value}
          </p>
        </div>
      </div>

      <span className={`text-xs font-bold px-3 py-1 rounded-full
        ${status === "OK"
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-yellow-500/20 text-yellow-400"}
      `}>
        {status}
      </span>
    </div>
  );
}
