import React, { useEffect, useState } from 'react';
import { Radio, Filter, Plus, Search, Eye, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface LiveMonitorProps {
  onOpenSimulate: () => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ onOpenSimulate }) => {
  const [defects, setDefects] = useState<any[]>([]);
  const [stationFilter, setStationFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const navigate = useNavigate();

  const loadDefects = async () => {
    try {
      const params: Record<string, string> = {};
      if (stationFilter) params.station_code = stationFilter;
      if (severityFilter) params.severity = severityFilter;
      if (search) params.search = search;

      const data = await api.getDefects(params);
      setDefects(data);
    } catch (err) {
      console.error('Error fetching defects stream', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefects();

    // Setup WebSocket connection for live telemetry stream
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event_type === 'NEW_DEFECT' && payload.defect) {
            setDefects((prev) => [payload.defect, ...prev]);
          }
        } catch (e) {
          console.error('WS payload error', e);
        }
      };
      ws.onclose = () => setWsConnected(false);
    } catch (e) {
      setWsConnected(false);
    }

    // Backup Polling
    const interval = setInterval(loadDefects, 4000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [stationFilter, severityFilter, search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Live Defect Telemetry Stream
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous manufacturing event feed evaluated by real-time rule engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-slate-300 font-semibold">
              {wsConnected ? 'WebSocket Live Connected' : 'Polling Sync Active'}
            </span>
          </div>

          <button
            onClick={onOpenSimulate}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Simulate Defect</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search serial, defect, station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Stations</option>
            <option value="ST-01">ST-01 — Assembly</option>
            <option value="ST-02">ST-02 — Laser Weld</option>
            <option value="ST-03">ST-03 — AOI Inspection</option>
            <option value="ST-04">ST-04 — Electrical Test</option>
            <option value="ST-05">ST-05 — Final Casing</option>
            <option value="ST-06">ST-06 — EOL Functional</option>
            <option value="ST-07">ST-07 — Packaging</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Showing <strong className="text-cyan-400">{defects.length}</strong> events
        </span>
      </div>

      {/* Real-time Stream Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Defect Code & Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                    No defect events found matching filter criteria.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(d.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-200">{d.station_code}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{d.serial_number}</td>
                    <td className="py-3 px-4 text-slate-200">
                      <span className="font-bold text-slate-100">{d.defect_code}</span> — {d.defect_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                          d.classification === 'SYSTEMIC'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 glow-red'
                            : d.classification === 'UNKNOWN'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        }`}
                      >
                        {d.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold ${
                          d.severity === 'CRITICAL' || d.severity === 'HIGH'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{d.operator_name || 'OP-104'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/defects/${d.id}`)}
                        className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
