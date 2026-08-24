import axios from 'axios';
import {
  Opportunity,
  StudentProfile,
  ApplicationTrack,
  Citation,
  EssayCritique,
  WeeklyDigest
} from '../types';

const API_BASE = '/api';

export const api = {
  // Chat RAG Endpoint
  sendChatMessage: async (message: string, useProfileContext: boolean = true, sessionId: string = 'default_session') => {
    const res = await axios.post<{
      answer: string;
      citations: Citation[];
      structured_filters_applied: Record<string, any>;
      total_candidates_found: number;
    }>(`${API_BASE}/chat`, {
      message,
      use_profile_context: useProfileContext,
      session_id: sessionId
    });
    return res.data;
  },

  // Opportunities
  getOpportunities: async (params?: {
    search?: string;
    type?: string;
    major?: string;
    min_gpa?: number;
    location_type?: string;
  }) => {
    const res = await axios.get<Opportunity[]>(`${API_BASE}/opportunities`, { params });
    return res.data;
  },

  getOpportunityById: async (id: number) => {
    const res = await axios.get<Opportunity>(`${API_BASE}/opportunities/${id}`);
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await axios.get<StudentProfile>(`${API_BASE}/profile`);
    return res.data;
  },

  updateProfile: async (profile: StudentProfile) => {
    const res = await axios.put<StudentProfile>(`${API_BASE}/profile`, profile);
    return res.data;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<StudentProfile>(`${API_BASE}/profile/upload-resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Application Tracking
  getApplications: async () => {
    const res = await axios.get<ApplicationTrack[]>(`${API_BASE}/applications`);
    return res.data;
  },

  saveOrUpdateApplication: async (data: { opportunity_id: number; status: string; notes?: string; applied_date?: string }) => {
    const res = await axios.post<ApplicationTrack>(`${API_BASE}/applications`, data);
    return res.data;
  },

  updateApplicationStatus: async (id: number, data: { status?: string; notes?: string; applied_date?: string }) => {
    const res = await axios.put<ApplicationTrack>(`${API_BASE}/applications/${id}`, data);
    return res.data;
  },

  deleteApplication: async (id: number) => {
    const res = await axios.delete<{ status: string; id: number }>(`${API_BASE}/applications/${id}`);
    return res.data;
  },

  // Essay Critique
  critiqueEssay: async (essayText: string, scholarshipId?: number, promptCriteria?: string) => {
    const res = await axios.post<EssayCritique>(`${API_BASE}/essay-critique`, {
      essay_text: essayText,
      scholarship_id: scholarshipId,
      prompt_criteria: promptCriteria
    });
    return res.data;
  },

  // Weekly Digest
  getWeeklyDigest: async () => {
    const res = await axios.get<WeeklyDigest>(`${API_BASE}/digest`);
    return res.data;
  }
};
