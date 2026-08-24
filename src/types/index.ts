export interface Eligibility {
  min_gpa: number;
  majors: string[];
  class_years: string[];
  citizenship_requirement: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location: string;
}

export interface Opportunity {
  id: number;
  title: string;
  org: string;
  type: 'internship' | 'scholarship';
  deadline: string;
  min_gpa: number;
  majors: string[];
  class_years: string[];
  citizenship_requirement: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location: string;
  amount_or_stipend: string;
  description: string;
  application_url: string;
  tags: string[];
  date_added: string;
  eligibility?: Eligibility;
}

export interface StudentProfile {
  id?: number;
  name: string;
  major: string;
  class_year: string;
  gpa: number;
  citizenship: string;
  location_preference: string;
  skills: string[];
  interests: string[];
  resume_text?: string;
}

export interface ApplicationTrack {
  id: number;
  student_id: number;
  opportunity_id: number;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted';
  notes: string;
  applied_date: string;
  updated_at: string;
  opportunity?: Opportunity;
}

export interface Citation {
  id: number;
  title: string;
  org: string;
  type: 'internship' | 'scholarship';
  deadline: string;
  min_gpa: number;
  amount_or_stipend: string;
  application_url: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  structured_filters?: Record<string, any>;
}

export interface EssayCritique {
  overall_score: string;
  strengths: string[];
  improvements: string[];
  actionable_edits: string[];
  alignment_summary: string;
}

export interface WeeklyDigest {
  generated_at: string;
  summary: string;
  student_profile: StudentProfile;
  urgent_deadlines: Array<Opportunity & { days_remaining: number }>;
  top_recommendations: Array<Opportunity & { days_remaining: number }>;
  total_matches: number;
}
