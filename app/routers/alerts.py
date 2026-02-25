from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Query, Request

logger = logging.getLogger(__name__)
router = APIRouter()

_STUB = {
    "total_alerts": 4,
    "critical": 1,
    "warning":  2,
    "info":     1,
    "alerts": [
        {
            "type":     "region_silent",
            "severity": "critical",
            "message":  "Akkar, Nabatieh, Baalbek-Hermel have ZERO registrations — program has no reach there.",
            "action":   "Immediate outreach required. Deploy University or NGO partnerships in these governorates.",
            "metric":   {"regions": ["Akkar", "Nabatieh", "Baalbek-Hermel"], "count": 3},
        },
        {
            "type":     "skill_mismatch",
            "severity": "warning",
            "message":  "76% of AI Academy (Microsoft) registrants have Basic or no AI Programming skills.",
            "action":   "Add a prerequisite self-assessment or introductory module before learners start this track.",
            "metric":   {"track": "AI Academy (Microsoft)", "low_skill_pct": 76.2},
        },
        {
            "type":     "track_imbalance",
            "severity": "warning",
            "message":  "'Lebanon Coding' has 5 registrations vs 'National Cybersecurity' with only 3 — a 1.7x gap.",
            "action":   "Review marketing materials for National Cybersecurity track.",
            "metric":   {"top_track": "Lebanon Coding", "low_track": "National Cybersecurity", "ratio": 1.7},
        },
        {
            "type":     "channel_inactive",
            "severity": "info",
            "message":  "Other channel has zero registrations — completely inactive.",
            "action":   "Establish formal referral agreements to activate this channel.",
            "metric":   {"channel": "Other", "count": 0},
        },
    ],
}


@router.get("/alerts")
async def get_alerts(
    request:  Request,
    severity: Optional[str] = Query(None, description="Filter by severity: critical, warning, info"),
    type:     Optional[str] = Query(None, description="Filter by type: region_silent, skill_mismatch, track_imbalance, channel_inactive"),
) -> dict:
    try:
        aggs  = getattr(request.app.state, "aggregations", {})
        data  = aggs.get("alerts") or _STUB
        alerts = list(data.get("alerts", []))

        if severity:
            alerts = [a for a in alerts if a.get("severity") == severity.lower()]
        if type:
            alerts = [a for a in alerts if a.get("type") == type.lower()]

        return {
            "total_alerts": len(alerts),
            "critical":     sum(1 for a in alerts if a["severity"] == "critical"),
            "warning":      sum(1 for a in alerts if a["severity"] == "warning"),
            "info":         sum(1 for a in alerts if a["severity"] == "info"),
            "filters_applied": {"severity": severity, "type": type},
            "alerts": alerts,
        }
    except Exception as exc:
        logger.error("[alerts] Error: %s", exc)
        return _STUB