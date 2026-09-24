import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [threshold, setThreshold] = useState(3);
  const [timeWindow, setTimeWindow] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((res) => {
        if (res.systemic_threshold) setThreshold(Number(res.systemic_threshold));
        if (res.time_window_minutes) setTimeWindow(Number(res.time_window_minutes));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateSettings(threshold, timeWindow);
      setMessage('Rule engine parameters updated! Systemic escalation threshold updated.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading system settings...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Rule Engine & System Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure systemic defect pattern thresholds and time-window evaluation rules
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Systemic Escalation Rule Engine Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Systemic Threshold (Occurrences)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-extrabold text-cyan-400 focus:border-cyan-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500">
                Number of identical station defects required to classify as systemic escalation.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Time Window Evaluation (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={1440}
                value={timeWindow}
                onChange={(e) => setTimeWindow(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-extrabold text-cyan-400 focus:border-cyan-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500">
                Rolling duration in minutes to count repeated defects.
              </p>
            </div>
          </div>
        </div>

        {/* Rule Summary Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-200">Active Configured Backend Rule:</span>
          <p className="font-mono text-cyan-400 font-semibold">
            IF same_station AND same_defect AND occurrences &gt;= {threshold} WITHIN {timeWindow} minutes THEN ESCALATE SYSTEMIC
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Rule Engine...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
