import os
import re
import json
from datetime import datetime
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

from models import Opportunity, StudentProfile
from vector_store import vector_search

load_dotenv()

# Session memory cache for multi-turn conversations
_session_memories: Dict[str, Dict[str, Any]] = {}


def parse_query_structured(message: str, profile: StudentProfile = None, use_profile: bool = True) -> Dict[str, Any]:
    """
    Extract structured filter parameters from user query & profile.
    """
    msg_lower = message.lower()
    filters = {
        "type": None,  # internship | scholarship | None
        "major": None,
        "max_gpa_req": None,  # student's gpa or query gpa
        "class_year": None,
        "location_type": None,  # remote | onsite | hybrid
        "citizenship": None,
        "urgent_only": False,
        "residual_query": message
    }

    # 1. Type extraction
    if "scholarship" in msg_lower or "grant" in msg_lower or "award" in msg_lower or "funding" in msg_lower:
        if "intern" not in msg_lower:
            filters["type"] = "scholarship"
    elif "intern" in msg_lower or "co-op" in msg_lower or "job" in msg_lower:
        filters["type"] = "internship"

    # 2. Location type extraction
    if "remote" in msg_lower or "work from home" in msg_lower or "virtual" in msg_lower:
        filters["location_type"] = "remote"
    elif "onsite" in msg_lower or "in-person" in msg_lower or "on-site" in msg_lower:
        filters["location_type"] = "onsite"
    elif "hybrid" in msg_lower:
        filters["location_type"] = "hybrid"

    # 3. Class year extraction
    for yr in ["freshman", "sophomore", "junior", "senior", "graduate"]:
        if yr in msg_lower:
            filters["class_year"] = yr.capitalize()
            break

    # 4. GPA extraction from message (e.g., "3.5 GPA", "GPA of 3.8", "3.0+")
    gpa_match = re.search(r'(\d\.\d)\s*(?:gpa|\+)?', msg_lower)
    if gpa_match:
        try:
            filters["max_gpa_req"] = float(gpa_match.group(1))
        except ValueError:
            pass

    # 5. Major extraction
    major_keywords = {
        "computer science": "Computer Science",
        "cs": "Computer Science",
        "data science": "Data Science",
        "machine learning": "Data Science",
        "ai": "Artificial Intelligence",
        "engineering": "Engineering",
        "bio": "Bioinformatics",
        "biology": "Biology",
        "finance": "Finance",
        "economics": "Economics",
        "design": "Design",
        "ux": "Design",
        "ui": "Design",
        "cybersecurity": "Cybersecurity",
        "business": "Business Administration"
    }
    for kw, val in major_keywords.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', msg_lower):
            filters["major"] = val
            break

    # 6. Apply profile defaults if enabled and not explicitly overridden in message
    if use_profile and profile:
        if not filters["major"] and profile.major:
            filters["major"] = profile.major
        if filters["max_gpa_req"] is None and profile.gpa is not None:
            filters["max_gpa_req"] = profile.gpa
        if not filters["class_year"] and profile.class_year:
            filters["class_year"] = profile.class_year
        if not filters["citizenship"] and profile.citizenship:
            filters["citizenship"] = profile.citizenship
        if not filters["location_type"] and profile.location_preference and profile.location_preference != "any":
            filters["location_type"] = profile.location_preference

    return filters


