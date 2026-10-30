import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileUp,
  Scale,
  ShieldAlert,
  BotMessageSquare,
  Database,
  FileSignature,
  Search
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Draft Studio (Word)', path: '/draft-studio', icon: FileSignature },
  { name: 'Legal Research', path: '/research', icon: Search },
  { name: 'My Cases', path: '/cases', icon: Briefcase },
  { name: 'Documents', path: '/documents', icon: FileUp },
  { name: 'Legal Intelligence', path: '/intelligence', icon: Scale },
  { name: 'Risk & Priority', path: '/risk-priority', icon: ShieldAlert },
  { name: 'Historical Dataset', path: '/dataset', icon: Database },
  { name: 'AI Legal Assistant', path: '/assistant', icon: BotMessageSquare },
];


export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Lawyer Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
