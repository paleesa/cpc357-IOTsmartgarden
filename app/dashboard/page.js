"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Thermometer, Droplets, Sprout, CloudRain, 
  Waves, Activity, Power,
  Sun, Cloud, CloudLightning, MapPin, Calendar, AlertTriangle
} from 'lucide-react';

export default function IoTDashboard() {
  const [logs, setLogs] = useState([]);
  const [latest, setLatest] = useState(null);
  const [weather, setWeather] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  
  // STATE: Which graph is currently visible?
  const [activeChart, setActiveChart] = useState('temperature'); // 'temperature' | 'humidity' | 'soil'

  // 1. Fetch IoT Logs
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (data) {
        setLogs(data.reverse());
        setLatest(data[data.length - 1]);
      }
    } catch (err) {
      console.error("Supabase Error:", err);
    }
  };

  // 2. Fetch Live Weather
  const fetchWeather = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Penang&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.warn("Using Sim Data");
      setWeather({
        name: "Penang (Sim)",
        main: { temp: 29 },
        weather: [{ id: 800, description: "Sunny" }]
      });
    }
  };

  useEffect(() => {
    setCurrentTime(new Date());
    fetchLogs();
    fetchWeather();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    const channel = supabase
      .channel('realtime-garden')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_data' }, 
        (payload) => {
          setLogs((prev) => [...prev, payload.new].slice(-30));
          setLatest(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  // Configuration for the 3 different views
  const chartConfig = {
    temperature: {
      color: "#f97316", // Orange
      dataKey: "temperature",
      unit: "°C",
      domain: [20, 40], // Reasonable temp range
      gradientId: "gradTemp"
    },
    humidity: {
      color: "#3b82f6", // Blue
      dataKey: "humidity",
      unit: "%",
      domain: [0, 100],
      gradientId: "gradHum"
    },
    soil: {
      color: "#10b981", // Emerald
      dataKey: "soil_moisture", // Uses RAW value (e.g. 2500)
      unit: " ADC",
      domain: [0, 4095], // Standard ESP32 ADC range
      gradientId: "gradSoil"
    }
  };

  const currentConfig = chartConfig[activeChart];

  if (!currentTime) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Smart Garden
              </span>
            </h1>
            <p className="text-slate-400 font-medium">USM Campus Node • CPC357 Project</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
             <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Calendar size={24} /></div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Today</p>
                <p className="text-xl font-bold text-white">
                  {currentTime.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-6 min-w-[200px]">
              {weather ? (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-indigo-300 mb-1">
                      <MapPin size={14} />
                      <span className="text-xs font-bold uppercase">{weather.name}</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white">{Math.round(weather.main.temp)}°</span>
                    </div>
                  </div>
                  <WeatherIcon code={weather.weather[0].id} />
                </>
              ) : (
                 <div className="flex items-center gap-2 text-slate-500"><AlertTriangle size={20}/><span className="text-xs">No Weather</span></div>
              )}
            </div>
          </div>
        </header>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Thermometer className="text-orange-500" />} label="Temperature" value={`${latest?.temperature ?? '--'}°C`} />
          <StatCard icon={<Droplets className="text-blue-500" />} label="Humidity" value={`${latest?.humidity ?? '--'}%`} />
          <StatCard icon={<Sprout className="text-emerald-500" />} label="Soil Moisture" value={latest?.soil_moisture ?? '--'} sub="Raw ADC" />
          <StatCard icon={<CloudRain className="text-indigo-400" />} label="Rain Sensor" value={latest?.rain_value ?? '--'} />
        </div>

        {/* --- TABBED CHART SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           
           <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl h-[500px] flex flex-col">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-2">
                <Activity className="text-slate-500" size={20} />
                <h3 className="font-bold text-lg text-white">Live Trends</h3>
              </div>
              
              {/* TABS: Switch between graphs */}
              <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                <ChartTab 
                  label="Temperature" 
                  active={activeChart === 'temperature'} 
                  onClick={() => setActiveChart('temperature')}
                  activeColor="bg-orange-500"
                />
                <ChartTab 
                  label="Humidity" 
                  active={activeChart === 'humidity'} 
                  onClick={() => setActiveChart('humidity')}
                  activeColor="bg-blue-500"
                />
                <ChartTab 
                  label="Soil Moisture" 
                  active={activeChart === 'soil'} 
                  onClick={() => setActiveChart('soil')}
                  activeColor="bg-emerald-500"
                />
              </div>
            </div>
            
            {/* The Dynamic Chart */}
            <div className="flex-1 w-full min-h-0"> 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    stroke="#475569" fontSize={11} tickMargin={10}
                  />
                  
                  <YAxis 
                    stroke={currentConfig.color} 
                    fontSize={11} 
                    domain={currentConfig.domain} 
                    unit={currentConfig.unit === ' ADC' ? '' : currentConfig.unit}
                    width={40}
                  />

                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: currentConfig.color }}
                    formatter={(value) => [value + currentConfig.unit, activeChart === 'soil' ? 'Raw Value' : activeChart]}
                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  />

                  <Area 
                    type="monotone" 
                    dataKey={currentConfig.dataKey} 
                    stroke={currentConfig.color} 
                    fill={`url(#${currentConfig.gradientId})`} 
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Controls Side Panel */}
          <div className="space-y-4">
            <div className={`p-6 rounded-3xl border transition-all ${latest?.pump_status === 'ON' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-4">
                <Power className={latest?.pump_status === 'ON' ? 'text-emerald-500' : 'text-slate-500'} />
                <span className="font-bold text-white">{latest?.pump_status ?? 'OFF'}</span>
              </div>
              <h4 className="text-slate-400 text-sm">Pump Status</h4>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
               <div className="flex justify-between items-center mb-4 text-sky-400">
                <Waves size={24} />
                <span className="font-bold">{latest?.water_level ?? 0}%</span>
              </div>
              <h4 className="text-slate-400 text-sm">Water Level</h4>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-sky-500 h-full transition-all duration-1000" style={{ width: `${latest?.water_level ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

// New Tab Button Component
function ChartTab({ label, active, onClick, activeColor }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-xs font-bold transition-all
        ${active ? `${activeColor} text-white shadow-lg` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
      `}
    >
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-2xl">{icon}</div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase">{label}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-white">{value}</h2>
            {sub && <span className="text-[10px] text-slate-500 font-bold uppercase">{sub}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ code }) {
  if (!code) return <Sun className="text-slate-600" size={40} />;
  if (code >= 200 && code < 300) return <CloudLightning className="text-yellow-400" size={40} />;
  if (code >= 300 && code < 600) return <CloudRain className="text-blue-400" size={40} />;
  if (code === 800) return <Sun className="text-orange-400" size={40} />;
  return <Cloud className="text-slate-400" size={40} />;
}