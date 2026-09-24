import React, { useEffect, useState } from 'react';
import { Ticket as TicketIcon, Search, Filter, Edit3, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadTickets = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const data = await api.getTickets(params);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const openTicketModal = (t: any) => {
    setSelectedTicket(t);
    setEditStatus(t.status);
    setEditPriority(t.priority);
    setEditAssignedTo(t.assigned_to || '');
  };

  const handleUpdate = async () => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      const updated = await api.updateTicket(selectedTicket.id, {
        status: editStatus,
        priority: editPriority,
        assigned_to: editAssignedTo,
      });
      setSelectedTicket(updated);
      await loadTickets();
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
            <TicketIcon className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Engineering Investigation Tickets
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auto-created tickets for Category 2 unknown defects requiring engineering resolution
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Active Tickets: <strong className="text-amber-400">{tickets.filter(t => t.status !== 'CLOSED').length}</strong>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">Total Tickets: {tickets.length}</span>
      </div>

      {/* Ticket Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Defect Name</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{t.ticket_number}</td>
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {t.defect_code} — {t.defect_name}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">{t.station_code}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{t.serial_number}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{t.assigned_to}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                        t.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openTicketModal(t)}
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

      {/* Ticket Edit Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  UNKNOWN DEFECT TICKET
                </span>
                <h3 className="text-lg font-black text-slate-100">{selectedTicket.ticket_number}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">Station: <strong className="text-slate-200">{selectedTicket.station_code}</strong></p>
                <p className="text-slate-400">Serial: <strong className="text-cyan-400 font-mono">{selectedTicket.serial_number}</strong></p>
                <p className="text-slate-300 mt-2 font-medium">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Quality Engineer</label>
                <input
                  type="text"
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                {updating ? 'Saving...' : 'Update Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
