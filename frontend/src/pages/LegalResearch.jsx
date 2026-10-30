import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Search,
  Scale,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  FileSignature,
  Key,
  ShieldCheck,
  Filter,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  { label: 'Mandatory FIR (Sec 154)', query: 'mandatory registration of FIR Section 154 CrPC cognizable offence' },
  { label: 'Arrest & 41A Checklist', query: 'Section 41 41A CrPC notice before arrest 7 years Arnesh Kumar' },
  { label: 'Bail Jurisprudence', query: 'bail rule jail exception Satender Kumar Antil guidelines undertrial' },
  { label: 'GPA Sale Void', query: 'GPA power of attorney sale deed transfer of property Suraj Lamp' },
  { label: 'Electronic Records 65B', query: 'Section 65B mandatory certificate electronic evidence call records' },
  { label: 'Cheque Bounce 138 NI Act', query: 'Section 138 NI Act cheque bounce compounding compromise' },
  { label: 'Quashing FIR u/s 482', query: 'quashing of FIR Section 482 CrPC Bhajan Lal guidelines inherent powers' },
  { label: 'Right to Privacy', query: 'Right to Privacy fundamental right Article 21 Puttaswamy' },
];

const COURTS = [
  'All Courts',
  'Supreme Court of India',
  'Delhi High Court',
  'Bombay High Court',
  'Calcutta High Court',
  'Madras High Court',
  'Karnataka High Court',
  'Allahabad High Court'
];

const CATEGORIES = [
  'All Categories',
  'Criminal',
  'Civil',
  'Constitutional',
  'Commercial',
  'Cyber'
];

