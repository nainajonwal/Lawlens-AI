import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { ShieldAlert, Clock, Calendar, Briefcase, Sparkles } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';

export default function RiskAndPriority() {
  const { activeCaseId, setActiveCaseId } = useAuth();
  const [cases, setCases] = useState([]);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await api.get('/cases/');
      setCases(res.data);
      if (!activeCaseId && res.data.length > 0) {
        setActiveCaseId(res.data[0].case_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverview = async (caseId) => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/intelligence/${caseId}/overview`);
      setIntel(res.data);
    } catch (err) {
      console.error('Error fetching risk overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (activeCaseId) {
      fetchOverview(activeCaseId);
    }
  }, [activeCaseId]);

  const handleRecompute = async () => {
    if (!activeCaseId) return;
    setRecomputing(true);
    try {
      const res = await api.post(`/intelligence/${activeCaseId}/analyze`);
      setIntel(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRecomputing(false);
    }
  };

  const getPriorityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'urgent':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      case 'high':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'normal':
        return 'text-indigo-400 bg-indigo-950/80 border-indigo-800';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-indigo-400" />
            Explainable Risk Assessment & Priority Triage
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical, factor-based vulnerability index and statutory limitation tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeCaseId || ''}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleRecompute}
            disabled={recomputing}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{recomputing ? 'Evaluating...' : 'Recalculate'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading risk metrics...</div>
      ) : (
        <div className="space-y-6">
          {/* Priority Card */}
          {intel?.priority && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Case Prioritization & Triage</h3>
                    <p className="text-xs text-slate-400">Statutory limitation deadlines and judicial scheduling index</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{intel.priority.urgency_score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                    <span className="block text-[10px] text-slate-500 uppercase">Urgency Score</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(intel.priority.priority_level)}`}>
                    {intel.priority.priority_level} Priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    Limitation Cutoff Date:
                  </span>
                  <p className="text-sm font-bold text-white">
                    {intel.priority.limitation_deadline || 'Open Statutory Window'}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Days Remaining:
                  </span>
                  <p className="text-sm font-bold text-amber-400">
                    {intel.priority.days_remaining} Days
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                    Procedural Status:
                  </span>
                  <p className="text-sm font-bold text-emerald-400">
                    Active Docket Pleading
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-1">Triage Rationale:</span>
                <p>{intel.priority.rationale}</p>
              </div>
            </div>
          )}

          {/* Explainable Risk Gauge Component */}
          <RiskGauge riskData={intel?.risk} />
        </div>
      )}
    </div>
  );
}
