"use client";

import { LayoutDashboard, Sliders, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItem = (href, label, Icon) => (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
        ${pathname === href 
          ? "bg-emerald-500/20 text-emerald-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"}
      `}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="w-64 min-h-screen bg-[#020617] border-r border-slate-800 p-4 space-y-6">
      <h2 className="text-xl font-extrabold text-white px-2">
        🌱 Smart Garden
      </h2>

      <nav className="space-y-2">
        {navItem("/dashboard", "Dashboard", LayoutDashboard)}
        {navItem("/calibration", "Calibration", Sliders)}
        {navItem("/manual-control", "Manual Control", BarChart2)}
        
      </nav>
    </aside>
  );
}
