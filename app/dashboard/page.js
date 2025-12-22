"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Activity } from 'lucide-react';

export default function IoTDashboard() {
  const [logs, setLogs] = useState([]);
  const [latest, setLatest] = useState({ temperature: 0, humidity: 0 });

  // 1. Fetch initial historical data
  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      const formattedData = data.reverse(); // Show oldest to newest for the chart
      setLogs(formattedData);
      setLatest(data[data.length - 1]);
    }
  };

  useEffect(() => {
    fetchLogs();

    // 2. Setup Real-time Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, 
        (payload) => {
          setLogs((prev) => [...prev.slice(1), payload.new]); // Keep last 20 dots
          setLatest(payload.new);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">IoT Command Center</h1>
            <p className="text-slate-400">USM Campus Node - Live Monitoring</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-500 uppercase">Live Connection</span>
          </div>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-orange-500/10 rounded-xl text-orange-500">
              <Thermometer size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Temperature</p>
              <h2 className="text-4xl font-bold">{latest?.temperature ?? '--'}°C</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
              <Droplets size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Humidity</p>
              <h2 className="text-4xl font-bold">{latest?.humidity ?? '--'}%</h2>
            </div>
          </div>
        </div>

        {/* Historical Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-slate-400" size={20} />
            <h3 className="font-semibold text-lg">Historical Readings</h3>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logs}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="created_at" 
                  tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  stroke="#64748b" fontSize={12} 
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}