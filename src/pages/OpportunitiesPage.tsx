import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, SlidersHorizontal, Compass } from 'lucide-react';
import { api } from '../api/client';
import { Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [minGpaFilter, setMinGpaFilter] = useState<number | ''>('');

  const majorsList = [
    'all',
    'Computer Science',
    'Data Science',
    'Engineering',
    'Bioinformatics',
    'Finance',
    'Cybersecurity',
    'Design',
    'Business Administration'
  ];

  useEffect(() => {
    fetchOpportunities();
    fetchSavedTracks();
  }, [search, typeFilter, majorFilter, locationTypeFilter, minGpaFilter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities({
        search: search || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        major: majorFilter !== 'all' ? majorFilter : undefined,
        location_type: locationTypeFilter !== 'all' ? locationTypeFilter : undefined,
        min_gpa: minGpaFilter !== '' ? Number(minGpaFilter) : undefined
      });
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTracks = async () => {
    try {
      const tracks = await api.getApplications();
      setSavedIds(tracks.map(t => t.opportunity_id));
    } catch (err) {
      console.error("Failed to load saved tracks:", err);
    }
  };

  const handleBookmark = async (id: number) => {
    try {
      if (savedIds.includes(id)) {
        const tracks = await api.getApplications();
        const found = tracks.find(t => t.opportunity_id === id);
        if (found) {
          await api.deleteApplication(found.id);
          setSavedIds(prev => prev.filter(x => x !== id));
        }
      } else {
        await api.saveOrUpdateApplication({ opportunity_id: id, status: 'saved' });
        setSavedIds(prev => [...prev, id]);
      }
    } catch (err) {
      alert("Failed to toggle bookmark.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-400" />
            Explore Verified Opportunities
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse {opportunities.length} active internships & scholarships with structured eligibility rules.
          </p>
        </div>

        <button
          onClick={fetchOpportunities}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Listings
        </button>
      </div>

      {/* Main Search & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit space-y-6 shadow-xl sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Filter Criteria
            </span>
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setMajorFilter('all');
                setLocationTypeFilter('all');
                setMinGpaFilter('');
              }}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Opportunity Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'internship', 'scholarship'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`py-1.5 rounded-lg capitalize font-medium transition-all ${
                    typeFilter === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Major Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Target Major
            </label>
            <select
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {majorsList.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All Majors' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Location Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Work Setting
            </label>
            <select
              value={locationTypeFilter}
              onChange={(e) => setLocationTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Settings</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Maximum GPA requirement filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Max Min-GPA Ceiling
            </label>
            <input
              type="number"
              step="0.1"
              min="0.0"
              max="4.0"
              placeholder="e.g. 3.5"
              value={minGpaFilter}
              onChange={(e) => setMinGpaFilter(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, organization, tags, or description keywords..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-lg"
            />
          </div>

          {/* Results section */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-800 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2 mb-6"></div>
                  <div className="h-16 bg-slate-800/60 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <p className="text-base font-bold text-slate-200 mb-1">No opportunities found</p>
              <p className="text-xs">Try resetting your filter parameters or clearing your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onBookmark={handleBookmark}
                  isBookmarked={savedIds.includes(opp.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
