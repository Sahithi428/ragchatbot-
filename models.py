import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    org = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # internship | scholarship
    deadline = Column(String(50), nullable=False, index=True)  # YYYY-MM-DD
    min_gpa = Column(Float, default=0.0, index=True)
    majors_json = Column(Text, default="[]")  # JSON list of majors
    class_years_json = Column(Text, default="[]")  # JSON list of class years
    citizenship_req = Column(String(100), default="Any")
    location_type = Column(String(50), default="remote", index=True)  # remote | onsite | hybrid
    location = Column(String(255), default="Remote")
    amount_stipend = Column(String(255), default="Unpaid")
    description = Column(Text, nullable=False)
    application_url = Column(String(500), nullable=False)
    tags_json = Column(Text, default="[]")  # JSON list of tags
    date_added = Column(String(50), default=datetime.utcnow().isoformat)

    @property
    def majors(self):
        try:
            return json.loads(self.majors_json) if self.majors_json else []
        except Exception:
            return []

    @majors.setter
    def majors(self, value):
        self.majors_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def class_years(self):
        try:
            return json.loads(self.class_years_json) if self.class_years_json else []
        except Exception:
            return []

    @class_years.setter
    def class_years(self, value):
        self.class_years_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    @tags.setter
    def tags(self, value):
        self.tags_json = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "org": self.org,
            "type": self.type,
            "deadline": self.deadline,
            "eligibility": {
                "min_gpa": self.min_gpa,
                "majors": self.majors,
                "class_years": self.class_years,
                "citizenship_requirement": self.citizenship_req,
                "location_type": self.location_type,
                "location": self.location
            },
            "min_gpa": self.min_gpa,
            "majors": self.majors,
            "class_years": self.class_years,
            "citizenship_requirement": self.citizenship_req,
            "location_type": self.location_type,
            "location": self.location,
            "amount_or_stipend": self.amount_stipend,
            "description": self.description,
            "application_url": self.application_url,
            "tags": self.tags,
            "date_added": self.date_added
        }


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="Student")
    major = Column(String(255), default="Computer Science")
    class_year = Column(String(100), default="Junior")
    gpa = Column(Float, default=3.5)
    citizenship = Column(String(100), default="US Citizen")
    location_preference = Column(String(50), default="any")  # remote, onsite, hybrid, any
    skills_json = Column(Text, default="[]")
    interests_json = Column(Text, default="[]")
    resume_text = Column(Text, default="")

    @property
    def skills(self):
        try:
            return json.loads(self.skills_json) if self.skills_json else []
        except Exception:
            return []

    @skills.setter
    def skills(self, value):
        self.skills_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def interests(self):
        try:
            return json.loads(self.interests_json) if self.interests_json else []
        except Exception:
            return []

    @interests.setter
    def interests(self, value):
        self.interests_json = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "major": self.major,
            "class_year": self.class_year,
            "gpa": self.gpa,
            "citizenship": self.citizenship,
            "location_preference": self.location_preference,
            "skills": self.skills,
            "interests": self.interests,
            "resume_text": self.resume_text
        }


class ApplicationTrack(Base):
    __tablename__ = "application_tracks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), default=1)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String(50), default="saved")  # saved, applied, interviewing, rejected, accepted
    notes = Column(Text, default="")
    applied_date = Column(String(50), default="")
    updated_at = Column(String(50), default=datetime.utcnow().isoformat)

    opportunity = relationship("Opportunity")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "opportunity_id": self.opportunity_id,
            "status": self.status,
            "notes": self.notes,
            "applied_date": self.applied_date,
            "updated_at": self.updated_at,
            "opportunity": self.opportunity.to_dict() if self.opportunity else None
        }
