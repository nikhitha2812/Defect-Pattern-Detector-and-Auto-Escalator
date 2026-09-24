import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Search, Filter, Edit3, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export const NCRManagement: React.FC = () => {
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [selectedNCR, setSelectedNCR] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editRootCause, setEditRootCause] = useState('');
  const [editCorrectiveAction, setEditCorrectiveAction] = useState('');
  const [editPreventiveAction, setEditPreventiveAction] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadNCRs = async () => {
    try {
      const data = await api.getNCRs(statusFilter ? { status: statusFilter } : undefined);
      setNcrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNCRs();
  }, [statusFilter]);

  const openNCRModal = (ncr: any) => {
    setSelectedNCR(ncr);
    setEditStatus(ncr.status);
    setEditAssignedTo(ncr.assigned_to || '');
    setEditRootCause(ncr.root_cause || '');
    setEditCorrectiveAction(ncr.corrective_action || '');
    setEditPreventiveAction(ncr.preventive_action || '');
  };

  const handleUpdate = async () => {
    if (!selectedNCR) return;
    setUpdating(true);
    try {
      const updated = await api.updateNCR(selectedNCR.id, {
        status: editStatus,
        assigned_to: editAssignedTo,
        root_cause: editRootCause,
        corrective_action: editCorrectiveAction,
        preventive_action: editPreventiveAction,
      });
      setSelectedNCR(updated);
      await loadNCRs();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Non-Conformance Reports (NCR Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated quality escalation records triggered by systemic pattern engine
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Open NCRs: <strong className="text-purple-400">{ncrs.filter(n => n.status !== 'CLOSED').length}</strong>
        </span>
      </div>

      {/* Filter */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="CORRECTIVE_ACTION">CORRECTIVE ACTION</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <span className="text-xs text-slate-400">Total NCR Records: {ncrs.length}</span>
      </div>

      {/* NCR Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">NCR Number</th>
                <th className="py-3 px-4">Defect Name</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ncrs.map((n) => (
                <tr key={n.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">{n.ncr_number}</td>
                  <td className="py-3 px-4 text-slate-200 font-medium">{n.defect_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{n.station_code}</td>
                  <td className="py-3 px-4 text-slate-400">{n.product_name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-extrabold text-rose-400">{n.severity}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(n.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{n.assigned_to}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                        n.status === 'OPEN'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : n.status === 'INVESTIGATING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openNCRModal(n)}
                      className="py-1 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 transition cursor-pointer"
                    >
                      Inspect / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NCR Details & CAPA Modal */}
      {selectedNCR && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  NON-CONFORMANCE REPORT
                </span>
                <h3 className="text-lg font-black text-slate-100">{selectedNCR.ncr_number}</h3>
              </div>
              <button
                onClick={() => setSelectedNCR(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Station</span>
                  <p className="font-bold text-slate-200">{selectedNCR.station_code} ({selectedNCR.station_name})</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Product</span>
                  <p className="font-bold text-slate-200">{selectedNCR.product_name}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Escalation Description</span>
                  <p className="text-slate-300 mt-0.5">{selectedNCR.description}</p>
                </div>
              </div>

              {/* Status & Assignment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NCR Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="CORRECTIVE_ACTION">CORRECTIVE ACTION</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Root Cause & CAPA Fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Identified Root Cause</label>
                <textarea
                  value={editRootCause}
                  onChange={(e) => setEditRootCause(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Document engineering root cause finding..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corrective Action (CAPA)</label>
                <textarea
                  value={editCorrectiveAction}
                  onChange={(e) => setEditCorrectiveAction(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Immediate station containment and corrective action steps..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preventive Action</label>
                <textarea
                  value={editPreventiveAction}
                  onChange={(e) => setEditPreventiveAction(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Long term preventive controls to avoid recurrence..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedNCR(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                {updating ? 'Saving...' : 'Save NCR Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
