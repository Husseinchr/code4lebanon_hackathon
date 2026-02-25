from __future__ import annotations

import logging
from fastapi import APIRouter, Request

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "overall_score": 61,
    "grade":         "C",
    "status":        "Needs Attention Before Launch",
    "top_blocker":   "Geographic Coverage — 3 regions completely absent (Akkar, Nabatieh, Baalbek-Hermel).",
    "dimensions": [
        {
            "name":   "Geographic Coverage",
            "score":  37,
            "weight": 30,
            "weighted_contribution": 11.1,
            "status": "critical",
            "detail": "3 regions have zero registrations. Only 2 of 8 regions above equity threshold.",
            "metric": {"active_regions": 2, "present_regions": 5, "silent_regions": ["Akkar", "Nabatieh", "Baalbek-Hermel"]},
        },
        {
            "name":   "Channel Diversity",
            "score":  72,
            "weight": 20,
            "weighted_contribution": 14.4,
            "status": "warning",
            "detail": "All 5 channels active but public sector at only 13.6%.",
            "metric": {"active_channels": 3, "present_channels": 5},
        },
        {
            "name":   "Track Demand Balance",
            "score":  87,
            "weight": 20,
            "weighted_contribution": 17.4,
            "status": "good",
            "detail": "All 5 tracks receiving registrations with reasonable balance.",
            "metric": {"tracks_active": 5, "lowest_track": "National Cybersecurity", "lowest_count": 3},
        },
        {
            "name":   "Skill Baseline",
            "score":  50,
            "weight": 30,
            "weighted_contribution": 15.0,
            "status": "warning",
            "detail": "2 skill areas have 60%+ learners at Basic/None. AI Programming worst at 76%.",
            "metric": {"skill_concerns": 2, "worst_skill": "Ai Programming", "worst_pct": 76.2},
        },
    ],
}


@router.get("/program-readiness")
async def get_program_readiness(request: Request) -> dict:
    try:
        aggs = getattr(request.app.state, "aggregations", {})
        return aggs.get("program_readiness") or _STUB
    except Exception as exc:
        logger.error("[program_readiness] Error: %s", exc)
        return _STUB