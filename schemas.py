from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EligibilitySchema(BaseModel):
    min_gpa: float = 0.0
    majors: List[str] = []
    class_years: List[str] = []
    citizenship_requirement: str = "Any"
    location_type: str = "remote"
    location: str = "Remote"


class OpportunityBase(BaseModel):
    title: str
    org: str
    type: str  # internship | scholarship
    deadline: str
    min_gpa: float = 0.0
    majors: List[str] = []
    class_years: List[str] = []
    citizenship_requirement: str = "Any"
    location_type: str = "remote"
    location: str = "Remote"
    amount_or_stipend: str = "Unpaid"
    description: str
    application_url: str
    tags: List[str] = []


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityResponse(OpportunityBase):
    id: int
    date_added: str
    eligibility: Optional[EligibilitySchema] = None

    class Config:
        from_attributes = True


class StudentProfileSchema(BaseModel):
    id: Optional[int] = 1
    name: str = "Student"
    major: str = "Computer Science"
    class_year: str = "Junior"
    gpa: float = 3.5
    citizenship: str = "US Citizen"
    location_preference: str = "any"
    skills: List[str] = []
    interests: List[str] = []
    resume_text: Optional[str] = ""

    class Config:
        from_attributes = True


class ApplicationTrackCreate(BaseModel):
    opportunity_id: int
    status: str = "saved"  # saved, applied, interviewing, rejected, accepted
    notes: Optional[str] = ""
    applied_date: Optional[str] = ""


class ApplicationTrackUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[str] = None


class ApplicationTrackResponse(BaseModel):
    id: int
    student_id: int
    opportunity_id: int
    status: str
    notes: str
    applied_date: str
    updated_at: str
    opportunity: Optional[OpportunityResponse] = None

    class Config:
        from_attributes = True


class CitationSchema(BaseModel):
    id: int
    title: str
    org: str
    type: str
    deadline: str
    min_gpa: float
    amount_or_stipend: str
    application_url: str
    location_type: str
    location: str


class ChatRequest(BaseModel):
    message: str
    use_profile_context: bool = True
    session_id: Optional[str] = "default_session"


class ChatResponse(BaseModel):
    answer: str
    citations: List[CitationSchema] = []
    structured_filters_applied: Dict[str, Any] = {}
    total_candidates_found: int = 0


class EssayCritiqueRequest(BaseModel):
    essay_text: str
    scholarship_id: Optional[int] = None
    prompt_criteria: Optional[str] = ""


class EssayCritiqueResponse(BaseModel):
    overall_score: str
    strengths: List[str]
    improvements: List[str]
    actionable_edits: List[str]
    alignment_summary: str
