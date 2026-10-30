import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, Briefcase, User as UserIcon } from 'lucide-react';
import api from '../api/client';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, activeCaseId } = useAuth();
  const [activeCaseTitle, setActiveCaseTitle] = useState('');

  useEffect(() => {
    if (activeCaseId) {
      api.get(`/cases/${activeCaseId}`)
        .then((res) => setActiveCaseTitle(res.data.title))
        .catch(() => setActiveCaseTitle(''));
    } else {
      setActiveCaseTitle('');
    }
  }, [activeCaseId]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-bold text-xl hover:text-indigo-300 transition">
          <Scale className="h-6 w-6 text-indigo-500" />
          <span>LawLens</span>
        </Link>
        <span className="text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-medium">
          Legal Intelligence
        </span>
      </div>

      <div className="hidden lg:flex items-center space-x-2">
        <Link
          to="/draft-studio"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition"
        >
          <span>📜 Draft Studio</span>
        </Link>
        <Link
          to="/research"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition"
        >
          <span>🔍 Legal Research</span>
        </Link>
      </div>

      {activeCaseTitle && (
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-sm">
          <Briefcase className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400 text-xs">Active Case:</span>
          <span className="font-medium text-slate-200 truncate max-w-xs">{activeCaseTitle}</span>
          <Link to="/cases" className="text-xs text-indigo-400 hover:underline ml-2">Switch</Link>
        </div>
      )}


      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 text-sm text-slate-300">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm shadow-indigo-600/30">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'LL'}
          </div>
          <div className="flex flex-col">
            <span className="hidden sm:inline font-semibold text-xs text-white">
              {user?.name ? (user.name.trim().toLowerCase().startsWith('adv') ? user.name : `Adv. ${user.name}`) : 'Advocate'}
            </span>
            {user?.bar_enrollment_no && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                BCI: {user.bar_enrollment_no}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700 transition"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
