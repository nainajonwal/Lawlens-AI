import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Database,
  Upload,
  Search,
  Filter,
  FileCheck2,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Calendar,
  BookOpen
} from 'lucide-react';

export default function DatasetPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchDataset = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dataset/', {
        params: {
          q: search || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined
        }
      });
      setCases(res.data);
    } catch (err) {
      console.error('Error fetching dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDataset();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/dataset/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatusMsg({ type: 'success', text: res.data.message });
      fetchDataset();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to upload dataset file. Ensure it is a valid CSV or JSON file.'
      });
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const categories = ['All', 'Civil', 'Criminal', 'Commercial', 'Cyber', 'Constitutional'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-full">
              Legal Benchmark Corpus
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Historical Cases & Precedent Dataset
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Repository of previous Indian judgments, procedural pitfalls, and ratios used to calibrate risk & priority
          </p>
        </div>

        {/* Upload Dataset Button */}
        <div>
          <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/30 cursor-pointer transition">
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Ingesting Dataset...' : 'Upload Past Cases Dataset (CSV / JSON)'}</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-3 text-xs rounded-xl border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Benchmark Info Card */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Scale className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">How This Dataset Powers LawLens:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Every time a lawyer uploads a court brief or contract, LawLens cross-references the text with this historical database.
            It identifies similar past disputes, alerts on known procedural pitfalls (such as defective notice periods or missing electronic evidence certificates),
            and dynamically calibrates the case's <strong>Explainable Risk & Priority Score</strong>.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 pb-1 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case, citation, pitfall..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700"
          >
            Find
          </button>
        </form>
      </div>

      {/* Cases Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading historical cases...</div>
      ) : cases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No past cases match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div
              key={c.historical_id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                  <h3 className="text-sm font-bold text-white italic mt-1.5">{c.case_name}</h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">
                    {c.citation || 'Unreported'} • {c.court} {c.year ? `(${c.year})` : ''}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Material Factual Matrix:</span>
                <p>{c.facts_summary}</p>
              </div>

              {c.procedural_pitfalls && (
                <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg text-xs text-amber-300 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Procedural Pitfall & Risk Warning:
                  </span>
                  <p className="text-[11px] leading-relaxed">{c.procedural_pitfalls}</p>
                </div>
              )}

              {c.legal_ratio && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block">Binding Ratio Decidendi:</span>
                  <p className="text-[11px] italic leading-relaxed text-slate-200">"{c.legal_ratio}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
