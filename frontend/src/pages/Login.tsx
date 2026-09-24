import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('engineer@forgesentinel.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    const mockUser = {
      id: 1,
      email: demoEmail,
      full_name: demoEmail.includes('engineer')
        ? 'Alex Rivera (Field Engineer)'
        : demoEmail.includes('manager')
        ? 'Sarah Jenkins (Quality Manager)'
        : 'Carlos Ruiz (Line Leader)',
      role: demoEmail.includes('engineer')
        ? 'ENGINEER'
        : demoEmail.includes('manager')
        ? 'QUALITY_MANAGER'
        : 'LINE_LEADER',
    };
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 items-center justify-center text-white shadow-xl shadow-cyan-500/20 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wider uppercase">
            FORGE <span className="text-cyan-400">SENTINEL</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Real-Time Manufacturing Quality Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Sentinel'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Buttons */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Quick Hackathon Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo('engineer@forgesentinel.com')}
                className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/60 transition cursor-pointer text-left"
              >
                <div className="font-bold text-cyan-400">Demo Engineer</div>
                <div className="text-[10px] text-slate-400">Field Quality</div>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('manager@forgesentinel.com')}
                className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/60 transition cursor-pointer text-left"
              >
                <div className="font-bold text-amber-400">Demo Quality Manager</div>
                <div className="text-[10px] text-slate-400">NCR Approvals</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <p className="text-[11px] text-slate-500 text-center mt-6">
          Detect problems early. Escalate automatically. Prevent production losses.
        </p>
      </div>
    </div>
  );
};
