import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  Ticket as TicketIcon,
  FileSpreadsheet,
  ArrowLeft,
  Clock,
  User,
  Cpu,
  Package,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';

export const DefectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [defect, setDefect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api
      .getDefectById(Number(id))
      .then((data) => setDefect(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-cyan-400 font-semibold text-xs">
        Loading defect telemetry record...
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Defect record not found.</p>
        <button
          onClick={() => navigate('/live-monitor')}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-xs text-cyan-400"
        >
          Return to Live Monitor
        </button>
      </div>
    );
  }

  const isKnown = defect.classification === 'KNOWN';
  const isUnknown = defect.classification === 'UNKNOWN';
  const isSystemic = defect.classification === 'SYSTEMIC';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/live-monitor')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Telemetry Monitor</span>
        </button>

        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
            isSystemic
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 glow-red'
              : isUnknown
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
          }`}
        >
          {defect.classification} DEFECT
        </span>
      </div>

      {/* Main Defect Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>DEFECT #{defect.id}</span>
              <span>•</span>
              <span>{defect.serial_number}</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1">
              {defect.defect_code} — {defect.defect_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{defect.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Severity</p>
              <p className="text-sm font-extrabold text-rose-400">{defect.severity}</p>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-slate-500 text-[10px] font-semibold">Station</p>
              <p className="font-bold text-slate-200">{defect.station_code} ({defect.station_name})</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-slate-500 text-[10px] font-semibold">Product</p>
              <p className="font-bold text-slate-200">{defect.product_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-slate-500 text-[10px] font-semibold">Operator</p>
              <p className="font-bold text-slate-200">{defect.operator_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-slate-500 text-[10px] font-semibold">Timestamp</p>
              <p className="font-mono text-slate-300">{new Date(defect.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Support Section (Section 29) */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Inspection Photo & Thermal Telemetry Snapshot
        </h3>
        <div className="aspect-video max-h-56 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
          <img
            src={defect.photo_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"}
            alt="Defect Inspection Snapshot"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-cyan-400 border border-slate-800">
            ST-04 Telemetry Capture • SN: {defect.serial_number}
          </div>
        </div>
      </div>

      {/* Classification Specific Action Box */}

      {/* CATEGORY 1: KNOWN DEFECT */}
      {isKnown && (
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                CATEGORY 1 — KNOWN DEFECT
              </span>
              <h3 className="text-base font-bold text-slate-100">Documented Resolution Available</h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-300">Recommended Resolution:</p>
            <p className="text-xs text-emerald-300 font-medium">
              "{defect.documented_solution || 'Recalibrate electrical testing equipment and repeat inspection.'}"
            </p>
          </div>

          {resolvedMessage ? (
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{resolvedMessage}</span>
            </div>
          ) : (
            <button
              onClick={() => setResolvedMessage('Resolution marked as applied. Station re-test queued.')}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolution Applied</span>
            </button>
          )}
        </div>
      )}

      {/* CATEGORY 2: UNKNOWN DEFECT */}
      {isUnknown && (
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                CATEGORY 2 — UNKNOWN DEFECT
              </span>
              <h3 className="text-base font-bold text-slate-100">No Documented Resolution Found</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            No pre-existing solution exists in the defect knowledge base. The Sentinel engine automatically created an engineering investigation ticket.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Automatic Ticket Created</p>
              <p className="text-sm font-extrabold text-amber-400">
                {defect.linked_ticket?.ticket_number || 'TICKET-1042'}
              </p>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <TicketIcon className="w-4 h-4" />
              <span>View Ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* CATEGORY 3: SYSTEMIC DEFECT */}
      {isSystemic && (
        <div className="glass-card p-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 space-y-4 glow-red">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                CATEGORY 3 — SYSTEMIC ISSUE DETECTED
              </span>
              <h3 className="text-base font-bold text-slate-100">Repeated Defect Threshold Exceeded</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Occurrences</span>
              <p className="font-extrabold text-rose-400 text-sm">4</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Threshold</span>
              <p className="font-extrabold text-slate-200 text-sm">3</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Time Window</span>
              <p className="font-extrabold text-slate-200 text-sm">30 min</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-300">Affected Serial Numbers:</p>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">SN-10042</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">SN-10043</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">SN-10044</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800">SN-10045</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate('/ncrs')}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>View Generated NCR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
