import os
import re
import json
from typing import Dict, Any
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()


def extract_text_from_pdf(pdf_file_path: str) -> str:
    """Extract raw plain text from a PDF document."""
    try:
        reader = PdfReader(pdf_file_path)
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text)
    except Exception as e:
        print(f"[ResumeParser] Error reading PDF file: {e}")
        return ""


def parse_resume_to_profile(resume_text: str) -> Dict[str, Any]:
    """
    Parse raw resume text into structured Student Profile attributes.
    Uses LLM if ANTHROPIC_API_KEY is available, or smart regex heuristics fallback.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    if anthropic_key and anthropic_key.strip():
        try:
            from langchain_anthropic import ChatAnthropic
            from langchain_core.messages import SystemMessage, HumanMessage

            chat = ChatAnthropic(model_name="claude-3-5-sonnet-20240620", anthropic_api_key=anthropic_key, temperature=0.1)
            prompt = (
                "Extract structured student profile JSON from the following resume text:\n\n"
                f"{resume_text[:4000]}\n\n"
                "Return ONLY a valid JSON object matching this schema:\n"
                "{\n"
                '  "name": "string",\n'
                '  "major": "string",\n'
                '  "gpa": float,\n'
                '  "class_year": "Freshman|Sophomore|Junior|Senior|Graduate",\n'
                '  "citizenship": "US Citizen|Permanent Resident|Any|International",\n'
                '  "location_preference": "remote|onsite|hybrid|any",\n'
                '  "skills": ["string"],\n'
                '  "interests": ["string"]\n'
                "}"
            )
            res = chat.invoke([HumanMessage(content=prompt)])
            json_str = res.content.strip()
            # Extract JSON block
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()

            parsed = json.loads(json_str)
            parsed["resume_text"] = resume_text
            return parsed
        except Exception as e:
            print(f"[ResumeParser] Anthropic parsing warning: {e}. Utilizing regex parser.")

    # Smart Heuristics Fallback Parser
    text_lower = resume_text.lower()

    # Extract GPA
    gpa_val = 3.5
    gpa_match = re.search(r'(?:gpa|grade point average)[:\s]*([0-3]\.\d{1,2}|4\.0)', text_lower)
    if gpa_match:
        try:
            gpa_val = float(gpa_match.group(1))
        except ValueError:
            pass

    # Extract Major
    major_val = "Computer Science"
    if "data science" in text_lower:
        major_val = "Data Science"
    elif "computer engineering" in text_lower:
        major_val = "Computer Engineering"
    elif "electrical engineering" in text_lower:
        major_val = "Electrical Engineering"
    elif "mechanical engineering" in text_lower:
        major_val = "Mechanical Engineering"
    elif "bioinformatics" in text_lower:
        major_val = "Bioinformatics"
    elif "finance" in text_lower or "economics" in text_lower:
        major_val = "Finance"
    elif "cybersecurity" in text_lower:
        major_val = "Cybersecurity"

    # Extract Class Year
    class_year_val = "Junior"
    for yr in ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]:
        if yr.lower() in text_lower:
            class_year_val = yr
            break

    # Extract Skills
    common_skills = ["Python", "Java", "C++", "React", "TypeScript", "SQL", "Git", "PyTorch", "Node.js", "Docker", "AWS", "Linux", "Tailwind CSS", "Data Analysis", "Machine Learning"]
    found_skills = [skill for skill in common_skills if skill.lower() in text_lower]
    if not found_skills:
        found_skills = ["Python", "SQL", "Git", "Problem Solving"]

    # Extract Name (First line heuristic)
    lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
    name_val = lines[0] if lines and len(lines[0]) < 40 and not any(c in lines[0] for c in ['@', 'http', ':']) else "Alex Student"

    return {
        "name": name_val,
        "major": major_val,
        "gpa": gpa_val,
        "class_year": class_year_val,
        "citizenship": "US Citizen" if "citizen" in text_lower else "Any",
        "location_preference": "remote" if "remote" in text_lower else "any",
        "skills": found_skills,
        "interests": ["Artificial Intelligence", "Software Engineering", "Career Development"],
        "resume_text": resume_text
    }
