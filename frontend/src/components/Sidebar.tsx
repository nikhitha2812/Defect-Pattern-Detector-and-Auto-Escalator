import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BrainCircuit,
  FileSpreadsheet,
  Ticket,
  BarChart3,
  Cpu,
  BookOpen,
  Bell,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  userRole: string;
  userName: string;
  onOpenDemo: () => void;
  onOpenSimulate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  userName,
  onOpenDemo,
  onOpenSimulate,
}) => {
  const navItems = [
    { to: '/', label: 'Main Dashboard', icon: LayoutDashboard },
    { to: '/live-monitor', label: 'Live Defect Monitor', icon: Radio },
    { to: '/patterns', label: 'Pattern Intelligence', icon: BrainCircuit },
    { to: '/ncrs', label: 'NCR Management', icon: FileSpreadsheet },
    { to: '/tickets', label: 'Engineering Tickets', icon: Ticket },
    { to: '/analytics', label: 'Quality Analytics', icon: BarChart3 },
    { to: '/stations', label: 'Station Health', icon: Cpu },
    { to: '/knowledge-base', label: 'Defect Knowledge Base', icon: BookOpen },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-slate-100 uppercase">
              FORGE <span className="text-cyan-400">SENTINEL</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-tight font-medium">
              Manufacturing Quality AI
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2 border-b border-slate-800">
          <button
            onClick={onOpenDemo}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 transition duration-150 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Launch Hackathon Demo
          </button>
          <button
            onClick={onOpenSimulate}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            + Simulate Defect
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
            {userName ? userName.charAt(0) : 'E'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{userName || 'Alex Rivera'}</p>
            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
              {userRole || 'ENGINEER'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