def apply_sql_filters(db_session, filters: Dict[str, Any]) -> List[Opportunity]:
    """
    Step 2: Hard SQL filtering on database candidates.
    Ensures deadline not passed, GPA floor satisfied, citizenship match, location match.
    """
    today_str = datetime.now().strftime("%Y-%m-%d")
    query = db_session.query(Opportunity).filter(Opportunity.deadline >= today_str)

    if filters.get("type"):
        query = query.filter(Opportunity.type == filters["type"])

    if filters.get("location_type"):
        query = query.filter(Opportunity.location_type == filters["location_type"])

    all_opportunities = query.all()
    filtered = []

    for opp in all_opportunities:
        # Check GPA requirement: Student GPA must be >= opportunity min_gpa
        if filters.get("max_gpa_req") is not None:
            if filters["max_gpa_req"] < opp.min_gpa:
                continue

        # Check Major requirement
        if filters.get("major"):
            target_m = filters["major"].lower()
            opp_majors = [m.lower() for m in opp.majors]
            if "all majors" not in opp_majors and not any(target_m in m or m in target_m for m in opp_majors):
                # allow broad match e.g. CS match Computer Science
                if not any(("cs" in target_m or "computer" in target_m) and ("cs" in m or "computer" in m) for m in opp_majors):
                    continue

        # Check Class Year requirement
        if filters.get("class_year"):
            cy = filters["class_year"].capitalize()
            opp_years = [y.capitalize() for y in opp.class_years]
            if opp_years and cy not in opp_years and "All Years" not in opp_years:
                continue

        # Check Citizenship requirement
        if filters.get("citizenship"):
            cit = filters["citizenship"].lower()
            req = opp.citizenship_req.lower()
            if req != "any" and cit not in req and req not in cit:
                if "citizen" in cit and "us citizen" in req:
                    pass
                else:
                    continue

        filtered.append(opp)

    return filtered


def rank_and_score(opportunities: List[Opportunity], vector_scores: Dict[int, float]) -> List[Tuple[Opportunity, float]]:
    """
    Step 4: Re-rank by similarity score + deadline urgency.
    """
    today = datetime.now()
    ranked = []

    for opp in opportunities:
        v_score = vector_scores.get(opp.id, 0.5)
        
        # Calculate deadline urgency score (0 to 1)
        try:
            d_date = datetime.strptime(opp.deadline, "%Y-%m-%d")
            days_left = max(0, (d_date - today).days)
            # urgent (< 7 days) gets bonus
            urgency_score = max(0.0, 1.0 - (days_left / 60.0))
        except Exception:
            urgency_score = 0.5

        # Final hybrid score formula: 60% semantic similarity + 40% urgency/recency
        final_score = (v_score * 0.6) + (urgency_score * 0.4)
        ranked.append((opp, final_score))

    # Sort descending by final score
    ranked.sort(key=lambda x: x[1], reverse=True)
    return ranked


def call_llm_generation(message: str, top_opportunities: List[Opportunity], filters_applied: Dict[str, Any], history: List[Dict[str, str]] = None) -> str:
    """
    Step 5: LLM Generation grounded strictly in retrieved candidate opportunities.
    """
    if not top_opportunities:
        return (
            "No matching opportunities found based on your specified criteria. "
            "Try broadening your search (e.g., expanding major filters, adjusting GPA requirements, or including remote and onsite positions)."
        )

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Format context for prompt
    context_blocks = []
    for idx, opp in enumerate(top_opportunities[:6], 1):
        context_blocks.append(
            f"[{idx}] {opp.title} | Org: {opp.org} | Type: {opp.type.capitalize()}\n"
            f"   - Deadline: {opp.deadline}\n"
            f"   - Min GPA: {opp.min_gpa} | Majors: {', '.join(opp.majors)}\n"
            f"   - Location: {opp.location} ({opp.location_type})\n"
            f"   - Stipend/Amount: {opp.amount_stipend}\n"
            f"   - Description: {opp.description}\n"
            f"   - Application URL: {opp.application_url}\n"
        )
    context_str = "\n".join(context_blocks)

    system_prompt = (
        "You are StudentPath, an expert AI career & scholarship advisor for students.\n"
        "RULES:\n"
        "1. Recommend ONLY from the provided opportunities context below.\n"
        "2. Never hallucinate or invent eligibility facts, stipends, or deadlines not in the metadata.\n"
        "3. Cite each recommended opportunity clearly with its exact title and organization.\n"
        "4. Highlight urgent deadlines (<7 days left) and highlight why each match fits the user.\n"
        "5. Be concise, encouraging, and structured using bullet points."
    )

    user_prompt = f"User Query: {message}\n\nRetrieved Opportunities Context:\n{context_str}"

    if anthropic_key and anthropic_key.strip():
        try:
            from langchain_anthropic import ChatAnthropic
            from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

            chat = ChatAnthropic(model_name="claude-3-5-sonnet-20240620", anthropic_api_key=anthropic_key, temperature=0.2)
            messages = [SystemMessage(content=system_prompt)]
            
            if history:
                for h in history[-4:]:
                    if h.get("role") == "user":
                        messages.append(HumanMessage(content=h["content"]))
                    elif h.get("role") == "assistant":
                        messages.append(AIMessage(content=h["content"]))

            messages.append(HumanMessage(content=user_prompt))
            response = chat.invoke(messages)
            return response.content
        except Exception as e:
            print(f"[RAG Chain] Anthropic API call failed: {e}. Falling back to structured grounded output.")

    # Structured grounded fallback generator
    answer_parts = [f"Here are the top matches found for your query:\n"]
    for idx, opp in enumerate(top_opportunities[:5], 1):
        d_date = datetime.strptime(opp.deadline, "%Y-%m-%d")
        days_left = (d_date - datetime.now()).days
        urgency_tag = " ⚠️ **URGENT - Deadline in <7 days!**" if days_left <= 7 else ""
        
        answer_parts.append(
            f"### {idx}. [{opp.title}]({opp.application_url}){urgency_tag}\n"
            f"**Organization:** {opp.org} | **Type:** {opp.type.capitalize()}\n"
            f"- **Deadline:** {opp.deadline} ({max(0, days_left)} days remaining)\n"
            f"- **Min GPA:** {opp.min_gpa} | **Location:** {opp.location} ({opp.location_type})\n"
            f"- **Stipend/Award:** {opp.amount_stipend}\n"
            f"- **Overview:** {opp.description}\n"
        )

    return "\n".join(answer_parts)


