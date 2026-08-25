import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from database import engine, Base, get_db
from models import Opportunity, StudentProfile, ApplicationTrack
from schemas import (
    OpportunityResponse, OpportunityCreate,
    StudentProfileSchema,
    ApplicationTrackCreate, ApplicationTrackUpdate, ApplicationTrackResponse,
    ChatRequest, ChatResponse,
    EssayCritiqueRequest, EssayCritiqueResponse
)
from seed_data import get_seed_opportunities
from vector_store import index_opportunities
from rag_chain import run_hybrid_rag_pipeline
from resume_parser import extract_text_from_pdf, parse_resume_to_profile
from essay_critique import critique_scholarship_essay
from digest_generator import generate_weekly_digest

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudentPath API",
    description="RAG Chatbot and Opportunity Matching Engine API for Internships & Scholarships",
    version="1.0.0"
)

# CORS Middleware setup for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Seed initial opportunities and student profile on server startup if database is fresh."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Seed opportunities if empty
        opp_count = db.query(Opportunity).count()
        if opp_count == 0:
            print("[Startup] Seeding database with 50+ opportunities...")
            seed_data = get_seed_opportunities()
            new_opps = []
            for item in seed_data:
                opp = Opportunity(
                    title=item["title"],
                    org=item["org"],
                    type=item["type"],
                    deadline=item["deadline"],
                    min_gpa=item["min_gpa"],
                    citizenship_req=item["citizenship_req"],
                    location_type=item["location_type"],
                    location=item["location"],
                    amount_stipend=item["amount_stipend"],
                    description=item["description"],
                    application_url=item["application_url"]
                )
                opp.majors = item["majors"]
                opp.class_years = item["class_years"]
                opp.tags = item["tags"]
                new_opps.append(opp)
            
            db.add_all(new_opps)
            db.commit()

            # Re-query all to get generated IDs
            all_opps = db.query(Opportunity).all()
            index_opportunities(all_opps)
            print(f"[Startup] Successfully seeded {len(all_opps)} opportunities and indexed into ChromaDB.")
        else:
            print(f"[Startup] Database already contains {opp_count} opportunities.")
            all_opps = db.query(Opportunity).all()
            index_opportunities(all_opps)

        # 2. Seed default student profile if empty
        profile_count = db.query(StudentProfile).count()
        if profile_count == 0:
            print("[Startup] Seeding default student profile...")
            default_profile = StudentProfile(
                id=1,
                name="Alex Taylor",
                major="Computer Science",
                class_year="Junior",
                gpa=3.6,
                citizenship="US Citizen",
                location_preference="remote",
                skills_json='["Python", "React", "Data Structures", "SQL", "Git"]',
                interests_json='["Artificial Intelligence", "Machine Learning", "Web Development"]',
                resume_text="Alex Taylor. Computer Science Junior at State University. GPA: 3.6. Experienced in Python, React, SQL, and Machine Learning."
            )
            db.add(default_profile)
            db.commit()
            print("[Startup] Default student profile seeded.")
    except Exception as e:
        print(f"[Startup] Error during startup initialization: {e}")
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "StudentPath Backend API", "timestamp": datetime.utcnow().isoformat()}


# --- Chat Endpoints ---

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Core RAG Chatbot endpoint enforcing 5-stage Hybrid RAG Pipeline."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
    res = run_hybrid_rag_pipeline(
        message=request.message,
        db_session=db,
        profile=profile,
        use_profile=request.use_profile_context,
        session_id=request.session_id or "default_session"
    )
    return res


# --- Opportunity Endpoints ---

