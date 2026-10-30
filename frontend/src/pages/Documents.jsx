import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Calendar,
  DollarSign,
  Scale,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export default function Documents() {
  const { activeCaseId, setActiveCaseId } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingDocId, setAnalyzingDocId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedDocText, setSelectedDocText] = useState(null);

  useEffect(() => {
    api.get('/cases/').then((res) => {
      setCases(res.data);
      if (!activeCaseId && res.data.length > 0) {
        setActiveCaseId(res.data[0].case_id);
      }
    });
  }, []);

  const fetchDocuments = async (caseId) => {
    if (!caseId) return;
    setLoadingDocs(true);
    try {
      const res = await api.get(`/documents/${caseId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (activeCaseId) {
      fetchDocuments(activeCaseId);
    }
  }, [activeCaseId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let currentCaseId = activeCaseId;
    if (!currentCaseId) {
      if (cases.length > 0) {
        currentCaseId = cases[0].case_id;
        setActiveCaseId(currentCaseId);
      } else {
        // Fetch cases which triggers auto-seed
        try {
          const cRes = await api.get('/cases/');
          setCases(cRes.data);
          if (cRes.data.length > 0) {
            currentCaseId = cRes.data[0].case_id;
            setActiveCaseId(currentCaseId);
          }
        } catch {
          // ignore
        }
      }
    }

    if (!currentCaseId) {
      setStatusMessage({ type: 'error', text: 'Please create or select an active case docket first from My Cases.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/documents/${currentCaseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage({
        type: 'success',
        text: `Uploaded "${file.name}"! Document analyzed, key points extracted, and matched against historical dataset.`
      });
      fetchDocuments(currentCaseId);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'File upload failed. Only PDF and DOCX files are allowed.'
      });
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };


  const handleAnalyzeSingleDoc = async (docId) => {
    if (!activeCaseId) return;
    setAnalyzingDocId(docId);
    try {
      await api.post(`/documents/${activeCaseId}/doc/${docId}/analyze`);
      fetchDocuments(activeCaseId);
      setStatusMessage({
        type: 'success',
        text: 'Document intelligence successfully updated with live key points and past cases!'
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Error analyzing document. Please retry.'
      });
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleRunAllAnalysis = async () => {
    if (!activeCaseId) return;
    setAnalyzingAll(true);
    setStatusMessage(null);
    try {
      await api.post(`/intelligence/${activeCaseId}/analyze`);
      setStatusMessage({
        type: 'success',
        text: 'Full case intelligence synthesized! Redirecting to intelligence briefing...'
      });
      setTimeout(() => {
        navigate('/intelligence');
      }, 1000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Case analysis encountered an error.'
      });
    } finally {
      setAnalyzingAll(false);
    }
  };

  const parseSafeJSON = (str, fallback) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileUp className="h-6 w-6 text-indigo-400" />
            Document Intelligence & Evidence Ingestion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Instant per-document summaries, highlighted key points, and matching historical precedents
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <select
            value={activeCaseId || ''}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 text-xs rounded-xl border transition ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 flex items-center gap-2.5'
              : statusMessage.text.includes('Not a legal document')
              ? 'bg-rose-950/90 border-rose-700 text-rose-200 space-y-1.5 shadow-lg shadow-rose-950/50'
              : 'bg-rose-950/80 border-rose-800 text-rose-300 flex items-center gap-2.5'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>{statusMessage.text}</span>
            </>
          ) : statusMessage.text.includes('Not a legal document') ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Upload Rejected — Domain Guardrail Triggered</h4>
                <p className="text-xs text-rose-200 mt-0.5 leading-relaxed">
                  {statusMessage.text}
                </p>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  💡 <strong>Allowed documents:</strong> Court petitions, plaints, written statements, affidavits, agreements/contracts, FIRs, bail applications, legal notices, or judgments.
                </p>
              </div>
            </div>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{statusMessage.text}</span>
            </>
          )}
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 text-center transition">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 flex items-center justify-center mx-auto">
            <FileUp className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-[11px] text-indigo-300 font-medium mb-1">
              <Scale className="h-3 w-3" />
              Domain Restricted: Legal Documents Only
            </div>
            <h3 className="text-base font-bold text-white">Upload Legal Brief or Evidentiary PDF</h3>
            <p className="text-xs text-slate-400">
              Scans petitions, contracts, FIRs & exhibits: highlights clauses, dates, damages & matches Supreme Court precedents
            </p>
          </div>

          <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/30 cursor-pointer transition">
            <FileUp className="h-4 w-4" />
            <span>{uploading ? 'Analyzing Document with AI...' : 'Choose Legal File'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Documents List & Analysis Trigger */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Docket Evidence & Document Deep Dives</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {documents.length} document(s) uploaded for the active case
            </p>
          </div>

          {documents.length > 0 && (
            <button
              onClick={handleRunAllAnalysis}
              disabled={analyzingAll}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{analyzingAll ? 'Synthesizing Docket...' : 'Synthesize Complete Case Dossier'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loadingDocs ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            No evidentiary documents uploaded yet for this case. Upload a PDF or DOCX file above to begin.
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map((doc) => {
              const keyPointsObj = doc.key_points ? parseSafeJSON(doc.key_points, {}) : null;
              const pastCasesArr = doc.related_past_cases ? parseSafeJSON(doc.related_past_cases, []) : [];

              return (
                <div
                  key={doc.document_id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-slate-700/80 transition shadow-sm"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400 shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white truncate max-w-lg">
                          {doc.file_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="uppercase font-bold text-slate-300">{doc.file_type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full text-[10px] border border-emerald-800/60 font-semibold">
                            AI Analyzed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAnalyzeSingleDoc(doc.document_id)}
                        disabled={analyzingDocId === doc.document_id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{analyzingDocId === doc.document_id ? 'Analyzing...' : 'Re-Analyze'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedDocText(doc)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Raw Text</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. Document Summary */}
                  {doc.doc_summary && (
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        Document Executive Brief & Controversy
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {doc.doc_summary}
                      </p>
                    </div>
                  )}

                  {/* 2. Key Points Grid */}
                  {keyPointsObj && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Critical Dates */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Critical Dates
                        </span>
                        <ul className="text-slate-300 space-y-1 text-[11px]">
                          {keyPointsObj.critical_dates?.map((d, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-indigo-500">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Financial Figures */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          Financial Figures
                        </span>
                        <ul className="text-slate-300 space-y-1 text-[11px]">
                          {keyPointsObj.financial_figures?.map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-emerald-500">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Legal Covenants */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5" />
                          Key Legal Assertions
                        </span>
                        <ul className="text-slate-300 space-y-1 text-[11px]">
                          {keyPointsObj.legal_covenants?.map((c, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-amber-500">•</span>
                              <span className="line-clamp-2">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Evidentiary Vulnerabilities */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-950/60 space-y-1.5">
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Evidentiary Cautions
                        </span>
                        <ul className="text-slate-300 space-y-1 text-[11px]">
                          {keyPointsObj.evidentiary_vulnerabilities?.map((v, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-500">•</span>
                              <span className="line-clamp-2">{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 3. Related Historical Cases from Dataset */}
                  {pastCasesArr.length > 0 && (
                    <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-3">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        Related Historical Cases Matched from Dataset
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {pastCasesArr.map((past, i) => (
                          <div
                            key={i}
                            className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1 text-xs"
                          >
                            <h5 className="font-bold text-white italic truncate">{past.case_name}</h5>
                            <p className="text-[11px] text-indigo-400 font-mono">{past.citation} • {past.court}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              <strong>Precedent Caution:</strong> {past.procedural_pitfalls}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extracted Text Modal */}
      {selectedDocText && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  {selectedDocText.file_name}
                </h3>
                <p className="text-xs text-slate-400">Extracted OCR / Parser Output</p>
              </div>
              <button
                onClick={() => setSelectedDocText(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-md"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
              {selectedDocText.extracted_text || 'No text extracted.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
