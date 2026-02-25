from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query, Request

from app.models.schemas import DisseminationResponse
from app.services.data_processor import compute_dissemination

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total": 22,
    "by_channel": [
        {
            "channel": "university", "label": "University",
            "count": 7, "percentage": 31.8,
            "sub_entities": [
                {"name": "American University of Beirut", "count": 1},
                {"name": "Lebanese American University", "count": 1},
                {"name": "University of Balamand", "count": 1},
                {"name": "Notre Dame University", "count": 1},
                {"name": "Beirut Arab University", "count": 1},
                {"name": "Holy Spirit University of Kaslik", "count": 1},
            ],
            "growth": [
                {"date": "2026-02-01", "count": 1, "cumulative": 1},
                {"date": "2026-02-06", "count": 1, "cumulative": 2},
                {"date": "2026-02-09", "count": 1, "cumulative": 3},
                {"date": "2026-02-11", "count": 1, "cumulative": 4},
                {"date": "2026-02-18", "count": 1, "cumulative": 5},
                {"date": "2026-02-20", "count": 1, "cumulative": 6},
                {"date": "2026-02-25", "count": 1, "cumulative": 7},
            ],
        },
        {
            "channel": "employer", "label": "Employer",
            "count": 5, "percentage": 22.7,
            "sub_entities": [
                {"name": "Tech Solutions Lebanon", "count": 1},
                {"name": "Innovative Tech Hub", "count": 1},
                {"name": "Digital Transformation Agency", "count": 1},
                {"name": "Telecommunications Company", "count": 1},
                {"name": "Bank of Lebanon IT Department", "count": 1},
            ],
            "growth": [
                {"date": "2026-02-08", "count": 1, "cumulative": 1},
                {"date": "2026-02-10", "count": 1, "cumulative": 2},
                {"date": "2026-02-15", "count": 1, "cumulative": 3},
                {"date": "2026-02-16", "count": 1, "cumulative": 4},
                {"date": "2026-02-21", "count": 1, "cumulative": 5},
            ],
        },
        {
            "channel": "ngo", "label": "Community / NGO",
            "count": 5, "percentage": 22.7,
            "sub_entities": [
                {"name": "Code For Lebanon", "count": 1},
                {"name": "Youth Empowerment Initiative", "count": 1},
                {"name": "Women in Tech Lebanon", "count": 1},
                {"name": "Tech for Good Lebanon", "count": 1},
                {"name": "Women Empowerment Center", "count": 1},
            ],
            "growth": [],
        },
        {
            "channel": "public_sector", "label": "Public Sector",
            "count": 3, "percentage": 13.6,
            "sub_entities": [
                {"name": "Ministry of Education", "count": 1},
                {"name": "Ministry of Telecommunications", "count": 1},
                {"name": "Ministry of Social Affairs", "count": 1},
            ],
            "growth": [],
        },
        {
            "channel": "other", "label": "Other",
            "count": 2, "percentage": 9.1,
            "sub_entities": [{"name": "Community Center", "count": 1}],
            "growth": [],
        },
    ],
    "growth_over_time": [
        {"date": "2026-02-01", "count": 1, "cumulative": 1},
        {"date": "2026-02-02", "count": 1, "cumulative": 2},
        {"date": "2026-02-03", "count": 1, "cumulative": 3},
        {"date": "2026-02-04", "count": 1, "cumulative": 4},
        {"date": "2026-02-05", "count": 1, "cumulative": 5},
        {"date": "2026-02-06", "count": 1, "cumulative": 6},
        {"date": "2026-02-07", "count": 1, "cumulative": 7},
        {"date": "2026-02-08", "count": 1, "cumulative": 8},
        {"date": "2026-02-09", "count": 1, "cumulative": 9},
        {"date": "2026-02-10", "count": 1, "cumulative": 10},
        {"date": "2026-02-11", "count": 1, "cumulative": 11},
        {"date": "2026-02-12", "count": 1, "cumulative": 12},
        {"date": "2026-02-13", "count": 1, "cumulative": 13},
        {"date": "2026-02-14", "count": 1, "cumulative": 14},
        {"date": "2026-02-15", "count": 1, "cumulative": 15},
        {"date": "2026-02-16", "count": 1, "cumulative": 16},
        {"date": "2026-02-17", "count": 1, "cumulative": 17},
        {"date": "2026-02-18", "count": 1, "cumulative": 18},
        {"date": "2026-02-19", "count": 1, "cumulative": 19},
        {"date": "2026-02-20", "count": 1, "cumulative": 20},
        {"date": "2026-02-21", "count": 1, "cumulative": 21},
        {"date": "2026-02-22", "count": 1, "cumulative": 22},
    ],
}


@router.get("/dissemination", response_model=DisseminationResponse)
async def get_dissemination(
    request: Request,
    channel: Optional[str] = Query(None),
) -> DisseminationResponse:
    try:
        df = getattr(request.app.state, "df", None)
        if df is not None and not df.empty:
            data = compute_dissemination(df, channel_filter=channel)
        else:
            data = _STUB
            if channel:
                data = {
                    **data,
                    "by_channel": [c for c in data["by_channel"] if c["channel"] == channel],
                }
        return DisseminationResponse(**data)
    except Exception as exc:
        logger.error("[dissemination] Falling back to stub: %s", exc)
        return DisseminationResponse(**_STUB)
