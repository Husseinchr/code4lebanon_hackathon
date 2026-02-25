from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Query, Request

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total_learners": 22,
    "cohorts": [
        {
            "id":               "career_climbers",
            "name":             "Career Climbers",
            "count":            9,
            "percentage":       40.9,
            "profile":          "Full-time employed or entrepreneurs, aged 25–44, motivated by career growth and business outcomes.",
            "top_track":        "Technical Leadership (Oracle)",
            "top_channel":      "employer",
            "avg_skill_level":  "Intermediate",
            "primary_motivation": "career_growth",
            "recommendation":   "Offer evening and weekend scheduling. Focus on certification pathways. Create employer referral pipelines post-completion.",
            "content_advice":   "Project-based, leadership-focused, real business case studies.",
            "regions":          {"Beirut": 4, "Mount Lebanon": 3, "North Lebanon": 2},
        },
        {
            "id":               "digital_newcomers",
            "name":             "Digital Newcomers",
            "count":            6,
            "percentage":       27.3,
            "profile":          "Older learners (45+), public sector employees, not working. Low to zero digital skills.",
            "top_track":        "Digital Literacy & Inclusion",
            "top_channel":      "public_sector",
            "avg_skill_level":  "Basic",
            "primary_motivation": "personal",
            "recommendation":   "Self-paced modules with flexible deadlines. Extra support resources and simplified UX.",
            "content_advice":   "Step-by-step, visual-first, real-life examples. No jargon.",
            "regions":          {"Beirut": 3, "Bekaa": 2, "South Lebanon": 1},
        },
        {
            "id":               "future_builders",
            "name":             "Future Builders",
            "count":            7,
            "percentage":       31.8,
            "profile":          "Students and young freelancers aged 18–24. AI-curious, motivated by career growth and job transition.",
            "top_track":        "Lebanon Coding",
            "top_channel":      "university",
            "avg_skill_level":  "Basic",
            "primary_motivation": "career_growth",
            "recommendation":   "Project-based learning with portfolio outcomes. Create internship and job placement pathways.",
            "content_advice":   "Hands-on, fast-paced, collaborative. Lebanon Coding and AI Academy are ideal.",
            "regions":          {"Beirut": 3, "Mount Lebanon": 2, "North Lebanon": 2},
        },
    ],
}


@router.get("/cohort-profile")
async def get_cohort_profile(
    request: Request,
    cohort:  Optional[str] = Query(None, description="Filter by cohort id: career_climbers, digital_newcomers, future_builders"),
) -> dict:
    try:
        aggs = getattr(request.app.state, "aggregations", {})
        data = aggs.get("cohort_profile") or _STUB

        if cohort:
            filtered = [c for c in data.get("cohorts", []) if c.get("id") == cohort.lower()]
            return {
                "total_learners": data.get("total_learners", 0),
                "filters_applied": {"cohort": cohort},
                "cohorts": filtered,
            }
        return data

    except Exception as exc:
        logger.error("[cohort_profile] Error: %s", exc)
        return _STUB