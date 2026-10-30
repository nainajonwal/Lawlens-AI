import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

const STATE_BAR_COUNCILS = [
  'Bar Council of Maharashtra & Goa',
  'Bar Council of Delhi',
  'Bar Council of Uttar Pradesh',
  'Bar Council of Karnataka',
  'Bar Council of Tamil Nadu & Puducherry',
  'Bar Council of West Bengal',
  'Bar Council of Gujarat',
  'Bar Council of Punjab & Haryana',
  'Bar Council of Rajasthan',
  'Bar Council of Madhya Pradesh',
  'Bar Council of Kerala',
  'Bar Council of India (Supreme Court Bar)'
];

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barEnrollmentNo, setBarEnrollmentNo] = useState('');
  const [stateBarCouncil, setStateBarCouncil] = useState(STATE_BAR_COUNCILS[0]);
  const [error, setError] = useState('');

  // Validate BCI enrollment format: [STATE]/[ROLL]/[YEAR]
  const isBciFormatValid = /^[A-Za-z]{1,4}\/\d{1,6}\/\d{4}$/.test(barEnrollmentNo.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isBciFormatValid) {
      setError('Invalid Bar Council Enrollment ID format. Must follow official format: [State]/[Roll]/[Year] (e.g. MAH/4521/2021 or D/1842/2019).');
      return;
    }

    const res = await register(name, email, password, barEnrollmentNo.toUpperCase().trim(), stateBarCouncil);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-10 text-slate-100">
      <div className="w-full max-w-lg space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-indigo-950/40">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-950 border border-indigo-700/60 rounded-xl text-indigo-400 mb-1">
            <Scale className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Advocate Registration</h2>
          <p className="text-xs text-slate-400">
            LawLens AI Legal Workbench — Authorized Advocates & Legal Practitioners Only
          </p>
        </div>

        {/* Security & Eligibility Notice */}
        <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
          <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Advocates Act, 1961 Compliance:</strong> Access to case dockets and legal intelligence requires a verified State Bar Council Enrollment Number.
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Advocate Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adv. Vikram Singhania"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Bar Council Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@delhibar.org"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bar Council Verification Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-indigo-400" />
                State Bar Council
              </label>
              <select
                value={stateBarCouncil}
                onChange={(e) => setStateBarCouncil(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {STATE_BAR_COUNCILS.map((council) => (
                  <option key={council} value={council}>
                    {council}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-indigo-300">
                  BCI Enrollment Number
                </label>
                {barEnrollmentNo && (
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isBciFormatValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isBciFormatValid ? <CheckCircle2 className="h-3 w-3" /> : 'Format: MAH/1234/2021'}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={barEnrollmentNo}
                onChange={(e) => setBarEnrollmentNo(e.target.value.toUpperCase())}
                placeholder="e.g. MAH/4521/2021"
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Verifying Advocate Credentials...' : 'Register as Verified Advocate'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Already registered as Advocate?</span>
          <Link
            to="/login"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-lg font-medium border border-slate-700 transition"
          >
            Sign In to Workspace &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

