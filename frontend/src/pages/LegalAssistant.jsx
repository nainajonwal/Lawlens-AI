import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  BotMessageSquare,
  Send,
  User,
  Sparkles,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Key,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function LegalAssistant() {
  const { activeCaseId, setActiveCaseId } = useAuth();
  const [cases, setCases] = useState([]);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef(null);

  // Gemini AI Key Configuration Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [keyStatusMsg, setKeyStatusMsg] = useState('');
  const [aiStatus, setAiStatus] = useState({
    gemini_configured: false,
    mode: 'Dynamic Indian Legal Reasoning Engine (Active)',
  });

  useEffect(() => {
    fetchAiStatus();
    api.get('/cases/').then((res) => {
      setCases(res.data);
      if (!activeCaseId && res.data.length > 0) {
        setActiveCaseId(res.data[0].case_id);
      }
    });
  }, []);

  const fetchAiStatus = async () => {
    try {
      const res = await api.get('/assistant/status');
      setAiStatus(res.data);
    } catch {
      setAiStatus({
        gemini_configured: false,
        mode: 'Dynamic Indian Legal Reasoning Engine (Active)',
      });
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    setKeyStatusMsg('');
    try {
      await api.post('/assistant/key', { api_key: geminiKeyInput });
      setKeyStatusMsg('Gemini API Key updated successfully!');
      fetchAiStatus();
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyStatusMsg('');
      }, 1200);
    } catch {
      setKeyStatusMsg('Failed to update API key.');
    }
  };

  const fetchChatHistory = async (caseId) => {
    if (!caseId) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/assistant/${caseId}/chat`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeCaseId) {
      fetchChatHistory(activeCaseId);
    }
  }, [activeCaseId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const message = textToSend || query;
    if (!message.trim()) return;

    const userTemp = {
      message_id: Date.now(),
      sender: 'lawyer',
      message_text: message,
    };
    setMessages((prev) => [...prev, userTemp]);
    setQuery('');
    setLoading(true);

    try {
      const endpoint = activeCaseId ? `/assistant/${activeCaseId}/chat` : `/assistant/chat`;
      const res = await api.post(endpoint, {
        message_text: message,
      });
      setMessages((prev) => [...prev.slice(0, -1), userTemp, res.data]);
    } catch (err) {
      console.error('Error sending query:', err);
      setMessages((prev) => [
        ...prev,
        {
          message_id: Date.now() + 1,
          sender: 'assistant',
          message_text: 'Unable to process legal query. Please ensure backend services are active.',
          sources_cited: 'System Advisory',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'nasrapur rape case was a criminal case or civil case',
    'What is the procedure for Anticipatory Bail under Section 438 CrPC?',
    'What is the difference between breach of contract and cheating?',
    'Is Section 65B Evidence Act certificate mandatory for WhatsApp chats?',
    'What is the statutory timeline for Section 138 NI Act cheque dishonour notice?',
    'What are the 7 grounds to quash an FIR under Section 482 CrPC Bhajan Lal?',
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-57px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-lg text-indigo-400">
            <BotMessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Source-Grounded Legal Research Assistant
            </h1>
            <p className="text-xs text-slate-400">
              Cites statutory provisions, Indian court precedents, and certified Kanoon ratios.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Engine Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                aiStatus.gemini_configured
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-indigo-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {aiStatus.gemini_configured
                ? 'Gemini 2.5 Flash: Active'
                : 'Legal Engine: Dynamic Active'}
            </span>
          </div>

          {/* AI Key Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-medium transition"
            title="Configure Google Gemini API Key"
          >
            <Key className="h-3.5 w-3.5" />
            <span>AI Key</span>
          </button>

          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <select
              value={activeCaseId || ''}
              onChange={(e) => setActiveCaseId(e.target.value || null)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="">🌐 General Legal Research (All Indian Law)</option>
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4 shadow-inner">
        {loadingHistory ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading research records...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="p-3 bg-indigo-950 border border-indigo-700/60 rounded-xl text-indigo-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ask LawLens Legal Assistant</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ask specific legal questions regarding Indian criminal offences, civil classifications,
                statutory sections, procedural timelines, or case law precedents.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Popular Inquiries:
              </span>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="w-full text-left text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 p-2.5 rounded-lg transition"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            const isUser = m.sender === 'lawyer';
            return (
              <div
                key={m.message_id || index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                    <BotMessageSquare className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                    {m.message_text}
                  </div>

                  {m.sources_cited && (
                    <div className="pt-2 border-t border-slate-700/60 flex items-start gap-1.5 text-[10px] text-indigo-300 font-mono">
                      <BookmarkCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-400" />
                      <span>
                        <strong>Sources Cited:</strong> {m.sources_cited}
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <BotMessageSquare className="h-4 w-4" />
            </div>
            <div className="bg-slate-800 text-slate-400 text-xs px-4 py-3 rounded-2xl border border-slate-700 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Analyzing Indian legal statutes and precedents...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a legal query (e.g. 'Is rape a civil or criminal case?', 'Grounds for 438 CrPC bail')..."
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
        >
          <span>Ask</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Gemini AI Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Google Gemini AI Configuration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p>
                <strong>Get a Free Key:</strong> You can generate a free API key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 underline inline-flex items-center gap-1"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>.
              </p>
              <p className="text-slate-400">
                LawLens works seamlessly right now with our built-in Dynamic Indian Legal Engine even without an API key!
              </p>
            </div>

            {keyStatusMsg && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
                {keyStatusMsg}
              </div>
            )}

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/30"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
