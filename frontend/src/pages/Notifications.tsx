import React, { useEffect, useState } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const Notifications: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(severityFilter ? { severity: severityFilter } : undefined);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter]);

  const handleAck = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      await loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Sentinel Notification Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical line alerts, threshold warnings, and system event notifications
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Unread Alerts: <strong className="text-rose-400">{alerts.filter(a => !a.acknowledged).length}</strong>
        </span>
      </div>

      {/* Filter */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
          <option value="INFO">INFO</option>
        </select>

        <span className="text-xs text-slate-400">Total Notifications: {alerts.length}</span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic glass-card rounded-2xl">
            No notifications available.
          </div>
        ) : (
          alerts.map((a) => {
            const isCritical = a.severity === 'CRITICAL';
            const isWarning = a.severity === 'WARNING';

            return (
              <div
                key={a.id}
                className={`glass-card p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  !a.acknowledged
                    ? isCritical
                      ? 'border-rose-500/40 bg-rose-950/10 glow-red'
                      : 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {isCritical ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-100 text-sm">{a.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {a.recipient_role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{a.message}</p>
                    <span className="text-[10px] font-mono text-slate-500 block pt-1">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  {!a.acknowledged ? (
                    <button
                      onClick={() => handleAck(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 transition cursor-pointer"
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Read</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
