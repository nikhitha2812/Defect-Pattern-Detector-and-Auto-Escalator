import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SystemicAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const SystemicAlertModal: React.FC<SystemicAlertModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !result) return null;

  const {
    defect,
    occurrence_count,
    threshold,
    time_window,
    ncr_created,
    actions_taken,
  } = result;

  const stationCode = defect?.station_code || 'ST-04';
  const defectCode = defect?.defect_code || 'D102';
  const defectName = defect?.defect_name || 'Voltage Mismatch';
  const ncrNumber = ncr_created?.ncr_number || 'NCR-2026-0042';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-rose-500/80 rounded-2xl shadow-2xl overflow-hidden glow-red animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 uppercase tracking-widest">
                CRITICAL ESCALATION
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
                SYSTEMIC ISSUE DETECTED
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metrics summary grid */}
          <div className="grid grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Station</p>
              <p className="text-base font-extrabold text-rose-400">{stationCode}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Occurrences</p>
              <p className="text-base font-extrabold text-rose-400">{occurrence_count || 3}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Threshold</p>
              <p className="text-base font-extrabold text-slate-200">{threshold || 3}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Window</p>
              <p className="text-base font-extrabold text-slate-200">{time_window || 30} min</p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Defect Pattern:</span>
              <span className="font-extrabold text-slate-200">{defectCode} — {defectName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Auto-Generated NCR:</span>
              <span className="font-bold text-rose-400">{ncrNumber}</span>
            </div>
          </div>

          {/* Triggered Actions Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Automated Sentinel Actions Triggered
            </h4>
            <div className="space-y-2">
              {(actions_taken || [
                'Line Leader Alerted',
                'Field Engineer Alerted',
                `NCR ${ncrNumber} Created`,
                'Affected Serial Units Identified'
              ]).map((action: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Acknowledge & Dismiss
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/ncrs');
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20"
          >
            <span>View NCR Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
