import React, { useEffect, useState } from 'react';
import { Cpu, Activity, AlertTriangle, CheckCircle2, User, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const StationHealth: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getStations()
      .then((res) => setStations(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading station telemetry health grid...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Line Stations Telemetry & Health Grid
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time operating state, defect rate, and operator assignment across Stations ST-01 to ST-07
          </p>
        </div>
      </div>

      {/* Grid of Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((st) => {
          const isRed = st.status === 'RED';
          const isYellow = st.status === 'YELLOW';
          const isGreen = st.status === 'GREEN';

          return (
            <div
              key={st.id}
              onClick={() => navigate(`/live-monitor`)}
              className={`glass-card p-6 rounded-2xl border transition hover:scale-[1.01] cursor-pointer space-y-4 ${
                isRed
                  ? 'border-rose-500/50 bg-rose-950/20 glow-red'
                  : isYellow
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-100">{st.station_code}</h3>
                  <p className="text-xs text-slate-400">{st.station_name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isRed
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                      : isYellow
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  {st.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Defects</span>
                  <p className={`font-extrabold text-sm ${isRed ? 'text-rose-400' : 'text-slate-200'}`}>
                    {st.defect_count}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Defect Rate</span>
                  <p className={`font-extrabold text-sm ${isRed ? 'text-rose-400' : 'text-slate-200'}`}>
                    {st.defect_rate}%
                  </p>
                </div>
              </div>

              {/* Operator & Inspection Footer */}
              <div className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Current Operator:</span>
                  </span>
                  <strong className="text-slate-200">{st.current_operator || 'OP-104'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Last Inspection:</span>
                  </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {st.last_inspection ? new Date(st.last_inspection).toLocaleTimeString() : '2 min ago'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
