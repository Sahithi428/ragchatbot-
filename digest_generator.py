from datetime import datetime, timedelta
from typing import Dict, Any, List
from models import Opportunity, StudentProfile


def generate_weekly_digest(db_session, profile: StudentProfile) -> Dict[str, Any]:
    """
    Generate a personalized weekly digest matching the student's saved profile
    against new listings and upcoming urgent deadlines.
    """
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")

    # Get all active opportunities
    opportunities = db_session.query(Opportunity).filter(Opportunity.deadline >= today_str).all()

    urgent_matches: List[Dict[str, Any]] = []
    recommended_matches: List[Dict[str, Any]] = []

    for opp in opportunities:
        # Check eligibility against profile
        if profile.gpa and profile.gpa < opp.min_gpa:
            continue

        # Major check
        if profile.major:
            prof_m = profile.major.lower()
            opp_m = [m.lower() for m in opp.majors]
            if "all majors" not in opp_m and not any(prof_m in m or m in prof_m for m in opp_m):
                if not any(("cs" in prof_m or "computer" in prof_m) and ("cs" in m or "computer" in m) for m in opp_m):
                    continue

        d_date = datetime.strptime(opp.deadline, "%Y-%m-%d")
        days_left = (d_date - today).days

        opp_dict = opp.to_dict()
        opp_dict["days_remaining"] = max(0, days_left)

        if days_left <= 10:
            urgent_matches.append(opp_dict)
        else:
            recommended_matches.append(opp_dict)

    # Sort urgent by days left ascending, recommended by date added descending
    urgent_matches.sort(key=lambda x: x["days_remaining"])
    recommended_matches.sort(key=lambda x: x["id"], reverse=True)

    summary_text = (
        f"Hi {profile.name}! Here is your Weekly StudentPath Digest. "
        f"We found {len(urgent_matches)} urgent opportunities closing soon and "
        f"{len(recommended_matches)} new matches tailored to your {profile.major} major ({profile.class_year}, GPA: {profile.gpa})."
    )

    return {
        "generated_at": today.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": summary_text,
        "student_profile": profile.to_dict(),
        "urgent_deadlines": urgent_matches[:5],
        "top_recommendations": recommended_matches[:5],
        "total_matches": len(urgent_matches) + len(recommended_matches)
    }