export default function LegalResearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('All Courts');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Kanoon Token Modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [kanoonToken, setKanoonToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState({ token_configured: false, mode: 'Loading...' });
  const [tokenMsg, setTokenMsg] = useState('');

  // Selected Judgment for Full View Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    fetchTokenStatus();
    // Default initial search
    handleSearch('Supreme Court of India landmark bail fir arbitration');
  }, []);

  const fetchTokenStatus = async () => {
    try {
      const res = await api.get('/research/status');
      setTokenStatus(res.data);
    } catch {
      setTokenStatus({ token_configured: false, mode: 'Verified Indian Landmark Corpus' });
    }
  };

  const handleSearch = async (searchQuery = query) => {
    const q = (searchQuery || '').trim();
    if (!q) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const courtParam = selectedCourt === 'All Courts' ? '' : selectedCourt;
      const catParam = selectedCategory === 'All Categories' ? '' : selectedCategory;
      const res = await api.get(`/research/search?q=${encodeURIComponent(q)}&court=${encodeURIComponent(courtParam)}&category=${encodeURIComponent(catParam)}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Legal research search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = async (e) => {
    e.preventDefault();
    setTokenMsg('');
    try {
      const res = await api.post('/research/token', { token: kanoonToken });
      setTokenMsg('Token updated successfully!');
      fetchTokenStatus();
      setTimeout(() => {
        setShowTokenModal(false);
        setTokenMsg('');
      }, 1200);
    } catch {
      setTokenMsg('Failed to update token.');
    }
  };

  const copyCitation = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInDraftStudio = (item) => {
    const snippet = `"${item.title}, ${item.citation} [${item.court}] — Held: ${item.ratio}"`;
    // Store citation for Draft Studio pickup
    sessionStorage.setItem('pending_draft_citation', snippet);
    navigate('/draft-studio');
  };

  const viewDocumentDetails = async (docId) => {
    setLoadingDoc(true);
    try {
      const res = await api.get(`/research/doc/${docId}`);
      setSelectedDoc(res.data);
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-950 border border-indigo-700/60 text-indigo-400 rounded-lg">
              <Scale className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Legal Research & Indian Kanoon Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Source-grounded search across Indian judgments, landmark citations, acts, sections & judicial ratios
          </p>
        </div>

        {/* Kanoon Status & Key Config */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className={`h-2 w-2 rounded-full ${tokenStatus.token_configured ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <span className="text-slate-300 font-medium">
              {tokenStatus.token_configured ? 'Indian Kanoon API: Active' : 'Indian Legal Corpus: Connected'}
            </span>
          </div>

          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-medium transition"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Kanoon API Key</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search legal issues, IPC / BNS sections, CrPC, judgments, e.g., 'Arnesh Kumar arrest guidelines' or '65B Evidence Act'..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Research Case Law</span>
              </>
            )}
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {COURTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="ml-auto text-[11px] text-slate-500">
            Powered by Indian Kanoon API & Verified SC/HC Corpus
          </div>
        </div>

        {/* Suggested Research Query Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Key Topics:
          </span>
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setQuery(item.query);
                handleSearch(item.query);
              }}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-950 hover:border-indigo-700/60 border border-slate-700/60 rounded-lg text-[11px] text-slate-300 hover:text-indigo-200 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>Search Results ({results.length} Judgments & Precedents)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click any judgment to cite directly in your legal draft
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="inline-block p-3 bg-indigo-950/60 border border-indigo-700/50 rounded-xl text-indigo-400 animate-spin">
              <Scale className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Scanning Indian Legal Database...</p>
            <p className="text-xs text-slate-500">Querying Indian Kanoon API and Supreme Court Landmark Precedents</p>
          </div>
        ) : results.length === 0 && hasSearched ? (
          <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-sm text-slate-300">No local judgments found for this exact query.</p>
            <p className="text-xs text-slate-500">Query live across all 15M+ Indian judgments and acts directly on Indian Kanoon:</p>
            <div className="pt-2">
              <a
                href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <span>Search Indian Kanoon Live for "{query}"</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((item) => {
              const fullCitationString = `${item.title}, ${item.citation} [${item.court}]`;
              return (
                <div
                  key={item.doc_id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl transition duration-150 space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.is_landmark && (
                          <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px] font-semibold rounded-md flex items-center gap-1">
                            <Award className="h-3 w-3" /> Landmark
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-medium rounded-md">
                          {item.court}
                        </span>
                        {item.year && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded-md">
                            Year: {item.year}
                          </span>
                        )}
                        <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                          {item.citation}
                        </span>
                      </div>
                      
                      <h3
                        onClick={() => viewDocumentDetails(item.doc_id)}
                        className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition pt-1"
                      >
                        {item.title}
                      </h3>
                      {item.bench && (
                        <p className="text-xs text-slate-400 italic">
                          Bench: {item.bench}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <button
                        onClick={() => copyCitation(fullCitationString, item.doc_id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition"
                        title="Copy formal citation"
                      >
                        {copiedId === item.doc_id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Cite</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openInDraftStudio(item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow transition"
                        title="Open directly into Split-Screen Draft Studio"
                      >
                        <FileSignature className="h-3.5 w-3.5" />
                        <span>Insert in Draft</span>
                      </button>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition"
                          title="Open Certified Judgment on Indian Kanoon"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Ratio Decidendi */}
                  <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-indigo-300 flex items-center gap-1">
                      <span>⚖️</span> Ratio Decidendi / Legal Holding:
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      {item.ratio || item.headline}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kanoon API Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Indian Kanoon API Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p>
                <strong>Get your Free Token:</strong> Sign up for an API account at{' '}
                <a
                  href="https://api.indiankanoon.org/signup/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 underline"
                >
                  api.indiankanoon.org/signup
                </a>{' '}
                to get a complimentary authorization token.
              </p>
              <p className="text-slate-400">
                LawLens works seamlessly right now with our built-in Indian Landmark Judicial Corpus even without a token!
              </p>
            </div>

            {tokenMsg && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
                {tokenMsg}
              </div>
            )}

            <form onSubmit={handleSaveToken} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Enter Your Token
                </label>
                <input
                  type="text"
                  value={kanoonToken}
                  onChange={(e) => setKanoonToken(e.target.value)}
                  placeholder="e.g. 5f8a2b3c4d5e6f..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs"
                >
                  Save Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Document View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-medium rounded">
                  {selectedDoc.court}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs font-mono text-emerald-400 mt-0.5">
                  {selectedDoc.citation}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-200">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="font-semibold text-indigo-300">Core Legal Ratio:</p>
                <p className="leading-relaxed">{selectedDoc.ratio || selectedDoc.headline}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-300">Certified Transcript & Ratio Breakdown:</p>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {selectedDoc.full_text}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <a
                href={selectedDoc.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline text-xs flex items-center gap-1"
              >
                <span>Read Full Order on Indian Kanoon</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => openInDraftStudio(selectedDoc)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <FileSignature className="h-3.5 w-3.5" />
                  <span>Use in Draft Studio</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
