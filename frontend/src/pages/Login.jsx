import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Lock, Mail, Award, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  // Login Mode: 'bci' (Bar Registration No.) or 'email' (Email Address)
  const [loginMethod, setLoginMethod] = useState('bci');
  const [barEnrollment, setBarEnrollment] = useState('MAH/4521/2021');
  const [email, setEmail] = useState('priya@lawlens.com');
  const [password, setPassword] = useState('lawyer123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const identifier = loginMethod === 'bci' ? barEnrollment.trim().toUpperCase() : email.trim();
    if (!identifier) {
      setError(loginMethod === 'bci' ? 'Please enter your Bar Council Registration Number.' : 'Please enter your lawyer email.');
      return;
    }

    const res = await login(identifier, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const setDemoCredentials = (mode) => {
    if (mode === 'bci') {
      setLoginMethod('bci');
      setBarEnrollment('MAH/4521/2021');
      setPassword('lawyer123');
    } else {
      setLoginMethod('email');
      setEmail('priya@lawlens.com');
      setPassword('lawyer123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-indigo-950/40">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-950 border border-indigo-700/60 rounded-xl text-indigo-400 mb-1">
            <Scale className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">LawLens Advocate Portal</h2>
          <p className="text-xs text-slate-400">
            AI-Powered Legal Decision-Support & Drafting Platform
          </p>
        </div>

        {/* Lawyer Verification Badge */}
        <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
          <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Advocate-Only Access:</strong> Sign in with your Bar Council of India Enrollment Number or registered Advocate Email.
          </span>
        </div>

        {/* Login Method Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setLoginMethod('bci')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition ${
              loginMethod === 'bci'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Registration No.</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition ${
              loginMethod === 'email'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Advocate Email</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === 'bci' ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">
                  Bar Council Registration Number
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Format: MAH/4521/2021</span>
              </div>
              <div className="relative">
                <Award className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
                <input
                  type="text"
                  required
                  value={barEnrollment}
                  onChange={(e) => setBarEnrollment(e.target.value.toUpperCase())}
                  placeholder="e.g. MAH/4521/2021, D/1842/2019"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white uppercase placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Lawyer Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advocate@lawfirm.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

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
            {loading ? 'Authenticating Advocate...' : 'Sign In to Workspace'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Demo Advocate Account:</span>
            <button
              type="button"
              onClick={() => setDemoCredentials('bci')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Auto Fill Credentials
            </button>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-2">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">Reg: MAH/4521/2021</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">Pass: lawyer123</span>
          </div>
        </div>

        {/* Sign In & Sign Up Options */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>New Advocate?</span>
          <Link
            to="/register"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-lg font-medium border border-slate-700 transition"
          >
            Sign Up / Register Here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
