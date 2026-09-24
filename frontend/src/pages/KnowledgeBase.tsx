import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const KnowledgeBase: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCodes = async () => {
    try {
      const data = await api.getDefectCodes(search);
      setCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Defect Knowledge Base & Standard Resolutions
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative registry of documented defect codes, severities, and corrective procedures
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search defect code, name, fix..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Defect Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recommended Resolution Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{c.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{c.name}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs">{c.description}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold ${
                        c.severity === 'CRITICAL' || c.severity === 'HIGH'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        c.known
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {c.known ? 'KNOWN' : 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {c.documented_solution ? (
                      <span className="text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{c.documented_solution}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 italic">No solution documented (Triggers Ticket)</span>
                    )}
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
