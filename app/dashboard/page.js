"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Thermometer, Droplets, Sprout, CloudRain, 
  Waves, Battery, Activity, Power
} from 'lucide-react';

export default function IoTDashboard() {
  const [logs, setLogs] = useState([]);
  const [latest, setLatest] = useState(null);

  const fetchLogs = async () => {
    // Note: Table name must match the SQL we created earlier: 'sensor_data'
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (data) {
      const formattedData = data.reverse();
      setLogs(formattedData);
      setLatest(data[data.length - 1]);
    }
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('realtime-garden')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_data' }, 
        (payload) => {
          setLogs((prev) => [...prev.slice(1), payload.new]);
          setLatest(payload.new);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Garden Monitoring</h1>
            <p className="text-slate-400 mt-1">USM Campus Node • CPC357 Project</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
            <div className={`w-3 h-3 rounded-full animate-pulse ${latest ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {latest ? 'Live System Online' : 'Connecting...'}
            </span>
          </div>
        </header>

        {/* Real-time Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Temperature */}
          <StatCard 
            icon={<Thermometer className="text-orange-500" />} 
            label="Ambient Temp" 
            value={`${latest?.temperature ?? '--'}°C`} 
            color="orange" 
          />
          
          {/* Humidity */}
          <StatCard 
            icon={<Droplets className="text-blue-500" />} 
            label="Air Humidity" 
            value={`${latest?.humidity ?? '--'}%`} 
            color="blue" 
          />

          {/* Soil Moisture */}
          <StatCard 
            icon={<Sprout className="text-emerald-500" />} 
            label="Soil Moisture" 
            value={latest?.soil_moisture ?? '--'} 
            sub="Raw ADC"
            color="emerald" 
          />

          {/* Rain Intensity */}
          <StatCard 
            icon={<CloudRain className="text-indigo-400" />} 
            label="Rain Detection" 
            value={latest?.rain_value ?? '--'} 
            sub={latest?.rain_value < 1000 ? "Raining" : "Dry"}
            color="indigo" 
          />
        </div>

        {/* System Health & Logic Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Historical Area Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="text-slate-500" size={20} />
                <h3 className="font-bold text-lg text-white">Environmental Trends</h3>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    stroke="#475569" fontSize={11}
                  />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Area 
                    name="Temp (°C)" type="monotone" dataKey="temperature" 
                    stroke="#f97316" fill="url(#gradTemp)" strokeWidth={2}
                  />
                  <Area 
                    name="Soil (Raw)" type="monotone" dataKey="soil_moisture" 
                    stroke="#10b981" fillOpacity={0} strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Control Panel */}
          <div className="space-y-4">
            {/* Pump Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-500 ${latest?.pump_status === 'ON' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Power className={latest?.pump_status === 'ON' ? 'text-emerald-500' : 'text-slate-500'} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${latest?.pump_status === 'ON' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                  {latest?.pump_status ?? 'UNKNOWN'}
                </span>
              </div>
              <h4 className="text-slate-400 text-sm font-medium">Water Pump System</h4>
              <p className="text-2xl font-bold text-white mt-1">
                {latest?.pump_status === 'ON' ? 'Actively Irrigating' : 'System Standby'}
              </p>
            </div>

            {/* Level Card */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4 text-sky-400">
                <Waves size={24} />
                <span className="font-bold">{latest?.water_level ?? 0}%</span>
              </div>
              <h4 className="text-slate-400 text-sm font-medium">Tank Water Level</h4>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-sky-500 h-full transition-all duration-1000" 
                  style={{ width: `${latest?.water_level ?? 0}%` }}
                />
              </div>
            </div>

            {/* Battery Card */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <Battery size={24} className={latest?.battery < 20 ? 'text-red-500' : 'text-emerald-500'} />
                <span className="font-bold">{latest?.battery ?? 0}%</span>
              </div>
              <h4 className="text-slate-400 text-sm font-medium">Battery Storage</h4>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${latest?.battery < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${latest?.battery ?? 0}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component for simple Stat Cards
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-2xl">{icon}</div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-white">{value}</h2>
            {sub && <span className="text-[10px] text-slate-500 font-bold uppercase">{sub}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}