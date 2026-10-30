import React from 'react';
import { Calendar, FileText, Clock } from 'lucide-react';

export default function TimelineView({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-xl text-center text-slate-400">
        <Clock className="h-8 w-8 text-indigo-400/60 mx-auto mb-2" />
        <p className="text-sm">No timeline events extracted yet. Run intelligence analysis on case records to generate the chronological event chain.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-indigo-700/50 ml-4 pl-6 space-y-6 my-4">
      {events.map((ev, index) => (
        <div key={index} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 border-2 border-slate-900 group-hover:scale-125 transition" />

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2 hover:border-slate-600 transition">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                <Calendar className="h-3 w-3" />
                {ev.event_date}
              </span>
              {ev.source_ref && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <FileText className="h-3 w-3 text-slate-500" />
                  {ev.source_ref}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white">
              {ev.title}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              {ev.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
