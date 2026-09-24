import React from 'react';
import { Bell, Search, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  unreadAlertCount: number;
  onOpenDemo: () => void;
  onOpenSimulate: () => void;
  onResetDatabase: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  unreadAlertCount,
  onOpenDemo,
  onOpenSimulate,
  onResetDatabase,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Live System Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Line A & B Sentinel Active</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span>Configured Threshold:</span>
          <span className="font-bold text-cyan-400">3 occ / 30 mins</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onResetDatabase}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Reset database to seed state"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Seed</span>
        </button>

        <button
          onClick={onOpenDemo}
          className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer transition"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>Launch Demo</span>
        </button>

        <button
          onClick={onOpenSimulate}
          className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
        >
          <span>+ Simulate Defect</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
              {unreadAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
