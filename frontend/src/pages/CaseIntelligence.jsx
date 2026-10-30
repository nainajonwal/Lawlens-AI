import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Scale,
  BookOpen,
  FileCheck2,
  AlertOctagon,
  Clock,
  Sparkles,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import TimelineView from '../components/TimelineView';

export default function CaseIntelligence() {
  const { activeCaseId, setActiveCaseId } = useAuth();
  const [cases, setCases] = useState([]);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

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
      console.error('Error fetching intelligence overview:', err);
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

  const handleReanalyze = async () => {
    if (!activeCaseId) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/intelligence/${activeCaseId}/analyze`);
      setIntel(res.data);
    } catch (err) {
      console.error('Error re-analyzing:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'summary', name: 'Executive Summary', icon: BookOpen, count: null },
    { id: 'laws', name: 'Applicable Laws', icon: Scale, count: intel?.laws?.length },
    { id: 'precedents', name: 'Precedents', icon: FileCheck2, count: intel?.precedents?.length },
    { id: 'contradictions', name: 'Contradictions & Cross-Exam', icon: AlertOctagon, count: intel?.contradictions?.length },
    { id: 'timeline', name: 'Chronological Timeline', icon: Clock, count: intel?.timeline?.length },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-full">
              {intel?.case?.category || 'Legal'} Docket Intelligence
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{intel?.case?.court || 'Jurisdiction'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {intel?.case?.title || 'Select a Case Docket'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeCaseId || ''}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{analyzing ? 'Synthesizing...' : 'Refresh Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-slate-800 gap-2 pb-px text-xs font-semibold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== null && tab.count !== undefined && (
                <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading intelligence briefing...</div>
      ) : !intel ? (
        <div className="p-12 text-center text-xs text-slate-400">No case data available.</div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {intel.summary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      Executive Case Brief
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {intel.summary.executive_summary}
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Material Background Facts
                    </h4>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {intel.summary.background_facts}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Procedural Posture & History
                    </h4>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {intel.summary.procedural_history}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Core Legal Issues in Dispute
                    </h4>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {intel.summary.legal_issues}
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        Petitioner Arguments
                      </h4>
                      <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                        {intel.summary.petitioner_arguments}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                        Respondent Defenses
                      </h4>
                      <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                        {intel.summary.respondent_arguments}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-400 space-y-2">
                  <p>Summary not generated yet. Click "Refresh Intelligence" above to synthesize the case brief.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICABLE LAWS */}
          {activeTab === 'laws' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Automated statutory provisions mapped to the factual matrix and jurisdiction</p>
                <span className="font-semibold text-indigo-400">{intel.laws?.length || 0} provisions active</span>
              </div>

              {intel.laws?.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-400">
                  No applicable laws mapped yet. Run intelligence analysis to identify governing statutes.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intel.laws.map((law) => (
                    <div
                      key={law.law_id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                            {law.section}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{law.title}</h4>
                          <p className="text-[11px] text-slate-400">{law.act}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400">{Math.round(law.relevance_score * 100)}%</span>
                          <span className="block text-[10px] text-slate-500 uppercase">Relevance</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {law.description}
                      </p>

                      {law.compliance_notes && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <span className="font-semibold text-slate-300 block">Advocate Compliance Note:</span>
                          <p>{law.compliance_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRECEDENTS */}
          {activeTab === 'precedents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Curated Indian landmark judgments & High Court authorities for citation grounding</p>
                <span className="font-semibold text-indigo-400">{intel.precedents?.length || 0} citations retrieved</span>
              </div>

              {intel.precedents?.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-400">
                  No precedents retrieved yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {intel.precedents.map((p) => (
                    <div
                      key={p.precedent_id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white italic">{p.case_name}</h4>
                            {p.is_landmark && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                                Landmark
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-400 font-mono mt-0.5">
                            {p.citation} • {p.court} ({p.year})
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-300">{Math.round(p.similarity_score * 100)}%</span>
                          <span className="block text-[10px] text-slate-500 uppercase">Precedent Match</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Ratio Decidendi / Legal Principle:
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                          "{p.relevant_ratio}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTRADICTIONS & CROSS-EXAM */}
          {activeTab === 'contradictions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Discrepancies identified across exhibits, depositions, and notices for cross-examination</p>
                <span className="font-semibold text-rose-400">{intel.contradictions?.length || 0} conflicts detected</span>
              </div>

              {intel.contradictions?.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-400">
                  No contradictions detected. Case exhibits appear corroborative.
                </div>
              ) : (
                <div className="space-y-4">
                  {intel.contradictions.map((c) => (
                    <div
                      key={c.contradiction_id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <AlertOctagon className="h-4 w-4 text-rose-400" />
                          {c.issue_topic}
                        </h4>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-rose-400 bg-rose-950/80 border border-rose-800">
                          {c.severity} Severity
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Statement A — Source: {c.source_a}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{c.statement_a}"
                          </p>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-950/60 border-l-2 border-l-rose-500 space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-400 uppercase">
                            Conflicting Statement B — Source: {c.source_b}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{c.statement_b}"
                          </p>
                        </div>
                      </div>

                      <div className="bg-indigo-950/30 border border-indigo-900/50 p-3 rounded-lg text-xs text-indigo-300 space-y-1">
                        <span className="font-semibold block text-indigo-200">Legal Cross-Examination Analysis:</span>
                        <p>{c.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Chronological sequence of transactions, defaults, notices, and procedural pleadings
              </div>
              <TimelineView events={intel.timeline} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
