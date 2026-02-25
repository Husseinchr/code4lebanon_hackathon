from __future__ import annotations

"""
program_readiness.py
────────────────────
Program Launch Readiness Score for NUMŪ Dashboard.
Calculates a 0-100 score across 4 weighted dimensions.
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

ALL_REGIONS  = [
    "Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon",
    "Bekaa", "Nabatieh", "Akkar", "Baalbek-Hermel",
]
ALL_CHANNELS = ["university", "public_sector", "ngo", "employer", "other"]
ALL_TRACKS   = [
    "oracle_technical_leadership", "lebanon_coding",
    "microsoft_ai_academy", "digital_literacy", "national_cybersecurity",
]
TRACK_LABELS = {
    "oracle_technical_leadership": "Technical Leadership (Oracle)",
    "lebanon_coding":              "Lebanon Coding",
    "microsoft_ai_academy":        "AI Academy (Microsoft)",
    "digital_literacy":            "Digital Literacy & Inclusion",
    "national_cybersecurity":      "National Cybersecurity",
}

REGION_EQUITY_THRESHOLD  = 10.0   # % per region
CHANNEL_EQUITY_THRESHOLD = 10.0   # % per channel
SKILL_CONCERN_RATIO      = 0.60   # 60%+ Basic/None = concern


def _pct(count: int, total: int) -> float:
    return round(count / total * 100, 1) if total else 0.0


def _grade(score: float) -> tuple[str, str]:
    if score >= 90: return "A", "Ready for national launch"
    if score >= 75: return "B", "Minor gaps — launch with a monitoring plan"
    if score >= 60: return "C", "Needs attention before launch"
    if score >= 45: return "D", "Significant gaps — delay launch and restrategize"
    return "F", "Not ready — critical failures in core dimensions"


# ── Dimension scorers ─────────────────────────────────────────────────────────

def _score_geography(df: pd.DataFrame, total: int) -> dict:
    region_counts = df["geo_region"].value_counts().to_dict()
    active   = sum(1 for r in ALL_REGIONS if _pct(region_counts.get(r, 0), total) >= REGION_EQUITY_THRESHOLD)
    present  = sum(1 for r in ALL_REGIONS if region_counts.get(r, 0) > 0)
    silent   = [r for r in ALL_REGIONS if region_counts.get(r, 0) == 0]
    score    = round((active / len(ALL_REGIONS)) * 100)

    if silent:
        detail = f"{len(silent)} region(s) with zero registrations: {', '.join(silent)}."
        status = "critical"
    elif active < len(ALL_REGIONS):
        detail = f"{active} of {len(ALL_REGIONS)} regions above equity threshold."
        status = "warning"
    else:
        detail = "All regions adequately represented."
        status = "good"

    return {
        "name":   "Geographic Coverage",
        "score":  score,
        "weight": 30,
        "weighted_contribution": round(score * 0.30, 1),
        "status": status,
        "detail": detail,
        "metric": {"active_regions": active, "present_regions": present, "silent_regions": silent},
    }


def _score_channels(df: pd.DataFrame, total: int) -> dict:
    channel_counts = df["access_channel"].value_counts().to_dict()
    active  = sum(1 for c in ALL_CHANNELS if _pct(channel_counts.get(c, 0), total) >= CHANNEL_EQUITY_THRESHOLD)
    present = sum(1 for c in ALL_CHANNELS if channel_counts.get(c, 0) > 0)
    score   = round((active / len(ALL_CHANNELS)) * 100)

    if present < len(ALL_CHANNELS):
        detail = f"{present} of {len(ALL_CHANNELS)} channels active. {len(ALL_CHANNELS) - present} channel(s) inactive."
        status = "warning"
    elif active < len(ALL_CHANNELS):
        detail = f"All channels active but {len(ALL_CHANNELS) - active} below {CHANNEL_EQUITY_THRESHOLD}% threshold."
        status = "warning"
    else:
        detail = "All channels active and balanced."
        status = "good"

    return {
        "name":   "Channel Diversity",
        "score":  score,
        "weight": 20,
        "weighted_contribution": round(score * 0.20, 1),
        "status": status,
        "detail": detail,
        "metric": {"active_channels": active, "present_channels": present},
    }


def _score_tracks(df: pd.DataFrame, total: int) -> dict:
    track_counts = df["training_track"].value_counts().to_dict()
    present = sum(1 for t in ALL_TRACKS if track_counts.get(t, 0) > 0)

    if present == 0:
        return {"name": "Track Demand Balance", "score": 0, "weight": 20,
                "weighted_contribution": 0, "status": "critical",
                "detail": "No track data.", "metric": {}}

    counts  = [track_counts.get(t, 0) for t in ALL_TRACKS if track_counts.get(t, 0) > 0]
    avg     = sum(counts) / len(counts) if counts else 1
    min_c   = min(counts)
    balance = round((min_c / avg) * 100) if avg else 0
    score   = min(100, max(0, balance))

    if present < len(ALL_TRACKS):
        detail = f"Only {present} of {len(ALL_TRACKS)} tracks have registrations."
        status = "warning"
    elif score < 50:
        detail = "Significant demand imbalance between tracks."
        status = "warning"
    else:
        detail = "All tracks active with reasonable demand balance."
        status = "good"

    low_track = min(track_counts, key=lambda t: track_counts.get(t, 0))
    return {
        "name":   "Track Demand Balance",
        "score":  score,
        "weight": 20,
        "weighted_contribution": round(score * 0.20, 1),
        "status": status,
        "detail": detail,
        "metric": {
            "tracks_active": present,
            "lowest_track":  TRACK_LABELS.get(low_track, low_track),
            "lowest_count":  track_counts.get(low_track, 0),
        },
    }


def _score_skills(df: pd.DataFrame, total: int) -> dict:
    skill_cols = [
        "digital_literacy_level", "cybersecurity_level",
        "ai_programming_level", "data_skills_level",
    ]
    concern_count = 0
    worst_skill   = ""
    worst_pct     = 0.0

    for col in skill_cols:
        if col not in df.columns:
            continue
        low = int(df[col].isin(["Basic", "None"]).sum())
        ratio = low / total if total else 0
        if ratio >= SKILL_CONCERN_RATIO:
            concern_count += 1
            pct = round(ratio * 100, 1)
            if pct > worst_pct:
                worst_pct   = pct
                worst_skill = col.replace("_level", "").replace("_", " ").title()

    # Score: 100 if no concerns, drops 25 per concerning skill
    score  = max(0, 100 - (concern_count * 25))
    status = "critical" if concern_count >= 3 else "warning" if concern_count >= 1 else "good"
    detail = (
        f"{concern_count} skill area(s) have 60%+ learners at Basic/None level. "
        f"Worst: {worst_skill} at {worst_pct}%." if concern_count
        else "Skill baseline is adequate across all dimensions."
    )

    return {
        "name":   "Skill Baseline",
        "score":  score,
        "weight": 30,
        "weighted_contribution": round(score * 0.30, 1),
        "status": status,
        "detail": detail,
        "metric": {"skill_concerns": concern_count, "worst_skill": worst_skill, "worst_pct": worst_pct},
    }


# ── Main public function ──────────────────────────────────────────────────────

def compute_program_readiness(df: pd.DataFrame) -> dict:
    if df is None or df.empty:
        return {
            "overall_score": 0, "grade": "F",
            "status": "No data available", "top_blocker": "No data loaded",
            "dimensions": [],
        }

    total = len(df)
    dims  = [
        _score_geography(df, total),
        _score_channels(df, total),
        _score_tracks(df, total),
        _score_skills(df, total),
    ]

    overall = round(sum(d["weighted_contribution"] for d in dims))
    grade, status = _grade(overall)

    # Find top blocker = lowest weighted contribution
    blocker = min(dims, key=lambda d: d["weighted_contribution"])
    top_blocker = f"{blocker['name']} — {blocker['detail']}"

    logger.info("[program_readiness] Score: %d (%s) — Blocker: %s", overall, grade, blocker["name"])

    return {
        "overall_score": overall,
        "grade":         grade,
        "status":        status,
        "top_blocker":   top_blocker,
        "dimensions":    dims,
    }