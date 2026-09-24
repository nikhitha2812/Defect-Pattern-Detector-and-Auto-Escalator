import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  ArrowLeft,
  Sparkles,
  CheckSquare,
  Clock,
  Cpu,
  Package,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';

export const PatternDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pattern, setPattern] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const patternId = id ? Number(id) : 1;
    api
      .getPatternDetail(patternId)
      .then((data) => setPattern(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateAI = async () => {
    if (!pattern) return;
    setAiLoading(true);
    try {
      const res = await api.getAISummary(pattern.id);
      setAiSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading pattern telemetry details...</div>;
  }

  if (!pattern) {
    return <div className="p-8 text-center text-slate-400">Pattern detail not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patterns')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pattern Intelligence</span>
        </button>

        <button
          onClick={() => navigate('/ncrs')}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>View Escalated NCR</span>
        </button>
      </div>

      {/* 1. Pattern Summary Header Card */}
      <div className="glass-card p-6 rounded-2xl border border-rose-500/40 bg-rose-950/10 space-y-4 glow-red">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                {pattern.classification} ESCALATION
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{pattern.station_code}</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1">
              {pattern.defect_code} — {pattern.defect_name}
            </h1>
            <p className="text-xs text-slate-400">{pattern.station_name} • Line A High-Voltage Cell Line</p>
          </div>

          <div className="flex items-center gap-4 text-center text-xs">
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Occurrences</span>
              <p className="font-black text-rose-400 text-base">{pattern.occurrence_count}</p>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Threshold</span>
              <p className="font-black text-slate-200 text-base">{pattern.threshold}</p>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Time Window</span>
              <p className="font-black text-slate-200 text-base">{pattern.time_window} min</p>
            </div>
          </div>
        </div>

        {/* AI Generator Button (Section 28) */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-slate-300">
            Automated pattern engine continuously tracking telemetry drift across active batches.
          </p>
          <button
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{aiLoading ? 'Generating Summary...' : 'Generate AI Investigation Summary'}</span>
          </button>
        </div>
      </div>

      {/* AI Investigation Summary Box (Section 28) */}
      {aiSummary && (
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/40 bg-cyan-950/15 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">AI Engineer Investigation Summary</h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-mono">
            {aiSummary.summary}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recommended Investigation Focus Areas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {(aiSummary.recommendation_areas || []).map((area: string, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  {area}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Affected Units Table */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Affected Unit Serial Numbers ({pattern.affected_units?.length || 0})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Serial Number</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Inspection Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(pattern.affected_units || []).map((unit: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{unit.serial_number}</td>
                  <td className="py-2.5 px-3 text-slate-200">{unit.product_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{unit.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-300">{unit.operator_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {unit.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Visual Occurrence Timeline */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Defect Occurrence Chronological Timeline</span>
        </h3>
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {(pattern.timeline || []).map((tl: any, i: number) => (
            <div key={i} className="flex items-start gap-4 relative z-10 pl-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-900 shrink-0 mt-0.5"></div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex-1 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200">{tl.defect}</span>
                  <p className="text-[11px] text-slate-400">Station: {tl.station} • Serial: <span className="font-mono text-cyan-400">{tl.serial}</span></p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{tl.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recommended Investigation Steps */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Standard Operating Investigation Recommendations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {(pattern.recommended_investigation || []).map((step: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
