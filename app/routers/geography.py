from __future__ import annotations

import logging

from fastapi import APIRouter, Request

from app.models.schemas import GeographyResponse
from app.services.data_processor import compute_geography

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total_regions": 8,
    "covered_regions": 5,
    "coverage_percentage": 62.5,
    "underrepresented_threshold": 10.0,
    "regions": [
        {
            "region": "Beirut", "count": 9, "percentage": 40.9,
            "cities": [{"city": "Beirut", "count": 9}],
            "is_underrepresented": False,
        },
        {
            "region": "Mount Lebanon", "count": 6, "percentage": 27.3,
            "cities": [
                {"city": "Jounieh", "count": 3},
                {"city": "Antelias", "count": 1},
                {"city": "Zouk Mosbeh", "count": 1},
                {"city": "Byblos", "count": 1},
            ],
            "is_underrepresented": False,
        },
        {
            "region": "North Lebanon", "count": 4, "percentage": 18.2,
            "cities": [
                {"city": "Tripoli", "count": 2},
                {"city": "Koura", "count": 1},
            ],
            "is_underrepresented": False,
        },
        {
            "region": "South Lebanon", "count": 2, "percentage": 9.1,
            "cities": [{"city": "Sidon", "count": 1}, {"city": "Tyre", "count": 1}],
            "is_underrepresented": True,
        },
        {
            "region": "Bekaa", "count": 1, "percentage": 4.5,
            "cities": [{"city": "Zahle", "count": 1}],
            "is_underrepresented": True,
        },
        {"region": "Nabatieh",       "count": 0, "percentage": 0.0, "cities": [], "is_underrepresented": True},
        {"region": "Akkar",          "count": 0, "percentage": 0.0, "cities": [], "is_underrepresented": True},
        {"region": "Baalbek-Hermel", "count": 0, "percentage": 0.0, "cities": [], "is_underrepresented": True},
    ],
    "underrepresented": [
        {
            "region": "South Lebanon", "count": 2, "percentage": 9.1,
            "gap_from_threshold": 0.9,
            "recommendation": "Increase outreach in South Lebanon region — currently 9.1% of registrations.",
        },
        {
            "region": "Bekaa", "count": 1, "percentage": 4.5,
            "gap_from_threshold": 5.5,
            "recommendation": "Increase outreach in Bekaa region — currently 4.5% of registrations.",
        },
        {
            "region": "Nabatieh", "count": 0, "percentage": 0.0,
            "gap_from_threshold": 10.0,
            "recommendation": "Increase outreach in Nabatieh region — currently 0.0% of registrations.",
        },
        {
            "region": "Akkar", "count": 0, "percentage": 0.0,
            "gap_from_threshold": 10.0,
            "recommendation": "Increase outreach in Akkar region — currently 0.0% of registrations.",
        },
        {
            "region": "Baalbek-Hermel", "count": 0, "percentage": 0.0,
            "gap_from_threshold": 10.0,
            "recommendation": "Increase outreach in Baalbek-Hermel region — currently 0.0% of registrations.",
        },
    ],
}


@router.get("/geography", response_model=GeographyResponse)
async def get_geography(request: Request) -> GeographyResponse:
    try:
        df = getattr(request.app.state, "df", None)
        if df is not None and not df.empty:
            data = compute_geography(df)
        else:
            data = _STUB
        return GeographyResponse(**data)
    except Exception as exc:
        logger.error("[geography] Falling back to stub: %s", exc)
        return GeographyResponse(**_STUB)
