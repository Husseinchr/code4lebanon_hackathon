from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app import db
from app.services.sync import check_and_sync
from app.routers import (
    admin,
    dissemination,
    geography,
    interests,
    learners,
    summary,
    recommendations,
    alerts,
    program_readiness,
    cohort_profile,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# How often the background task re-checks for new survey responses (seconds).
SYNC_INTERVAL = 300  # 5 minutes


async def _background_sync(app_state) -> None:
    """Periodically check for new survey data and refresh aggregations in-place."""
    while True:
        await asyncio.sleep(SYNC_INTERVAL)
        logger.info("[main] Background sync triggered.")
        try:
            aggs = await check_and_sync()
            if aggs:
                app_state.aggregations = aggs
                logger.info("[main] Background sync complete — aggregations refreshed.")
        except Exception as exc:
            logger.error("[main] Background sync error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NUMŪ Backend starting up…")

    # 1. Ensure DB schema exists
    db.init_db()

    # 2. Smart sync: serve from DB if data is current, else re-fetch from API
    aggs = await check_and_sync()
    app.state.aggregations = aggs
    app.state.started_at = datetime.now(timezone.utc).isoformat()
    logger.info("Startup complete — %d aggregation keys loaded.", len(aggs))

    # 3. Start background sync task
    sync_task = asyncio.create_task(_background_sync(app.state))

    yield

    # Shutdown — cancel background task gracefully
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        pass
    logger.info("NUMŪ Backend shut down.")


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

app.include_router(summary.router,            prefix="/api", tags=["Summary"])
app.include_router(dissemination.router,      prefix="/api", tags=["Dissemination"])
app.include_router(interests.router,          prefix="/api", tags=["Interests"])
app.include_router(geography.router,          prefix="/api", tags=["Geography"])
app.include_router(learners.router,           prefix="/api", tags=["Learners"])
app.include_router(recommendations.router,    prefix="/api", tags=["Recommendations"])
app.include_router(alerts.router,             prefix="/api", tags=["Alerts"])
app.include_router(program_readiness.router,  prefix="/api", tags=["Program Readiness"])
app.include_router(cohort_profile.router,     prefix="/api", tags=["Cohort Profile"])
app.include_router(admin.router,              prefix="/admin", tags=["Admin"])


@app.get("/health", tags=["Health"])
async def health():
    sync_meta = db.get_last_sync()
    return {
        "status":               "ok",
        "started_at":           getattr(app.state, "started_at", None),
        "aggregations_loaded":  len(getattr(app.state, "aggregations", {})),
        "last_synced_at":       sync_meta["synced_at"]          if sync_meta else None,
        "last_response_date":   sync_meta["last_response_date"] if sync_meta else None,
        "last_response_id":     sync_meta["response_id"]        if sync_meta else None,
    }
