import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface SimulateDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDefectCreated: (result: any) => void;
}

export const SimulateDefectModal: React.FC<SimulateDefectModalProps> = ({
  isOpen,
  onClose,
  onDefectCreated,
}) => {
  const [stationCode, setStationCode] = useState('ST-04');
  const [defectCode, setDefectCode] = useState('D102');
  const [serialNumber, setSerialNumber] = useState(`SN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [productCode, setProductCode] = useState('EV-BATTERY-200');
  const [operatorCode, setOperatorCode] = useState('OP-104');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('Voltage Mismatch detected on cell module pair during electrical diagnostic check.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.simulateDefect({
        station_code: stationCode,
        defect_code: defectCode,
        serial_number: serialNumber,
        product_code: productCode,
        operator_code: operatorCode,
        severity,
        description,
      });

      onDefectCreated(res);
      onClose();
      // Generate new serial for next time
      setSerialNumber(`SN-${Math.floor(10000 + Math.random() * 90000)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate defect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Simulate Manufacturing Defect</h3>
              <p className="text-xs text-slate-400">Trigger real-time rule engine & pattern classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Station Code</label>
              <select
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ST-01">ST-01 — Sub-Assembly</option>
                <option value="ST-02">ST-02 — Laser Welding</option>
                <option value="ST-03">ST-03 — Visual Inspection</option>
                <option value="ST-04">ST-04 — Electrical Test (Target Demo)</option>
                <option value="ST-05">ST-05 — Final Casing</option>
                <option value="ST-06">ST-06 — Functional Test</option>
                <option value="ST-07">ST-07 — Packaging</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Code</label>
              <select
                value={defectCode}
                onChange={(e) => {
                  setDefectCode(e.target.value);
                  if (e.target.value === 'D102') setDescription('Voltage Mismatch detected on cell module pair during electrical diagnostic check.');
                  else if (e.target.value === 'D201') setDescription('Unexpected Current Fluctuation recorded on line sensor.');
                  else if (e.target.value === 'D104') setDescription('Weld temperature exceeded threshold during laser thermal pulse.');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="D102">D102 — Voltage Mismatch (Known)</option>
                <option value="D101">D101 — Surface Scratch (Known)</option>
                <option value="D103">D103 — Connector Misalignment (Known)</option>
                <option value="D104">D104 — Weld Temperature High (Known)</option>
                <option value="D105">D105 — Torque Failure (Known)</option>
                <option value="D201">D201 — Unexpected Current Fluctuation (Unknown)</option>
                <option value="D202">D202 — Unexpected Sensor Error (Unknown)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product</label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="EV-BATTERY-200">EV-BATTERY-200 Pack</option>
                <option value="MOTOR-X100">MOTOR-X100 Drive</option>
                <option value="CONTROLLER-500">CONTROLLER-500 ECU</option>
                <option value="INVERTER-300">INVERTER-300 Module</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operator</label>
              <select
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="OP-104">Priya Sharma (Shift B)</option>
                <option value="OP-102">Elena Rostova (Shift B)</option>
                <option value="OP-101">Marcus Vance (Shift A)</option>
                <option value="OP-105">John Miller (Shift C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Defect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
