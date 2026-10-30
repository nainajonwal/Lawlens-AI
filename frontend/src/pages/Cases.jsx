import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Briefcase,
  Plus,
  Scale,
  FileText,
  Calendar,
  ShieldAlert,
  ArrowRight,
  X
} from 'lucide-react';

export default function Cases() {
  const { activeCaseId, setActiveCaseId } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Civil');
  const [court, setCourt] = useState('District Court');
  const [filingNumber, setFilingNumber] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await api.get('/cases/');
      setCases(res.data);
      if (!activeCaseId && res.data.length > 0) {
        setActiveCaseId(res.data[0].case_id);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/cases/', {
        title,
        category,
        court,
        filing_number: filingNumber || null,
        next_hearing_date: nextHearingDate || null,
      });
      setActiveCaseId(res.data.case_id);
      setIsModalOpen(false);
      setTitle('');
      setFilingNumber('');
      setNextHearingDate('');
      fetchCases();
    } catch (err) {
      console.error('Error creating case:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCase = (id) => {
    setActiveCaseId(id);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Case Dockets & Portfolio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage legal briefs, client representations, and jurisdictional proceedings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/20 transition self-start"
        >
          <Plus className="h-4 w-4" />
          Create New Case
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading cases portfolio...</div>
      ) : cases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Briefcase className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Cases on Record</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first legal case docket. Upload court filings and generate AI intelligence.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add First Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const isActive = activeCaseId === c.case_id || activeCaseId === String(c.case_id);
            return (
              <div
                key={c.case_id}
                onClick={() => handleSelectCase(c.case_id)}
                className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 cursor-pointer transition flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                      {c.category} Law
                    </span>
                    {isActive ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                        Active Case
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCase(c.case_id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">
                    {c.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Scale className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate">{c.court || 'District Court'}</span>
                    </div>
                    {c.filing_number && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Filing: {c.filing_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>Next Listing: {c.next_hearing_date || 'Awaiting Schedule'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCaseId(c.case_id);
                      navigate('/documents');
                    }}
                    className="text-slate-400 hover:text-indigo-400 transition"
                  >
                    Uploads
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCaseId(c.case_id);
                      navigate('/intelligence');
                    }}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition"
                  >
                    Open Intelligence
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                Open New Case Docket
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Case Title / Cause Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ramesh Chandra vs. Municipal Corporation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jurisdiction / Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Constitutional">Constitutional</option>
                    <option value="Cyber">Cyber</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Court / Forum</label>
                  <input
                    type="text"
                    required
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    placeholder="High Court of Bombay"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Filing / CNR Number</label>
                  <input
                    type="text"
                    value={filingNumber}
                    onChange={(e) => setFilingNumber(e.target.value)}
                    placeholder="WP/2026/4102"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Next Hearing Date</label>
                  <input
                    type="date"
                    value={nextHearingDate}
                    onChange={(e) => setNextHearingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Initialize Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
