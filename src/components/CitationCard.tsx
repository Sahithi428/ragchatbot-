import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Bookmark, Building2, Calendar, Award } from 'lucide-react';
import { Citation } from '../types';
import { UrgencyBadge } from './UrgencyBadge';

interface CitationCardProps {
  citation: Citation;
  onSave?: (id: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSave }) => {
  return (
    <div className="bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-3.5 shadow-md transition-all hover:shadow-indigo-500/10 text-left flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            citation.type === 'scholarship'
              ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
              : 'bg-blue-950 text-blue-300 border border-blue-800/60'
          }`}>
            {citation.type}
          </span>
          <UrgencyBadge deadlineStr={citation.deadline} showIcon={false} />
        </div>

        <h4 className="text-sm font-bold text-slate-100 line-clamp-1 mb-0.5">
          {citation.title}
        </h4>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Building2 className="w-3 h-3 text-indigo-400" />
            {citation.org}
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">{citation.amount_or_stipend}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mt-1 text-xs">
        <Link
          to={`/opportunities/${citation.id}`}
          className="text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Details
        </Link>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => onSave(citation.id)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
              title="Bookmark Opportunity"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={citation.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-md transition-colors"
          >
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
