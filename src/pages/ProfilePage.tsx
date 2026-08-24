import React, { useState, useEffect } from 'react';
import { User, FileText, Upload, Save, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { StudentProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: 'Alex Taylor',
    major: 'Computer Science',
    class_year: 'Junior',
    gpa: 3.6,
    citizenship: 'US Citizen',
    location_preference: 'remote',
    skills: ['Python', 'React', 'SQL'],
    interests: ['AI', 'Data Science']
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data);
      setSkillsInput(data.skills ? data.skills.join(', ') : '');
      setInterestsInput(data.interests ? data.interests.join(', ') : '');
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const updatedProfile: StudentProfile = {
      ...profile,
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      interests: interestsInput.split(',').map(i => i.trim()).filter(Boolean)
    };

    try {
      const res = await api.updateProfile(updatedProfile);
      setProfile(res);
      setSuccessMsg("Student profile updated successfully!");
    } catch (err) {
      setErrorMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg("Please select a PDF file.");
      return;
    }

    setUploading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await api.uploadResume(file);
      setProfile(updated);
      setSkillsInput(updated.skills ? updated.skills.join(', ') : '');
      setInterestsInput(updated.interests ? updated.interests.join(', ') : '');
      setSuccessMsg("Resume text parsed! Major, GPA, Skills, and Profile attributes auto-extracted.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to extract text from PDF resume.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-400" />
            Student Profile Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your profile acts as auto-filtering criteria for RAG Chatbot queries and Weekly Digest matches.
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: PDF Resume Upload vs Manual Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PDF Resume Uploader */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            PDF Resume Auto-Extract
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Upload your PDF resume. Our AI parser extracts your major, GPA, skills, and class year automatically to populate your profile.
          </p>

          <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 hover:bg-indigo-950/20 transition-all group">
            <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
            <span className="text-xs font-bold text-slate-200 block mb-1">
              {uploading ? 'Parsing PDF text...' : 'Click to Upload Resume (PDF)'}
            </span>
            <span className="text-[11px] text-slate-500">Supports .pdf files up to 10MB</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {profile.resume_text && (
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Extracted Resume Text Preview:
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto font-mono text-[10px] text-slate-400 leading-tight whitespace-pre-wrap">
                {profile.resume_text.slice(0, 500)}...
              </div>
            </div>
          )}
        </div>

        {/* Profile Fields Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Primary Major
                </label>
                <input
                  type="text"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Cumulative GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  value={profile.gpa}
                  onChange={(e) => setProfile({ ...profile, gpa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Class Year
                </label>
                <select
                  value={profile.class_year}
                  onChange={(e) => setProfile({ ...profile, class_year: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Citizenship Status
                </label>
                <select
                  value={profile.citizenship}
                  onChange={(e) => setProfile({ ...profile, citizenship: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="US Citizen">US Citizen</option>
                  <option value="Permanent Resident">Permanent Resident</option>
                  <option value="International">International</option>
                  <option value="Any">Any / Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Work Location Preference
                </label>
                <select
                  value={profile.location_preference}
                  onChange={(e) => setProfile({ ...profile, location_preference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="remote font-semibold">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="any">No Preference (Any)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, React, SQL, Machine Learning..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Interests & Focus Areas (Comma separated)
              </label>
              <input
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="Artificial Intelligence, Web Development, Climate Tech..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
