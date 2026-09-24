import React, { useState } from 'react';
import { Play, CheckCircle2, AlertOctagon, Zap, ArrowRight, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoCompleted: (result: any) => void;
}

export const HackathonDemoModal: React.FC<HackathonDemoModalProps> = ({
  isOpen,
  onClose,
  onDemoCompleted,
}) => {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [demoResult, setDemoResult] = useState<any>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const runDemoSequence = async () => {
    setRunning(true);
    setLogs([]);
    setCurrentStep(1);

    try {
      // Step 1: Reset database
      setLogs((prev) => [...prev, '⚡ Step 1: Resetting database to baseline production state...']);
      await api.resetDemoDatabase();
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Simulate Event 1 at ST-04
      setCurrentStep(2);
      setLogs((prev) => [...prev, '📍 Step 2: Firing Defect Event 1 at Station ST-04 (SN-DEMO-1001 / D102 Voltage Mismatch)...']);
      await api.simulateDefect({
        station_code: 'ST-04',
        defect_code: 'D102',
        serial_number: 'SN-DEMO-1001',
        product_code: 'EV-BATTERY-200',
        operator_code: 'OP-104',
        description: 'Voltage Mismatch - 418V measured (expected 400V +/- 5V)'
      });
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Simulate Event 2 at ST-04
      setCurrentStep(3);
      setLogs((prev) => [...prev, '📍 Step 3: Firing Defect Event 2 at Station ST-04 (SN-DEMO-1002 / D102 Voltage Mismatch)...']);
      await api.simulateDefect({
        station_code: 'ST-04',
        defect_code: 'D102',
        serial_number: 'SN-DEMO-1002',
        product_code: 'EV-BATTERY-200',
        operator_code: 'OP-104',
        description: 'Voltage Mismatch - 422V measured (expected 400V +/- 5V)'
      });
      await new Promise((r) => setTimeout(r, 800));

      // Step 4: Simulate Event 3 at ST-04 -> Triggers Systemic Escalation!
      setCurrentStep(4);
      setLogs((prev) => [...prev, '🚨 Step 4: Firing Defect Event 3 at Station ST-04 (SN-DEMO-1003 / D102)... THRESHOLD REACHED!']);
      const finalRes = await api.simulateDefect({
        station_code: 'ST-04',
        defect_code: 'D102',
        serial_number: 'SN-DEMO-1003',
        product_code: 'EV-BATTERY-200',
        operator_code: 'OP-104',
        description: 'Voltage Mismatch - 425V measured (expected 400V +/- 5V)'
      });

      setDemoResult(finalRes);
      setCurrentStep(5);
      setLogs((prev) => [
        ...prev,
        '✅ SYSTEMIC ESCALATION TRIGGERED!',
        `✓ Non-Conformance Report ${finalRes.ncr_created?.ncr_number || 'NCR-2026-0042'} auto-generated`,
        '✓ Line Leader & Field Engineer Critical Alerts broadcast',
        '✓ Station ST-04 flagged as CRITICAL (RED)'
      ]);

      onDemoCompleted(finalRes);
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Error during demo execution: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                HACKATHON PRESENTATION MODE
              </span>
              <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">
                Automated 2-Minute Sentinel Demonstration
              </h3>
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
          <p className="text-xs text-slate-300 leading-relaxed">
            This automated scenario demonstrates end-to-end continuous defect detection, threshold rule evaluation, automated NCR escalation, and line leader alert broadcasting.
          </p>

          {/* Progress Timeline */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold">
            {[
              '1. Reset State',
              '2. Defect 1',
              '3. Defect 2',
              '4. Defect 3',
              '5. Escalate'
            ].map((stepLabel, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border transition ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : isCurrent
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {stepLabel}
                </div>
              );
            })}
          </div>

          {/* Execution Log Output */}
          <div className="h-44 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Click 'Start Demo Sequence' below to execute the live scenario.</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('SYSTEMIC') || log.includes('🚨')
                      ? 'text-rose-400 font-bold'
                      : log.includes('✓')
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Close
          </button>
          <div className="flex gap-3">
            {currentStep === 5 ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/live-monitor');
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition"
                >
                  Open Live Monitor
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/ncrs');
                  }}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 transition"
                >
                  <span>View Generated NCR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={runDemoSequence}
                disabled={running}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {running ? (
                  <span>Executing Scenario...</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Demo Sequence</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
