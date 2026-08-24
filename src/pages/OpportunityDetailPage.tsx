import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, MapPin, DollarSign, GraduationCap, Calendar, ShieldCheck,
  ExternalLink, Bookmark, FileText, ArrowLeft, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import { Opportunity, EssayCritique } from '../types';
import { UrgencyBadge } from '../components/UrgencyBadge';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Essay Critique Modal State
  const [showCritiqueModal, setShowCritiqueModal] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [critiqueResult, setCritiqueResult] = useState<EssayCritique | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetail(Number(id));
      checkSavedStatus(Number(id));
    }
  }, [id]);

  const fetchDetail = async (oppId: number) => {
    setLoading(true);
    try {
      const data = await api.getOpportunityById(oppId);
      setOpportunity(data);
    } catch (err) {
      console.error("Failed to load opportunity detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = async (oppId: number) => {
    try {
      const tracks = await api.getApplications();
      setIsSaved(tracks.some(t => t.opportunity_id === oppId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!opportunity) return;
    try {
      if (isSaved) {
        const tracks = await api.getApplications();
        const found = tracks.find(t => t.opportunity_id === opportunity.id);
        if (found) {
          await api.deleteApplication(found.id);
          setIsSaved(false);
        }
      } else {
        await api.saveOrUpdateApplication({ opportunity_id: opportunity.id, status: 'saved' });
        setIsSaved(true);
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleCritiqueEssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim() || critiqueLoading || !opportunity) return;

    setCritiqueLoading(true);
    setCritiqueResult(null);
    try {
      const res = await api.critiqueEssay(
        essayText,
        opportunity.id,
        `Criteria for ${opportunity.title}: ${opportunity.description}`
      );
      setCritiqueResult(res);
    } catch (err) {
      alert("Failed to generate essay critique.");
    } finally {
      setCritiqueLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="h-12 bg-slate-800 rounded w-3/4"></div>
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-bold text-slate-200">Opportunity not found.</p>
        <Link to="/opportunities" className="text-indigo-400 text-sm mt-4 inline-block hover:underline">
          &larr; Back to all listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" /> Back to Explore Opportunities
      </Link>

      {/* Main Detail Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              opportunity.type === 'scholarship'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              {opportunity.type}
            </span>
            <UrgencyBadge deadlineStr={opportunity.deadline} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-colors ${
                isSaved
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-300' : ''}`} />
              {isSaved ? 'Saved in Tracker' : 'Save to Dashboard'}
            </button>

            <a
              href={opportunity.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              Apply Official Source <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 mb-2">
            {opportunity.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {opportunity.org}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              {opportunity.location} ({opportunity.location_type})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <DollarSign className="w-4 h-4" />
              {opportunity.amount_or_stipend}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Eligibility vs Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Eligibility Criteria Sidebar */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Eligibility Requirements
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Minimum GPA:</span>
              <span className="text-slate-200 font-bold text-sm bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 inline-block">
                {opportunity.min_gpa} GPA Floor
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Target Majors:</span>
              <div className="flex flex-wrap gap-1">
                {opportunity.majors?.map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Allowed Class Years:</span>
              <div className="flex flex-wrap gap-1">
                {opportunity.class_years?.map((y, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                    {y}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Citizenship Requirement:</span>
              <span className="text-slate-300 font-semibold">{opportunity.citizenship_requirement}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Application Deadline:</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-200 font-semibold">{opportunity.deadline}</span>
              </div>
            </div>
          </div>

          {/* SOP / Essay Review trigger banner */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowCritiqueModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 font-bold text-xs border border-purple-600/40 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              Critique My Scholarship Essay / SOP
            </button>
          </div>
        </div>

        {/* Detailed Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-100">Program Description & Details</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>

          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags & Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags?.map((t, idx) => (
                <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Essay / SOP Critique Modal */}
      {showCritiqueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-slate-100">Scholarship Essay / SOP Critique Engine</h3>
              </div>
              <button
                onClick={() => setShowCritiqueModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste your essay draft below. StudentPath will review it against the eligibility criteria and prompt of <strong>{opportunity.title}</strong>.
            </p>

            <form onSubmit={handleCritiqueEssay} className="space-y-4">
              <textarea
                rows={6}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste your essay or statement of purpose draft here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="submit"
                disabled={critiqueLoading || !essayText.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {critiqueLoading ? 'Evaluating against criteria...' : 'Generate AI Critique'}
              </button>
            </form>

            {critiqueResult && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-slate-300">Overall Assessment Score:</span>
                  <span className="text-sm font-black text-purple-400 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800">
                    {critiqueResult.overall_score}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Core Strengths:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {critiqueResult.strengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {critiqueResult.improvements?.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-indigo-400 mb-1.5">Actionable Edits & Hook Suggestion:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {critiqueResult.actionable_edits?.map((edit, idx) => (
                      <li key={idx}>{edit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
