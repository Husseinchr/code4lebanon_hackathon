from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)

_MOCK_PATH = Path(__file__).parent.parent / "data" / "providers_mock.json"

_provider_by_id: Dict[str, dict] = {}


def _load_providers() -> None:
    global _provider_by_id
    if _provider_by_id:
        return
    try:
        with open(_MOCK_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for entry in data.get("learners", []):
            rid = entry.get("response_id")
            if rid:
                _provider_by_id[rid] = entry
        logger.info("[provider_service] Loaded %d provider entries.", len(_provider_by_id))
    except Exception as exc:
        logger.error("[provider_service] Could not load providers_mock.json: %s", exc)


def get_provider_map() -> Dict[str, str]:
    _load_providers()
    return {rid: entry["provider"] for rid, entry in _provider_by_id.items()}


def get_provider_detail(response_id: str) -> Optional[dict]:
    _load_providers()
    entry = _provider_by_id.get(response_id)
    if not entry:
        return None
    return {
        "provider":              entry.get("provider"),
        "provider_track":        entry.get("provider_track"),
        "enrollment_date":       entry.get("enrollment_date"),
        "completion_percentage": entry.get("completion_percentage", 0),
        "modules_completed":     entry.get("modules_completed", 0),
        "total_modules":         entry.get("total_modules", 0),
        "is_certified":          entry.get("is_certified", False),
        "certificate_id":        entry.get("certificate_id"),
        "last_activity":         entry.get("last_activity"),
    }
