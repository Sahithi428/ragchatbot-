import os
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


def critique_scholarship_essay(essay_text: str, scholarship_title: Optional[str] = None, prompt_criteria: Optional[str] = "") -> Dict[str, Any]:
    """
    Evaluates a scholarship essay draft against prompt criteria, surfacing score, strengths,
    areas for improvement, actionable edits, and alignment summary.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    context_desc = f"For Scholarship: {scholarship_title or 'General Scholarship'}\nPrompt/Criteria: {prompt_criteria or 'Demonstrate academic excellence, leadership, financial need, and future community impact.'}"

    if anthropic_key and anthropic_key.strip():
        try:
            from langchain_anthropic import ChatAnthropic
            from langchain_core.messages import SystemMessage, HumanMessage

            chat = ChatAnthropic(model_name="claude-3-5-sonnet-20240620", anthropic_api_key=anthropic_key, temperature=0.3)
            system = "You are a senior scholarship selection committee reviewer and academic writing mentor."
            user_msg = (
                f"{context_desc}\n\n"
                f"Essay Draft:\n{essay_text}\n\n"
                "Provide a detailed evaluation in valid JSON with keys:\n"
                '{"overall_score": "8.5/10", "strengths": ["list"], "improvements": ["list"], "actionable_edits": ["list"], "alignment_summary": "string"}'
            )
            res = chat.invoke([SystemMessage(content=system), HumanMessage(content=user_msg)])
            json_str = res.content.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            return json.loads(json_str)
        except Exception as e:
            print(f"[EssayCritique] Anthropic critique warning: {e}. Falling back to rule-based critique.")

    # Rule-based critique fallback engine
    words = essay_text.split()
    word_count = len(words)
    
    strengths = []
    improvements = []
    edits = []

    if word_count > 250:
        strengths.append(f"Strong length ({word_count} words) with thorough elaboration on personal background.")
    else:
        improvements.append(f"Essay length is short ({word_count} words). Aim for 300-500 words to fully develop your thesis.")

    has_leadership = any(w in essay_text.lower() for w in ["lead", "led", "president", "captain", "founded", "organized", "initiative"])
    if has_leadership:
        strengths.append("Effective concrete examples of leadership and initiative.")
    else:
        improvements.append("Incorporate specific examples of leadership or initiative in your campus or local community.")

    has_impact = any(w in essay_text.lower() for w in ["impact", "achieved", "resulted", "built", "created", "gpa", "awarded"])
    if has_impact:
        strengths.append("Includes tangible outcomes and personal accomplishments.")
    else:
        improvements.append("Quantify your achievements (e.g., project metrics, team sizes, GPA milestones).")

    edits.append("Opening Hook: Make your first sentence more compelling by starting with a specific moment of challenge or growth.")
    edits.append("Criteria Alignment: Explicitly connect your career vision back to the mission of the scholarship provider.")
    edits.append("Concluding Call: End with a clear summary of how winning this award directly enables your upcoming academic milestones.")

    score = "8.2 / 10" if (has_leadership and word_count >= 200) else "7.5 / 10"

    return {
        "overall_score": score,
        "strengths": strengths if strengths else ["Clear structure and readable voice."],
        "improvements": improvements if improvements else ["Refine transitional sentences between paragraphs."],
        "actionable_edits": edits,
        "alignment_summary": f"Your essay demonstrates solid potential for {scholarship_title or 'scholarship applications'}. Focus on quantifying your leadership impact and strengthening the opening hook."
    }
