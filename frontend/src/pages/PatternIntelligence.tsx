import React, { useEffect, useState } from 'react';
import { BrainCircuit, Search, ArrowRight, ShieldAlert, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const PatternIntelligence: React.FC = () => {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [stationFilter, setStationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPatterns = async () => {
    try {
      const params: Record<string, string> = {};
      if (stationFilter) params.station_code = stationFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await api.getPatterns(params);
      setPatterns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, [stationFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Defect Pattern Intelligence Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated cluster analysis identifying repeated station anomalies & systemic line risk
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Active Escalations: <strong className="text-rose-400">{patterns.filter(p => p.status === 'ESCALATED').length}</strong>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Stations</option>
            <option value="ST-01">ST-01 — Assembly</option>
            <option value="ST-02">ST-02 — Laser Weld</option>
            <option value="ST-03">ST-03 — Visual AOI</option>
            <option value="ST-04">ST-04 — Electrical Test</option>
            <option value="ST-05">ST-05 — Final Casing</option>
            <option value="ST-06">ST-06 — EOL Test</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{patterns.length}</strong> pattern clusters
        </span>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patterns.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 italic glass-card rounded-2xl">
            No pattern clusters detected matching current filters.
          </div>
        ) : (
          patterns.map((p: any) => {
            const isEscalated = p.status === 'ESCALATED';
            return (
              <div
                key={p.id}
                className={`glass-card p-6 rounded-2xl border transition hover:scale-[1.01] space-y-4 ${
                  isEscalated
                    ? 'border-rose-500/40 bg-rose-950/10 glow-red'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      isEscalated
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {p.classification || 'SYSTEMIC'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-200">{p.station_code}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-100">
                    {p.defect_code} — {p.defect_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.station_name}</p>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Occurrences</span>
                    <p className="font-extrabold text-rose-400 text-sm">{p.occurrence_count}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Threshold</span>
                    <p className="font-extrabold text-slate-300 text-sm">{p.threshold}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Window</span>
                    <p className="font-extrabold text-slate-300 text-sm">{p.time_window} min</p>
                  </div>
                </div>

                {/* Timestamp Details */}
                <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/60 pt-3">
                  <div className="flex justify-between">
                    <span>First Seen:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(p.first_occurrence).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Seen:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(p.last_occurrence).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Investigate Button */}
                <button
                  onClick={() => navigate(`/patterns/${p.id}`)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Investigate Pattern</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
