import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Bookmark, CheckCircle2, Clock, AlertTriangle,
  RefreshCw, Trash2, Mail, ExternalLink, Sparkles, Send
} from 'lucide-react';
import { api } from '../api/client';
import { ApplicationTrack, WeeklyDigest } from '../types';
import { UrgencyBadge } from '../components/UrgencyBadge';

export const DashboardPage: React.FC = () => {
  const [tracks, setTracks] = useState<ApplicationTrack[]>([]);
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  const statuses = ['saved', 'applied', 'interviewing', 'accepted', 'rejected'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appData, digestData] = await Promise.all([
        api.getApplications(),
        api.getWeeklyDigest()
      ]);
      setTracks(appData);
      setDigest(digestData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(id, { status: newStatus });
      setTracks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteTrack = async (id: number) => {
    try {
      await api.deleteApplication(id);
      setTracks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to remove track.");
    }
  };

  const getStatusBadgeStyle = (st: string) => {
    switch (st) {
      case 'saved':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/50';
      case 'applied':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/50';
      case 'interviewing':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/50';
      case 'accepted':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
      case 'rejected':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-400" />
            Student Tracker Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor upcoming deadlines, tracked applications, and your personalized weekly digest.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Dashboard
        </button>
      </div>

      {/* Weekly Digest Hero Card */}
      {digest && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Personalized Weekly Digest</h2>
            </div>
            <span className="text-[11px] text-indigo-300 font-mono bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
              {digest.generated_at}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {digest.summary}
          </p>

          {/* Urgent & Top Recs Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Urgent Deadlines (&lt; 10 days)
              </h4>
              {digest.urgent_deadlines.length === 0 ? (
                <p className="text-xs text-slate-500">No urgent deadlines closing soon.</p>
              ) : (
                digest.urgent_deadlines.map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                    <Link to={`/opportunities/${opp.id}`} className="font-semibold text-slate-200 hover:text-indigo-300 line-clamp-1">
                      {opp.title}
                    </Link>
                    <UrgencyBadge deadlineStr={opp.deadline} showIcon={false} />
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Top Matches for Your Profile
              </h4>
              {digest.top_recommendations.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                  <Link to={`/opportunities/${opp.id}`} className="font-semibold text-slate-200 hover:text-indigo-300 line-clamp-1">
                    {opp.title}
                  </Link>
                  <span className="text-slate-400 font-mono text-[11px]">{opp.amount_or_stipend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Application Status Kanban Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            Tracked Applications & Saved Opportunities ({tracks.length})
          </h2>
          <Link to="/opportunities" className="text-xs font-semibold text-indigo-400 hover:underline">
            + Save More Listings
          </Link>
        </div>

        {tracks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
            <p className="text-sm font-semibold text-slate-300 mb-1">No tracked applications yet.</p>
            <p className="text-xs">Save opportunities from the search page or chatbot to manage your application deadlines here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadgeStyle(track.status)}`}>
                      {track.status}
                    </span>
                    {track.opportunity && <UrgencyBadge deadlineStr={track.opportunity.deadline} />}
                  </div>

                  <h3 className="text-base font-bold text-slate-100">
                    {track.opportunity ? (
                      <Link to={`/opportunities/${track.opportunity.id}`} className="hover:text-indigo-400 transition-colors">
                        {track.opportunity.title}
                      </Link>
                    ) : (
                      `Opportunity #${track.opportunity_id}`
                    )}
                  </h3>

                  {track.opportunity && (
                    <p className="text-xs text-slate-400">
                      {track.opportunity.org} • {track.opportunity.location} ({track.opportunity.location_type}) • {track.opportunity.amount_or_stipend}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status Dropdown */}
                  <select
                    value={track.status}
                    onChange={(e) => handleStatusChange(track.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  {track.opportunity && (
                    <a
                      href={track.opportunity.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-colors text-xs font-medium flex items-center gap-1"
                      title="Apply Direct"
                    >
                      Apply <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                    title="Remove Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
