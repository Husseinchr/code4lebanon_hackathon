from __future__ import annotations

import asyncio
import json
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_BACKUP_PATH = Path(__file__).parent.parent / "data" / "survey_data_backup.json"

_cache: Dict[str, Any] = {
    "responses": None,
    "fetched_at": 0.0,
}
_lock: Optional[asyncio.Lock] = None


def _get_lock() -> asyncio.Lock:
    global _lock
    if _lock is None:
        _lock = asyncio.Lock()
    return _lock


def _is_stale() -> bool:
    ttl = settings.CACHE_TTL_SECONDS
    if ttl <= 0:
        return True
    return (time.monotonic() - _cache["fetched_at"]) > ttl


def _load_backup() -> List[dict]:
    try:
        with open(_BACKUP_PATH, "r", encoding="utf-8") as f:
            payload = json.load(f)
        responses = payload.get("data", {}).get("responses", [])
        logger.info("[survey_client] Loaded %d responses from backup.", len(responses))
        return responses
    except Exception as exc:
        logger.error("[survey_client] Could not load backup: %s", exc)
        return []


async def _fetch_all_pages() -> List[dict]:
    headers = {
        "accept": "application/json",
        "x-api-key": settings.SURVEY_API_KEY,
    }
    all_responses: List[dict] = []
    page = 1
    limit = 100

    async with httpx.AsyncClient(
        base_url=settings.SURVEY_API_BASE_URL,
        headers=headers,
        timeout=15.0,
    ) as client:
        while True:
            resp = await client.get("/api/responses", params={"page": page, "limit": limit})
            resp.raise_for_status()
            payload = resp.json()
            batch = payload.get("data", {}).get("responses", [])
            all_responses.extend(batch)

            pagination = payload.get("data", {}).get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    logger.info("[survey_client] Fetched %d total responses from API.", len(all_responses))
    return all_responses


async def get_responses(force_refresh: bool = False) -> List[dict]:
    lock = _get_lock()

    if not force_refresh and _cache["responses"] is not None and not _is_stale():
        return _cache["responses"]

    async with lock:
        if not force_refresh and _cache["responses"] is not None and not _is_stale():
            return _cache["responses"]

        try:
            responses = await _fetch_all_pages()
            if not responses:
                raise ValueError("API returned 0 responses")
            _cache["responses"] = responses
            _cache["fetched_at"] = time.monotonic()
            return responses
        except Exception as exc:
            logger.warning(
                "[survey_client] Fetch failed (%s), using %s.",
                exc,
                "stale cache" if _cache["responses"] else "backup file",
            )
            if _cache["responses"]:
                return _cache["responses"]
            backup = _load_backup()
            _cache["responses"] = backup
            _cache["fetched_at"] = time.monotonic()
            return backup


async def force_refresh() -> int:
    responses = await get_responses(force_refresh=True)
    return len(responses)
