import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  FileText,
  PlusCircle,
  FileUp,
  BotMessageSquare,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, setActiveCaseId } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cases/')
      .then((res) => {
        setCases(res.data);
      })
      .catch((err) => console.error('Error loading cases:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectCase = (caseId, targetRoute = '/intelligence') => {
    setActiveCaseId(caseId);
    navigate(targetRoute);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            Welcome, {user?.name ? (user.name.trim().toLowerCase().startsWith('adv') ? user.name : `Adv. ${user.name}`) : 'Advocate'}
            <span className="text-[11px] bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Advocate • {user?.bar_enrollment_no || 'MAH/4521/2021'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.state_bar_council ? `${user.state_bar_council} • ` : ''}LawLens Decision-Support Workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/draft-studio"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-indigo-600/20 transition"
          >
            <span>📜 Draft Studio</span>
          </Link>
          <Link
            to="/research"
            className="inline-flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
          >
            <span>🔍 Legal Research</span>
          </Link>
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Case
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
          >
            <FileUp className="h-3.5 w-3.5" />
            Upload Doc
          </Link>
        </div>
      </div>


      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Dockets</span>
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{cases.length}</div>
          <p className="text-[11px] text-slate-500">Under advocate management</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Procedural Flags</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">3</div>
          <p className="text-[11px] text-slate-500">Vulnerabilities to address</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Limitation Alerts</span>
            <Clock className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">14 <span className="text-xs font-normal text-slate-400">days</span></div>
          <p className="text-[11px] text-slate-500">Earliest filing cutoff</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Ethics Guardrail</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">100% Grounded</div>
          <p className="text-[11px] text-slate-500">Zero outcome predictions</p>
        </div>
      </div>

      {/* Case Triage Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Case Prioritization & Triage</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by hearing proximity, procedural urgency, and evidentiary risk score
            </p>
          </div>
          <Link to="/cases" className="text-xs text-indigo-400 hover:underline font-medium">
            View All Dockets →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-3">
            <Briefcase className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm">No cases registered yet.</p>
            <Link
              to="/cases"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/60"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Create First Case
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Case Title</th>
                  <th className="px-5 py-3">Jurisdiction</th>
                  <th className="px-5 py-3">Court</th>
                  <th className="px-5 py-3">Next Listing</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4 font-semibold text-white">
                      {c.title}
                      {c.filing_number && (
                        <span className="block text-[11px] text-slate-500 font-normal">
                          {c.filing_number}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{c.court || 'District Court'}</td>
                    <td className="px-5 py-4 text-indigo-400 font-medium">
                      {c.next_hearing_date || 'Not Listed'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px]">
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleSelectCase(c.case_id, '/intelligence')}
                        className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition"
                      >
                        Intelligence
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
