"""
Sync orchestration.

check_and_sync()
    1. Call GET /api/responses/last-response-date
    2. Compare response_id with what is stored in the DB
    3a. If the same  → data hasn't changed → load aggregations from DB
    3b. If different → fetch all responses, recompute every aggregation,
                       persist to DB, return fresh data
    4. On any failure → fall back to whatever is in the DB (may be empty)
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from app import db
from app.services.survey_client import get_last_response_date, get_responses
from app.services.data_processor import (
    compute_dissemination,
    compute_geography,
    compute_interests,
    compute_summary,
    normalize_df,
)
from app.services.alerts import compute_alerts
from app.services.cohort_profile import compute_cohort_profile
from app.services.program_readiness import compute_program_readiness
from app.services.recommendations import compute_recommendations

logger = logging.getLogger(__name__)


def _compute_all(df) -> Dict[str, Any]:
    return {
        "summary":           compute_summary(df),
        "dissemination":     compute_dissemination(df),
        "interests":         compute_interests(df),
        "geography":         compute_geography(df),
        "recommendations":   compute_recommendations(df),
        "alerts":            compute_alerts(df),
        "program_readiness": compute_program_readiness(df),
        "cohort_profile":    compute_cohort_profile(df),
    }


async def check_and_sync() -> Dict[str, Any]:
    """
    Smart sync: only re-fetches and recomputes when the survey API reports
    a new response (different response_id).  Returns the aggregations dict.
    """
    # ── 1. ask the API what the latest response is ───────────────────────────
    try:
        api_meta = await get_last_response_date()
        api_response_id  = api_meta["response_id"]
        api_date         = api_meta["last_response_date"]
        api_survey_id    = api_meta.get("survey_id", "")
    except Exception as exc:
        logger.warning("[sync] Could not reach last-response-date API: %s", exc)
        # fall back to DB immediately
        aggs = db.load_aggregations()
        if aggs:
            logger.info("[sync] Serving stale aggregations from DB (API unreachable).")
            return aggs
        logger.warning("[sync] DB also empty — endpoints will use stubs.")
        return {}

    # ── 2. compare with stored state ─────────────────────────────────────────
    stored = db.get_last_sync()
    if stored and stored["response_id"] == api_response_id:
        aggs = db.load_aggregations()
        if aggs:
            logger.info(
                "[sync] No new data (response_id=%s) — loaded %d keys from DB.",
                api_response_id, len(aggs),
            )
            return aggs
        # DB empty despite matching response_id (e.g. DB was wiped manually)
        logger.warning("[sync] DB empty — forcing re-fetch despite matching response_id.")

    # ── 3. new data (or first run) — fetch, compute, persist ─────────────────
    logger.info("[sync] New data detected (response_id=%s) — fetching all responses.", api_response_id)
    try:
        raw = await get_responses(force_refresh=True)
        df  = normalize_df(raw)
        aggs = _compute_all(df)

        db.save_aggregations(aggs)
        db.save_sync_meta(api_date, api_response_id, api_survey_id)
        logger.info("[sync] Sync complete — %d records stored in DB.", len(raw))
        return aggs

    except Exception as exc:
        logger.error("[sync] Fetch/compute failed: %s — falling back to DB.", exc)
        aggs = db.load_aggregations()
        if aggs:
            logger.info("[sync] Serving stale aggregations from DB (compute failed).")
            return aggs
        logger.warning("[sync] DB also empty — endpoints will use stubs.")
        return {}
