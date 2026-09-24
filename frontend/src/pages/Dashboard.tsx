import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileSpreadsheet,
  Ticket as TicketIcon,
  CheckCircle2,
  Radio,
  ArrowUpRight,
  ShieldAlert,
  Activity,
  Cpu,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [sumRes, chartRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardCharts(),
      ]);
      setSummary(sumRes);
      setCharts(chartRes);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading Sentinel Dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Defects Today',
      value: summary?.defects_today ?? 37,
      subText: 'Monitored across all stations',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Open Tickets',
      value: summary?.open_tickets ?? 8,
      subText: 'Auto-created for unknown defects',
      icon: TicketIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Systemic Issues',
      value: summary?.systemic_issues ?? 2,
      subText: 'Threshold exceeded & escalated',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30 glow-red',
    },
    {
      title: 'Open NCRs',
      value: summary?.open_ncrs ?? 3,
      subText: 'Non-Conformance Reports',
      icon: FileSpreadsheet,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Inspection Pass Rate',
      value: `${summary?.pass_rate ?? 97.4}%`,
      subText: 'EOL & In-line Pass Percentage',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Active Stations',
      value: `${summary?.active_stations_online ?? 6} / ${summary?.active_stations_total ?? 7}`,
      subText: 'Lines A & B Operational',
      icon: Cpu,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
            Manufacturing Quality Command Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry monitoring, automated pattern classification & escalation engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/live-monitor')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>Open Live Defect Monitor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl glass-card border ${kpi.bg} transition hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
              <p className="text-[10px] text-slate-500 mt-1 truncate">{kpi.subText}</p>
            </div>
          );
        })}
      </div>

      {/* Active Systemic Issues Banner */}
      {summary?.systemic_alerts && summary.systemic_alerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                Active Systemic Escalations ({summary.systemic_alerts.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/patterns')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Investigate Patterns</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.systemic_alerts.map((sa: any, i: number) => (
              <div
                key={i}
                onClick={() => navigate('/patterns')}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 flex items-center justify-between cursor-pointer hover:border-rose-500/60 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-rose-400 text-sm">{sa.station_code}</span>
                    <span className="text-xs font-bold text-slate-200">
                      {sa.defect_code} — {sa.defect_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <strong className="text-rose-400">{sa.occurrences} occurrences</strong> recorded in last {sa.time_window} min (Threshold: {sa.threshold})
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 uppercase tracking-wider border border-rose-500/30">
                  CRITICAL
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Defects Over Time */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Defects Over Time (Last 24 Hours)
            </h3>
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Hourly Telemetry
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.defects_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="defects" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Defects By Station */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Defects By Station (ST-01 to ST-07)
            </h3>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Station Breakdown
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.defects_by_station || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="defects" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Defect Categories Donut */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Classification Breakdown
            </h3>
            <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Rule Engine
            </span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.defect_categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.defect_categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[10px] font-semibold pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Known</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Unknown</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Systemic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Stream Table Preview */}
      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Recent Defect Telemetry Stream
            </h3>
          </div>
          <button
            onClick={() => navigate('/live-monitor')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Live Stream</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Serial Number</th>
                <th className="py-2.5 px-3">Defect</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(summary?.recent_defects || []).map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{d.station_code}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">{d.serial_number}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-medium">
                    {d.defect_code} — {d.defect_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        d.classification === 'SYSTEMIC'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : d.classification === 'UNKNOWN'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {d.classification}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
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
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/defects/${d.id}`)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