def run_hybrid_rag_pipeline(
    message: str,
    db_session,
    profile: StudentProfile = None,
    use_profile: bool = True,
    session_id: str = "default_session"
) -> Dict[str, Any]:
    """
    Master 5-stage Hybrid RAG Pipeline execution.
    """
    global _session_memories

    # Retrieve multi-turn conversation memory
    session_data = _session_memories.get(session_id, {"history": [], "previous_filters": {}})
    history = session_data.get("history", [])
    prev_filters = session_data.get("previous_filters", {})

    # Stage 1: Query Parser Step
    new_filters = parse_query_structured(message, profile=profile, use_profile=use_profile)
    
    # Merge previous filters if user message is a follow-up (e.g. "what about ones with a stipend?")
    merged_filters = dict(prev_filters)
    for k, v in new_filters.items():
        if v is not None:
            merged_filters[k] = v
    merged_filters["residual_query"] = message

    # Stage 2: Hard Filter Stage (SQL)
    candidates = apply_sql_filters(db_session, merged_filters)
    candidate_ids = [opp.id for opp in candidates]

    # Stage 3: Vector Retrieval Stage (ChromaDB)
    vector_res = []
    vector_scores = {}
    if candidate_ids:
        vector_res = vector_search(query_text=message, candidate_ids=candidate_ids, top_k=15)
        for item in vector_res:
            vector_scores[item["opp_id"]] = item["score"]

    # Stage 4: Re-Rank Stage
    ranked_tuples = rank_and_score(candidates, vector_scores)
    top_ranked = [t[0] for t in ranked_tuples]

    # Stage 5: Generation Stage
    answer = call_llm_generation(message, top_ranked, merged_filters, history=history)

    # Format Citations for UI chips
    citations = []
    for opp in top_ranked[:6]:
        citations.append({
            "id": opp.id,
            "title": opp.title,
            "org": opp.org,
            "type": opp.type,
            "deadline": opp.deadline,
            "min_gpa": opp.min_gpa,
            "amount_or_stipend": opp.amount_stipend,
            "application_url": opp.application_url,
            "location_type": opp.location_type,
            "location": opp.location
        })

    # Update session memory
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": answer})
    _session_memories[session_id] = {
        "history": history[-10:],  # keep last 10 messages
        "previous_filters": merged_filters
    }

    return {
        "answer": answer,
        "citations": citations,
        "structured_filters_applied": {k: v for k, v in merged_filters.items() if v is not None},
        "total_candidates_found": len(candidates)
    }
