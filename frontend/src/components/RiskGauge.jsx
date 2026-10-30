import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RiskGauge({ riskData }) {
  if (!riskData) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-xl text-center text-slate-400">
        <AlertTriangle className="h-8 w-8 text-amber-500/70 mx-auto mb-2" />
        <p className="text-sm">No risk assessment generated yet. Run analysis to calculate vulnerability index.</p>
      </div>
    );
  }

  const {
    overall_score,
    risk_level,
    contradictions_score,
    procedural_score,
    limitation_score,
    document_gap_score,
    vulnerabilities,
    mitigation_strategy
  } = riskData;

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      case 'high':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-950/80 border-yellow-800';
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
    }
  };

  const getBarColor = (score) => {
    if (score >= 70) return 'bg-rose-500';
    if (score >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const factors = [
    { label: 'Evidentiary Contradictions (Weight: 35%)', score: contradictions_score || 0 },
    { label: 'Procedural Vulnerabilities (Weight: 25%)', score: procedural_score || 0 },
    { label: 'Limitation / Timeline Urgency (Weight: 25%)', score: limitation_score || 0 },
    { label: 'Document Completeness Gap (Weight: 15%)', score: document_gap_score || 0 },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Explainable Case Vulnerability Index
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent, multi-factor rule-based risk evaluation. Strictly does not predict judicial win/loss outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-black text-white">{overall_score}<span className="text-sm text-slate-400">/100</span></div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Composite Risk</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(risk_level)}`}>
            {risk_level} Risk
          </span>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Explainable Factor Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((f, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-lg space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{f.label}</span>
                <span className="font-bold text-slate-200">{f.score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(f.score)} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Identified Vulnerabilities */}
      {vulnerabilities && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Identified Evidentiary & Procedural Vulnerabilities
          </h4>
          <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-lg text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {vulnerabilities}
          </div>
        </div>
      )}

      {/* Recommended Legal Mitigation Strategy */}
      {mitigation_strategy && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Recommended Legal Mitigation Steps
          </h4>
          <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-lg text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {mitigation_strategy}
          </div>
        </div>
      )}
    </div>
  );
}
