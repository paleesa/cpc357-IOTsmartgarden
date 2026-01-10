"use client";

import { useState } from "react";
import {
  Sprout,
  Thermometer,
  Droplets,
  CloudRain,
  Waves,
  Save,
  RotateCcw
} from "lucide-react";

export default function CalibrationPage() {
  const [values, setValues] = useState({
    soilDry: 1200,
    soilWet: 3000,
    tempMin: 18,
    tempMax: 38,
    humMin: 40,
    humMax: 85,
    rainThreshold: 2500,
    waterLow: 25,
  });

  const update = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const saveCalibration = () => {
    alert("Calibration settings saved successfully!");
  };

  const resetDefaults = () => {
    setValues({
      soilDry: 1200,
      soilWet: 3000,
      tempMin: 18,
      tempMax: 38,
      humMin: 40,
      humMax: 85,
      rainThreshold: 2500,
      waterLow: 25,
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8">
        <div className="max-w-6xl mx-auto space-y-8">

        
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Sensor Calibration
        </h1>
        <p className="text-slate-400">
          Configure sensor thresholds for accurate monitoring and automation
        </p>
        </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <CalibrationCard
          icon={<Sprout className="text-emerald-400" />}
          title="Soil Moisture"
        >
          <RangeInput label="Dry Threshold (ADC)" value={values.soilDry} onChange={(v) => update("soilDry", v)} />
          <RangeInput label="Wet Threshold (ADC)" value={values.soilWet} onChange={(v) => update("soilWet", v)} />
        </CalibrationCard>

        <CalibrationCard
          icon={<Thermometer className="text-orange-400" />}
          title="Temperature"
        >
          <RangeInput label="Minimum Temperature (°C)" value={values.tempMin} onChange={(v) => update("tempMin", v)} />
          <RangeInput label="Maximum Temperature (°C)" value={values.tempMax} onChange={(v) => update("tempMax", v)} />
        </CalibrationCard>

        <CalibrationCard
          icon={<Droplets className="text-blue-400" />}
          title="Humidity"
        >
          <RangeInput label="Minimum Humidity (%)" value={values.humMin} onChange={(v) => update("humMin", v)} />
          <RangeInput label="Maximum Humidity (%)" value={values.humMax} onChange={(v) => update("humMax", v)} />
        </CalibrationCard>

        <CalibrationCard
          icon={<CloudRain className="text-indigo-400" />}
          title="Rain Sensor"
        >
          <RangeInput label="Rain Detection Threshold (ADC)" value={values.rainThreshold} onChange={(v) => update("rainThreshold", v)} />
        </CalibrationCard>

        <CalibrationCard
          icon={<Waves className="text-sky-400" />}
          title="Water Level"
        >
          <RangeInput label="Low Water Warning (%)" value={values.waterLow} onChange={(v) => update("waterLow", v)} />
        </CalibrationCard>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <button
          onClick={resetDefaults}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          <RotateCcw size={16} />
          Reset Defaults
        </button>

        <button
          onClick={saveCalibration}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
        >
          <Save size={18} />
          Save Calibration
        </button>
      </div>
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function CalibrationCard({ icon, title, children }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 backdrop-blur p-6 rounded-3xl space-y-4 hover:border-emerald-500/40 transition">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-800 rounded-2xl">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}


function RangeInput({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-slate-400 text-sm font-semibold">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full rounded-xl px-4 py-2
          bg-slate-800 border border-slate-700
          text-white
          focus:outline-none
          focus:ring-2 focus:ring-emerald-500/60
          focus:border-emerald-500
          transition
        "
      />
    </div>
  );
}

