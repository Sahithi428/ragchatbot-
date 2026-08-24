import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, Target, ArrowRight, CheckCircle2, Search, GraduationCap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const sampleQueries = [
    "Find remote data science internships for sophomores",
    "Scholarships for engineering majors with a 3.5 GPA",
    "Internships with over $45/hr stipend and no US citizenship requirement",
    "Upcoming scholarship deadlines closing within 7 days"
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 blur-3xl rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Full-Stack Hybrid RAG Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Discover Internships & Scholarships Built for Your <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Exact Student Profile</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            StudentPath combines structured database filtering with semantic vector search to match real, non-hallucinated opportunities based on your major, GPA, class year, and citizenship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Launch RAG Assistant <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/opportunities"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              Browse All Listings
            </Link>
          </div>

          {/* Sample query pill prompts */}
          <div className="max-w-3xl mx-auto text-left bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Search className="w-4 h-4 text-indigo-400" />
              Try Asking the Assistant:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sampleQueries.map((q, idx) => (
                <Link
                  key={idx}
                  to={`/chat?q=${encodeURIComponent(q)}`}
                  className="text-xs p-3 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 transition-all flex items-center justify-between group"
                >
                  <span>"{q}"</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-100 tracking-tight mb-4">
            Why StudentPath RAG Performs Better
          </h2>
          <p className="text-slate-400">
            Pure semantic vector search fails on strict eligibility bounds (e.g. GPA floors or citizenship). StudentPath solves this with a 5-stage hybrid engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Hard SQL Pre-Filtering</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We filter candidate opportunities first on exact SQLite criteria (GPA floor, major, class year, citizenship, deadline date) before executing vector search.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Zero Hallucinations & Citations</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every recommendation is grounded in real metadata with direct clickable application URLs. If no opportunities match, we state it explicitly rather than fabricating.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Deadline Urgency & Tracking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Color-coded deadline urgency badges (Red &lt;7 days, Amber &lt;30 days) keep you on schedule, complete with application status boards and SOP essay critiques.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-white mb-1">50+</div>
            <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Active Opportunities</div>
          </div>
          <div>
            <div className="text-4xl font-black text-emerald-400 mb-1">100%</div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Grounded Citations</div>
          </div>
          <div>
            <div className="text-4xl font-black text-amber-400 mb-1">&lt; 7d</div>
            <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold">Urgent Alerts</div>
          </div>
          <div>
            <div className="text-4xl font-black text-purple-400 mb-1">AI</div>
            <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Resume PDF Parsing</div>
          </div>
        </div>
      </section>
    </div>
  );
};
