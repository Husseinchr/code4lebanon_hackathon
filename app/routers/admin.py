from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request

from app.config import settings
from app.models.schemas import RefreshResponse
from app.services.data_processor import normalize_df
from app.services.survey_client import force_refresh
from app.services.alerts            import compute_alerts
from app.services.program_readiness import compute_program_readiness
from app.services.cohort_profile    import compute_cohort_profile

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_cache(
    request: Request,
    x_admin_key: str = Header(...),
) -> RefreshResponse:
    if x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid admin key")

    try:
        count = await force_refresh()

        from app.services import survey_client as sc
        raw = sc._cache.get("responses") or []
        df = normalize_df(raw)
        request.app.state.df = df

        from app.services.data_processor import (
            compute_dissemination,
            compute_geography,
            compute_interests,
            compute_summary,
        )
        from app.services.recommendations import compute_recommendations

        request.app.state.aggregations = {
    "summary":          compute_summary(df),
    "dissemination":    compute_dissemination(df),
    "interests":        compute_interests(df),
    "geography":        compute_geography(df),
    "recommendations":  compute_recommendations(df),
    "alerts":            compute_alerts(df),             # ADD THIS
    "program_readiness": compute_program_readiness(df),  # ADD THIS
    "cohort_profile":    compute_cohort_profile(df),     # ADD THIS
}

        logger.info("[admin/refresh] Cache refreshed: %d records.", count)
        return RefreshResponse(
            success=True,
            message="Cache refreshed successfully from Survey API.",
            total_records=count,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        logger.error("[admin/refresh] Refresh failed: %s", exc)
        raise HTTPException(status_code=502, detail=f"Refresh failed: {exc}")
