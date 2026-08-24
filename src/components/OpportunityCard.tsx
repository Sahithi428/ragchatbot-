import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Bookmark, Building2, MapPin, DollarSign, Award, GraduationCap } from 'lucide-react';
import { Opportunity } from '../types';
import { UrgencyBadge } from './UrgencyBadge';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onBookmark?: (id: number) => void;
  isBookmarked?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onBookmark,
  isBookmarked = false
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all hover:shadow-indigo-500/10 flex flex-col justify-between group">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
              opportunity.type === 'scholarship'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                : 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
            }`}>
              {opportunity.type}
            </span>
            <UrgencyBadge deadlineStr={opportunity.deadline} />
          </div>

          {onBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark(opportunity.id);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 border-slate-700'
              }`}
              title={isBookmarked ? "Saved in Dashboard" : "Bookmark Opportunity"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <Link to={`/opportunities/${opportunity.id}`} className="group-hover:text-indigo-400 transition-colors">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 mb-1">
            {opportunity.title}
          </h3>
        </Link>

        {/* Org & Location */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            {opportunity.org}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {opportunity.location} ({opportunity.location_type})
          </span>
        </div>

        {/* Meta badges */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 mb-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">{opportunity.amount_or_stipend}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Min GPA: {opportunity.min_gpa}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View Eligibility Details &rarr;
        </Link>
        <a
          href={opportunity.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
        >
          Apply Direct <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
