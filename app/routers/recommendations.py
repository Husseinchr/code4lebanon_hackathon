from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query, Request

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total": 3,
    "summary": {
        "total": 3,
        "high": 1,
        "medium": 1,
        "low": 1,
        "by_category": {
            "geographic_gap": 1,
            "skill_gap": 1,
            "track_demand": 1,
        },
    },
    "recommendations": [
        {
            "id": "geo_absent_nabatieh",
            "category": "geographic_gap",
            "priority": "high",
            "region": "Nabatieh",
            "insight": "Nabatieh has zero registrations — completely unrepresented.",
            "recommendation": (
                "Launch a targeted outreach campaign in Nabatieh immediately. "
                "Partner with University networks — they are the top-performing channel nationally. "
                "Consider deploying a local coordinator or community workshop."
            ),
            "metric": {"region": "Nabatieh", "registrations": 0, "percentage": 0.0},
        },
        {
            "id": "skill_gap_ai_programming",
            "category": "skill_gap",
            "priority": "high",
            "skill": "AI Programming",
            "insight": "76.2% of learners report Basic or no AI Programming skills.",
            "recommendation": (
                "Prioritize foundational AI Programming content in the program. "
                "The 'AI Academy (Microsoft)' track directly addresses this gap."
            ),
            "metric": {
                "skill": "AI Programming",
                "basic_count": 9,
                "none_count": 7,
                "low_skill_percentage": 76.2,
            },
        },
        {
            "id": "track_top_performer",
            "category": "track_demand",
            "priority": "low",
            "track": "lebanon_coding",
            "insight": "'Lebanon Coding' is the most demanded track with 5 registrations.",
            "recommendation": (
                "Double down on 'Lebanon Coding' — it has the strongest demand. "
                "Ensure sufficient capacity and use it as a flagship track."
            ),
            "metric": {
                "track": "Lebanon Coding",
                "registrations": 5,
                "percentage": 22.7,
            },
        },
    ],
}


@router.get("/recommendations")
async def get_recommendations(
    request: Request,
    priority:  Optional[str] = Query(None, description="Filter by priority: high, medium, low"),
    category:  Optional[str] = Query(None, description="Filter by category: geographic_gap, channel_gap, skill_gap, track_demand, program_design"),
    region:    Optional[str] = Query(None, description="Filter by specific region"),
) -> dict:
    try:
        aggs = getattr(request.app.state, "aggregations", {})
        data = aggs.get("recommendations") or _STUB

        recs = data.get("recommendations", [])

        # Apply optional filters
        if priority:
            recs = [r for r in recs if r.get("priority") == priority.lower()]
        if category:
            recs = [r for r in recs if r.get("category") == category.lower()]
        if region:
            recs = [r for r in recs if r.get("region", "").lower() == region.lower()]

        return {
            "total": len(recs),
            "summary": data.get("summary", {}),
            "filters_applied": {
                "priority": priority,
                "category": category,
                "region": region,
            },
            "recommendations": recs,
        }

    except Exception as exc:
        logger.error("[recommendations] Error: %s", exc)
        return _STUB