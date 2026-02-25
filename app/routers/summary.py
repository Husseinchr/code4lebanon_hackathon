from __future__ import annotations

import logging

from fastapi import APIRouter, Request

from app.models.schemas import SummaryResponse

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total_registrations": 22,
    "completed_registrations": 22,
    "completion_rate": 1.0,
    "active_surveys": 1,
    "last_updated": "2026-02-25T09:12:45+00:00",
    "by_channel": {
        "university": 7, "employer": 5, "ngo": 5, "public_sector": 3, "other": 2
    },
    "by_track": {
        "lebanon_coding": 5, "microsoft_ai_academy": 5,
        "oracle_technical_leadership": 4, "digital_literacy": 5,
        "national_cybersecurity": 3,
    },
    "by_region": {
        "Beirut": 9, "Mount Lebanon": 6, "North Lebanon": 4,
        "South Lebanon": 2, "Bekaa": 1,
    },
    "regions_covered": 5,
    "top_track": "lebanon_coding",
    "top_channel": "university",
    "skills_distribution": {
        "digital_literacy": {"Advanced": 5, "Intermediate": 8, "Basic": 7, "None": 2},
        "cybersecurity":    {"Advanced": 4, "Intermediate": 7, "Basic": 9, "None": 2},
        "ai_programming":   {"Advanced": 1, "Intermediate": 5, "Basic": 9, "None": 7},
        "data_skills":      {"Advanced": 5, "Intermediate": 8, "Basic": 7, "None": 2},
    },
}


@router.get("/summary", response_model=SummaryResponse)
async def get_summary(request: Request) -> SummaryResponse:
    try:
        aggs = getattr(request.app.state, "aggregations", {})
        data = aggs.get("summary") or _STUB
        return SummaryResponse(**data)
    except Exception as exc:
        logger.error("[summary] Falling back to stub: %s", exc)
        return SummaryResponse(**_STUB)
