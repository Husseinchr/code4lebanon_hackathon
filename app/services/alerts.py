from __future__ import annotations

"""
alerts.py
─────────
Live Anomaly Detection Engine for NUMŪ Dashboard.
Scans the normalized DataFrame and fires alerts automatically.
"""

import logging
from typing import Any, List
import pandas as pd

logger = logging.getLogger(__name__)

ALL_REGIONS = [
    "Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon",
    "Bekaa", "Nabatieh", "Akkar", "Baalbek-Hermel",
]

TRACK_LABELS = {
    "oracle_technical_leadership": "Technical Leadership (Oracle)",
    "lebanon_coding":              "Lebanon Coding",
    "microsoft_ai_academy":        "AI Academy (Microsoft)",
    "digital_literacy":            "Digital Literacy & Inclusion",
    "national_cybersecurity":      "National Cybersecurity",
}

REGION_THRESHOLD   = 10.0   # % below = underrepresented
IMBALANCE_RATIO    = 2.5    # top track X times bigger than bottom = imbalance
SKILL_MISMATCH_PCT = 60.0   # % Basic+None in a track = mismatch alert


def _pct(count: int, total: int) -> float:
    return round(count / total * 100, 1) if total else 0.0


def _safe_list(val: Any) -> List[str]:
    return val if isinstance(val, list) else []


# ── Alert generators ──────────────────────────────────────────────────────────

def _region_alerts(df: pd.DataFrame, total: int) -> List[dict]:
    alerts = []
    region_counts = df["geo_region"].value_counts().to_dict()
    silent = [r for r in ALL_REGIONS if region_counts.get(r, 0) == 0]
    underrep = [
        r for r in ALL_REGIONS
        if 0 < region_counts.get(r, 0) and _pct(region_counts[r], total) < REGION_THRESHOLD
    ]

    if silent:
        alerts.append({
            "type":     "region_silent",
            "severity": "critical",
            "message":  f"{', '.join(silent)} {'have' if len(silent) > 1 else 'has'} ZERO registrations — program has no reach there.",
            "action":   "Immediate outreach required. Deploy University or NGO partnerships in these governorates. Program is failing its equity mandate.",
            "metric":   {"regions": silent, "count": len(silent)},
        })

    for region in underrep:
        count = int(region_counts[region])
        pct   = _pct(count, total)
        alerts.append({
            "type":     "region_underrepresented",
            "severity": "warning",
            "message":  f"{region} is underrepresented at {pct}% ({count} registrations) — below the {REGION_THRESHOLD}% equity threshold.",
            "action":   f"Activate local partners in {region}. Target at least {round(REGION_THRESHOLD - pct, 1)}% more registrations to reach equity threshold.",
            "metric":   {"region": region, "count": count, "percentage": pct},
        })

    return alerts


def _track_alerts(df: pd.DataFrame, total: int) -> List[dict]:
    alerts = []
    track_counts = df["training_track"].value_counts().to_dict()
    if len(track_counts) < 2:
        return alerts

    top_track   = max(track_counts, key=track_counts.get)
    bot_track   = min(track_counts, key=track_counts.get)
    top_count   = track_counts[top_track]
    bot_count   = track_counts[bot_track]

    if bot_count > 0 and top_count / bot_count >= IMBALANCE_RATIO:
        alerts.append({
            "type":     "track_imbalance",
            "severity": "warning",
            "message":  (
                f"'{TRACK_LABELS.get(top_track, top_track)}' has {top_count} registrations "
                f"vs '{TRACK_LABELS.get(bot_track, bot_track)}' with only {bot_count} — "
                f"a {round(top_count / bot_count, 1)}x gap."
            ),
            "action":   f"Review marketing materials for '{TRACK_LABELS.get(bot_track, bot_track)}'. Consider targeted promotion or incentives for this track.",
            "metric":   {
                "top_track": TRACK_LABELS.get(top_track, top_track),
                "top_count": top_count,
                "low_track": TRACK_LABELS.get(bot_track, bot_track),
                "low_count": bot_count,
                "ratio":     round(top_count / bot_count, 1),
            },
        })

    return alerts


def _skill_mismatch_alerts(df: pd.DataFrame, total: int) -> List[dict]:
    alerts = []
    track_skill_map = {
        "microsoft_ai_academy":        "ai_programming_level",
        "oracle_technical_leadership":  "data_skills_level",
        "national_cybersecurity":       "cybersecurity_level",
        "digital_literacy":             "digital_literacy_level",
        "lebanon_coding":               "ai_programming_level",
    }

    for track, skill_col in track_skill_map.items():
        track_df = df[df["training_track"] == track]
        if track_df.empty or skill_col not in track_df.columns:
            continue
        t_total = len(track_df)
        low = int((track_df[skill_col].isin(["Basic", "None"])).sum())
        pct = _pct(low, t_total)
        if pct >= SKILL_MISMATCH_PCT:
            alerts.append({
                "type":     "skill_mismatch",
                "severity": "warning",
                "message":  (
                    f"{pct}% of '{TRACK_LABELS.get(track, track)}' registrants "
                    f"have Basic or no relevant skills ({low} of {t_total} learners)."
                ),
                "action":   "Add a prerequisite self-assessment or introductory module before learners start this track. Consider a foundational cohort pathway.",
                "metric":   {
                    "track":           TRACK_LABELS.get(track, track),
                    "low_skill_count": low,
                    "total_in_track":  t_total,
                    "low_skill_pct":   pct,
                },
            })

    return alerts


def _channel_alerts(df: pd.DataFrame, total: int) -> List[dict]:
    alerts = []
    channel_counts = df["access_channel"].value_counts().to_dict()
    all_channels   = ["university", "public_sector", "ngo", "employer", "other"]
    channel_labels = {
        "university":    "University",
        "public_sector": "Public Sector",
        "ngo":           "Community / NGO",
        "employer":      "Employer",
        "other":         "Other",
    }

    for ch in all_channels:
        count = channel_counts.get(ch, 0)
        if count == 0:
            alerts.append({
                "type":     "channel_inactive",
                "severity": "info",
                "message":  f"{channel_labels[ch]} channel has zero registrations — completely inactive.",
                "action":   f"Establish formal referral agreements with {channel_labels[ch]} organizations to activate this channel.",
                "metric":   {"channel": channel_labels[ch], "count": 0},
            })

    return alerts


# ── Main public function ──────────────────────────────────────────────────────

def compute_alerts(df: pd.DataFrame) -> dict:
    if df is None or df.empty:
        return {"total_alerts": 0, "critical": 0, "warning": 0, "info": 0, "alerts": []}

    total = len(df)
    all_alerts: List[dict] = []

    all_alerts.extend(_region_alerts(df, total))
    all_alerts.extend(_track_alerts(df, total))
    all_alerts.extend(_skill_mismatch_alerts(df, total))
    all_alerts.extend(_channel_alerts(df, total))

    # Sort: critical → warning → info
    order = {"critical": 0, "warning": 1, "info": 2}
    all_alerts.sort(key=lambda a: order.get(a["severity"], 3))

    result = {
        "total_alerts": len(all_alerts),
        "critical":     sum(1 for a in all_alerts if a["severity"] == "critical"),
        "warning":      sum(1 for a in all_alerts if a["severity"] == "warning"),
        "info":         sum(1 for a in all_alerts if a["severity"] == "info"),
        "alerts":       all_alerts,
    }

    logger.info(
        "[alerts] %d alerts fired (%d critical, %d warning, %d info).",
        result["total_alerts"], result["critical"], result["warning"], result["info"],
    )
    return result