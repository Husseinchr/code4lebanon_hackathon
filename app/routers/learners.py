from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request

from app.models.schemas import LearnerProfile, LearnersResponse
from app.services.data_processor import get_learner_by_id, get_learner_list
from app.services.provider_service import get_provider_detail, get_provider_map

logger = logging.getLogger(__name__)
router = APIRouter()

_LEARNER_STUB = {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Ahmad Hassan",
    "email": "ahmad.hassan@example.com",
    "phone": "+9611234567",
    "age_range": "25_34",
    "training_track": "microsoft_ai_academy",
    "track_label": "AI Academy, by Microsoft",
    "access_channel": "university",
    "channel_label": "University",
    "sub_entity": "American University of Beirut",
    "employment_status": "student",
    "job_level": "student",
    "experience_years": "0_1",
    "learning_reason": ["personal", "career_growth"],
    "ai_goals": ["career", "build_tools", "explore"],
    "skills": {
        "digital_literacy": "Intermediate",
        "cybersecurity": "Basic",
        "ai_programming": "Basic",
        "data_skills": "Intermediate",
    },
    "geo": {"country": "Lebanon", "region": "Beirut", "city": "Beirut"},
    "utm": {"source": "university", "medium": "referral", "campaign": "aub-partnership"},
    "registered_at": "2026-02-20T10:30:00+00:00",
    "submission_status": "completed",
    "provider_status": {
        "provider": "Microsoft",
        "provider_track": "AI Academy, by Microsoft",
        "enrollment_date": "2026-02-21T00:00:00+00:00",
        "completion_percentage": 65.0,
        "modules_completed": 3,
        "total_modules": 8,
        "is_certified": False,
        "certificate_id": None,
        "last_activity": "2026-02-24T14:30:00+00:00",
    },
}

_LIST_STUB = {
    "learners": [
        {
            "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
            "name": "Ahmad Hassan",
            "email": "ahmad.hassan@example.com",
            "training_track": "microsoft_ai_academy",
            "track_label": "AI Academy, by Microsoft",
            "channel": "university",
            "channel_label": "University",
            "region": "Beirut",
            "city": "Beirut",
            "age_range": "25_34",
            "employment_status": "student",
            "submission_status": "completed",
            "registered_at": "2026-02-20T10:30:00+00:00",
            "provider_badge": "Microsoft",
        },
        {
            "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
            "name": "Layla Khoury",
            "email": "layla.khoury@example.com",
            "training_track": "oracle_technical_leadership",
            "track_label": "Technical Leadership, by Oracle",
            "channel": "employer",
            "channel_label": "Employer",
            "region": "Mount Lebanon",
            "city": "Jounieh",
            "age_range": "35_44",
            "employment_status": "full_time",
            "submission_status": "completed",
            "registered_at": "2026-02-21T14:15:00+00:00",
            "provider_badge": "Oracle",
        },
    ],
    "pagination": {
        "page": 1, "limit": 10, "total": 22,
        "total_pages": 3, "has_next": True, "has_prev": False,
    },
}


@router.get("/learners", response_model=LearnersResponse)
async def list_learners(
    request: Request,
    page:    int            = Query(1,    ge=1),
    limit:   int            = Query(10,   ge=1, le=100),
    channel: Optional[str] = Query(None),
    region:  Optional[str] = Query(None),
    track:   Optional[str] = Query(None),
) -> LearnersResponse:
    try:
        df = getattr(request.app.state, "df", None)
        if df is not None and not df.empty:
            provider_map = get_provider_map()
            data = get_learner_list(
                df, page=page, limit=limit,
                channel_filter=channel, region_filter=region,
                track_filter=track, provider_map=provider_map,
            )
        else:
            data = _LIST_STUB
        return LearnersResponse(**data)
    except Exception as exc:
        logger.error("[learners] Falling back to stub: %s", exc)
        return LearnersResponse(**_LIST_STUB)


@router.get("/learner/{learner_id}", response_model=LearnerProfile)
async def get_learner(request: Request, learner_id: str) -> LearnerProfile:
    try:
        df = getattr(request.app.state, "df", None)
        if df is not None and not df.empty:
            provider_detail = get_provider_detail(learner_id)
            profile = get_learner_by_id(df, learner_id, provider_detail=provider_detail)
            if profile is None:
                raise HTTPException(status_code=404, detail=f"Learner {learner_id} not found")
            return LearnerProfile(**profile)
        else:
            stub = dict(_LEARNER_STUB)
            stub["id"] = learner_id
            return LearnerProfile(**stub)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[learner/%s] Falling back to stub: %s", learner_id, exc)
        stub = dict(_LEARNER_STUB)
        stub["id"] = learner_id
        return LearnerProfile(**stub)
