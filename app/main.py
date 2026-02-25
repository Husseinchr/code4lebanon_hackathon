from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    admin,
    dissemination,
    geography,
    interests,
    learners,
    summary,
    recommendations,      # already added earlier
    alerts,               # ADD THIS
    program_readiness,    # ADD THIS
    cohort_profile,       # ADD THIS
)
from app.services.data_processor import (
    compute_dissemination,
    compute_geography,
    compute_interests,
    compute_summary,
    normalize_df,
)
from app.services.alerts            import compute_alerts 
from app.services.program_readiness import compute_program_readiness
from app.services.cohort_profile    import compute_cohort_profile
from app.services.recommendations import compute_recommendations
from app.services.survey_client import get_responses

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NUMŪ Backend starting up…")
    try:
        raw = await get_responses()
        df = normalize_df(raw)
        app.state.df = df
        app.state.aggregations = {
            "summary":           compute_summary(df),
            "dissemination":     compute_dissemination(df),
            "interests":         compute_interests(df),
            "geography":         compute_geography(df),
            "recommendations":   compute_recommendations(df),
            "alerts":            compute_alerts(df),
            "program_readiness": compute_program_readiness(df),
            "cohort_profile":    compute_cohort_profile(df),
        }
        app.state.started_at = datetime.now(timezone.utc).isoformat()
        logger.info("Startup complete: %d responses loaded, DataFrame shape %s.", len(raw), df.shape)
    except Exception as exc:
        logger.error("Startup data load failed: %s — endpoints will serve stubs.", exc)
        app.state.df = None
        app.state.aggregations = {}
        app.state.started_at = datetime.now(timezone.utc).isoformat()

    yield

    logger.info("NUMŪ Backend shutting down.")


app = FastAPI(
    title="NUMŪ Dashboard API",
    description="Backend data API for Lebanon's National Digital & AI Upskilling Initiative.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary.router,       prefix="/api", tags=["Summary"])
app.include_router(dissemination.router, prefix="/api", tags=["Dissemination"])
app.include_router(interests.router,     prefix="/api", tags=["Interests"])
app.include_router(geography.router,     prefix="/api", tags=["Geography"])
app.include_router(learners.router,      prefix="/api", tags=["Learners"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(alerts.router,           prefix="/api", tags=["Alerts"])
app.include_router(program_readiness.router, prefix="/api", tags=["Program Readiness"])
app.include_router(cohort_profile.router,   prefix="/api", tags=["Cohort Profile"])


@app.get("/health", tags=["Health"])
async def health():
    import time
    from app.services import survey_client as sc

    df = getattr(app.state, "df", None)
    return {
        "status": "ok",
        "started_at": getattr(app.state, "started_at", None),
        "records_loaded": len(df) if df is not None else 0,
        "cache_age_seconds": round(time.monotonic() - sc._cache["fetched_at"], 1)
                             if sc._cache["fetched_at"] else None,
    }