@app.get("/api/opportunities", response_model=List[OpportunityResponse])
def list_opportunities(
    search: Optional[str] = None,
    type: Optional[str] = None,
    major: Optional[str] = None,
    min_gpa: Optional[float] = None,
    location_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    
    if type and type != "all":
        query = query.filter(Opportunity.type == type)
    if location_type and location_type != "all":
        query = query.filter(Opportunity.location_type == location_type)
    if min_gpa is not None:
        query = query.filter(Opportunity.min_gpa <= min_gpa)
    if search:
        s_pattern = f"%{search}%"
        query = query.filter(
            (Opportunity.title.ilike(s_pattern)) |
            (Opportunity.org.ilike(s_pattern)) |
            (Opportunity.description.ilike(s_pattern)) |
            (Opportunity.tags_json.ilike(s_pattern))
        )

    results = query.all()
    
    # Filter major in Python if specified
    if major and major != "all":
        m_lower = major.lower()
        filtered = []
        for opp in results:
            opp_m = [x.lower() for x in opp.majors]
            if "all majors" in opp_m or any(m_lower in x or x in m_lower for x in opp_m):
                filtered.append(opp)
        results = filtered

    return [opp.to_dict() for opp in results]


@app.get("/api/opportunities/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity_detail(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp.to_dict()


@app.post("/api/opportunities", response_model=OpportunityResponse)
def create_opportunity(data: OpportunityCreate, db: Session = Depends(get_db)):
    opp = Opportunity(
        title=data.title,
        org=data.org,
        type=data.type,
        deadline=data.deadline,
        min_gpa=data.min_gpa,
        citizenship_req=data.citizenship_requirement,
        location_type=data.location_type,
        location=data.location,
        amount_stipend=data.amount_or_stipend,
        description=data.description,
        application_url=data.application_url
    )
    opp.majors = data.majors
    opp.class_years = data.class_years
    opp.tags = data.tags

    db.add(opp)
    db.commit()
    db.refresh(opp)

    index_opportunities([opp])
    return opp.to_dict()


# --- Profile Endpoints ---

@app.get("/api/profile", response_model=StudentProfileSchema)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
    if not profile:
        profile = StudentProfile(id=1, name="Alex Student", major="Computer Science", class_year="Junior", gpa=3.5)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile.to_dict()


@app.put("/api/profile", response_model=StudentProfileSchema)
def update_profile(data: StudentProfileSchema, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
    if not profile:
        profile = StudentProfile(id=1)
        db.add(profile)

    profile.name = data.name
    profile.major = data.major
    profile.class_year = data.class_year
    profile.gpa = data.gpa
    profile.citizenship = data.citizenship
    profile.location_preference = data.location_preference
    profile.skills = data.skills
    profile.interests = data.interests
    if data.resume_text is not None:
        profile.resume_text = data.resume_text

    db.commit()
    db.refresh(profile)
    return profile.to_dict()


@app.post("/api/profile/upload-resume", response_model=StudentProfileSchema)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save temp PDF
    temp_dir = "./temp_resumes"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)

    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        raw_text = extract_text_from_pdf(temp_file_path)
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        parsed_data = parse_resume_to_profile(raw_text)

        profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
        if not profile:
            profile = StudentProfile(id=1)
            db.add(profile)

        profile.name = parsed_data.get("name", profile.name)
        profile.major = parsed_data.get("major", profile.major)
        profile.class_year = parsed_data.get("class_year", profile.class_year)
        profile.gpa = parsed_data.get("gpa", profile.gpa)
        profile.citizenship = parsed_data.get("citizenship", profile.citizenship)
        profile.location_preference = parsed_data.get("location_preference", profile.location_preference)
        profile.skills = parsed_data.get("skills", profile.skills)
        profile.interests = parsed_data.get("interests", profile.interests)
        profile.resume_text = raw_text

        db.commit()
        db.refresh(profile)
        return profile.to_dict()
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


# --- Application Tracking Endpoints ---

@app.get("/api/applications", response_model=List[ApplicationTrackResponse])
def get_applications(db: Session = Depends(get_db)):
    tracks = db.query(ApplicationTrack).filter(ApplicationTrack.student_id == 1).all()
    return [t.to_dict() for t in tracks]


@app.post("/api/applications", response_model=ApplicationTrackResponse)
def track_application(data: ApplicationTrackCreate, db: Session = Depends(get_db)):
    existing = db.query(ApplicationTrack).filter(
        ApplicationTrack.student_id == 1,
        ApplicationTrack.opportunity_id == data.opportunity_id
    ).first()

    if existing:
        existing.status = data.status
        if data.notes:
            existing.notes = data.notes
        if data.applied_date:
            existing.applied_date = data.applied_date
        existing.updated_at = datetime.utcnow().isoformat()
        db.commit()
        db.refresh(existing)
        return existing.to_dict()

    new_track = ApplicationTrack(
        student_id=1,
        opportunity_id=data.opportunity_id,
        status=data.status,
        notes=data.notes or "",
        applied_date=data.applied_date or datetime.utcnow().strftime("%Y-%m-%d")
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)
    return new_track.to_dict()


@app.put("/api/applications/{application_id}", response_model=ApplicationTrackResponse)
def update_application_status(application_id: int, data: ApplicationTrackUpdate, db: Session = Depends(get_db)):
    track = db.query(ApplicationTrack).filter(ApplicationTrack.id == application_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Application track record not found")

    if data.status:
        track.status = data.status
    if data.notes is not None:
        track.notes = data.notes
    if data.applied_date is not None:
        track.applied_date = data.applied_date
    track.updated_at = datetime.utcnow().isoformat()

    db.commit()
    db.refresh(track)
    return track.to_dict()


@app.delete("/api/applications/{application_id}")
def delete_application_track(application_id: int, db: Session = Depends(get_db)):
    track = db.query(ApplicationTrack).filter(ApplicationTrack.id == application_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Application track record not found")
    db.delete(track)
    db.commit()
    return {"status": "deleted", "id": application_id}


# --- Essay Critique & Weekly Digest Endpoints ---

@app.post("/api/essay-critique", response_model=EssayCritiqueResponse)
def essay_critique_endpoint(request: EssayCritiqueRequest, db: Session = Depends(get_db)):
    scholarship_title = None
    if request.scholarship_id:
        opp = db.query(Opportunity).filter(Opportunity.id == request.scholarship_id).first()
        if opp:
            scholarship_title = opp.title

    result = critique_scholarship_essay(
        essay_text=request.essay_text,
        scholarship_title=scholarship_title,
        prompt_criteria=request.prompt_criteria
    )
    return result


@app.get("/api/digest")
def weekly_digest_endpoint(db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.id == 1).first()
    if not profile:
        profile = StudentProfile(id=1, name="Alex Student", major="Computer Science", gpa=3.5)
    return generate_weekly_digest(db, profile)
