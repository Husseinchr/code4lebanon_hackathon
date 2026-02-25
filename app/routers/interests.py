from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query, Request

from app.models.schemas import InterestsResponse
from app.services.data_processor import compute_interests

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "by_track": [
        {"track": "lebanon_coding",              "label": "Lebanon Coding",                 "count": 5, "percentage": 22.7},
        {"track": "digital_literacy",            "label": "Digital Literacy & Inclusion",   "count": 5, "percentage": 22.7},
        {"track": "microsoft_ai_academy",        "label": "AI Academy, by Microsoft",       "count": 5, "percentage": 22.7},
        {"track": "oracle_technical_leadership", "label": "Technical Leadership, by Oracle", "count": 4, "percentage": 18.2},
        {"track": "national_cybersecurity",      "label": "National Cybersecurity",          "count": 3, "percentage": 13.6},
    ],
    "motivations": [
        {"motivation": "career_growth",  "label": "Career growth",     "count": 18, "percentage": 81.8},
        {"motivation": "business",       "label": "Business needs",    "count": 11, "percentage": 50.0},
        {"motivation": "personal",       "label": "Personal interest", "count": 10, "percentage": 45.5},
        {"motivation": "job_transition", "label": "Job transition",    "count": 4,  "percentage": 18.2},
    ],
    "ai_goals": [
        {"goal": "career",       "label": "Learn AI for career growth",               "count": 11, "percentage": 50.0},
        {"goal": "productivity", "label": "Improve productivity at work",             "count": 10, "percentage": 45.5},
        {"goal": "build_tools",  "label": "Build AI tools or applications",           "count": 10, "percentage": 45.5},
        {"goal": "strategy",     "label": "Understand AI strategy & impact",          "count": 9,  "percentage": 40.9},
        {"goal": "business_ai",  "label": "Apply AI in my business or organization",  "count": 7,  "percentage": 31.8},
        {"goal": "explore",      "label": "Just exploring / curious",                "count": 5,  "percentage": 22.7},
    ],
    "skill_gaps": {
        "digital_literacy": {"Advanced": 5, "Intermediate": 8, "Basic": 7, "None": 2},
        "cybersecurity":    {"Advanced": 4, "Intermediate": 7, "Basic": 9, "None": 2},
        "ai_programming":   {"Advanced": 1, "Intermediate": 5, "Basic": 9, "None": 7},
        "data_skills":      {"Advanced": 5, "Intermediate": 8, "Basic": 7, "None": 2},
    },
    "age_distribution": {
        "under_18": 0, "18_24": 6, "25_34": 8,
        "35_44": 4, "45_54": 3, "55_plus": 1,
    },
    "employment_status": {
        "student": 5, "full_time": 9, "part_time": 2,
        "freelancer": 2, "entrepreneur": 1, "not_working": 1,
    },
}


@router.get("/interests", response_model=InterestsResponse)
async def get_interests(
    request: Request,
    channel: Optional[str] = Query(None),
    region:  Optional[str] = Query(None),
) -> InterestsResponse:
    try:
        df = getattr(request.app.state, "df", None)
        if df is not None and not df.empty:
            data = compute_interests(df, channel_filter=channel, region_filter=region)
        else:
            data = _STUB
        return InterestsResponse(**data)
    except Exception as exc:
        logger.error("[interests] Falling back to stub: %s", exc)
        return InterestsResponse(**_STUB)
