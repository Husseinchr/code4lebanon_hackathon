from __future__ import annotations

"""
recommendations.py
──────────────────
Policy Recommendation Engine for NUMŪ Dashboard.

Analyzes the normalized DataFrame and generates actionable,
priority-ranked recommendations for MITAI decision-makers.

No external ML libraries — pure pandas logic.
"""

import logging
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

ALL_REGIONS = [
    "Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon",
    "Bekaa", "Nabatieh", "Akkar", "Baalbek-Hermel",
]

ALL_CHANNELS = ["university", "public_sector", "ngo", "employer", "other"]

CHANNEL_LABELS = {
    "university": "University",
    "public_sector": "Public Sector",
    "ngo": "Community / NGO",
    "employer": "Employer",
    "other": "Other",
}

TRACK_LABELS = {
    "oracle_technical_leadership": "Technical Leadership (Oracle)",
    "lebanon_coding": "Lebanon Coding",
    "microsoft_ai_academy": "AI Academy (Microsoft)",
    "digital_literacy": "Digital Literacy & Inclusion",
    "national_cybersecurity": "National Cybersecurity",
}

# Thresholds for triggering recommendations
REGION_UNDERREP_THRESHOLD = 10.0   # % of total registrations
CHANNEL_WEAK_THRESHOLD    = 10.0   # % of total registrations
SKILL_CONCERN_THRESHOLD   = 0.60   # ratio of Basic+None out of total for a skill

PRIORITY_HIGH   = "high"
PRIORITY_MEDIUM = "medium"
PRIORITY_LOW    = "low"


# ── Helper ────────────────────────────────────────────────────────────────────

def _pct(count: int, total: int) -> float:
    return round(count / total * 100, 1) if total else 0.0


def _safe_list(val: Any) -> List[str]:
    if isinstance(val, list):
        return val
    return []


# ── Individual recommendation generators ─────────────────────────────────────

def _geo_recommendations(df: pd.DataFrame, total: int) -> List[dict]:
    recs = []
    region_counts = df["geo_region"].value_counts().to_dict()

    for region in ALL_REGIONS:
        count = int(region_counts.get(region, 0))
        pct = _pct(count, total)

        if pct == 0:
            # Completely absent region
            # Find which channel works best nationally → recommend same for this region
            top_channel = df["access_channel"].value_counts().idxmax() if not df.empty else "university"
            top_label = CHANNEL_LABELS.get(top_channel, top_channel)
            recs.append({
                "id": f"geo_absent_{region.lower().replace(' ', '_')}",
                "category": "geographic_gap",
                "priority": PRIORITY_HIGH,
                "region": region,
                "insight": f"{region} has zero registrations — completely unrepresented.",
                "recommendation": (
                    f"Launch a targeted outreach campaign in {region} immediately. "
                    f"Partner with {top_label} networks — they are the top-performing "
                    f"channel nationally ({df['access_channel'].value_counts().get(top_channel, 0)} registrations). "
                    f"Consider deploying a local coordinator or community workshop."
                ),
                "metric": {"region": region, "registrations": 0, "percentage": 0.0},
            })

        elif pct < REGION_UNDERREP_THRESHOLD:
            # Underrepresented — has some registrations but below threshold
            # Find best performing channel IN this region
            region_df = df[df["geo_region"] == region]
            best_channel_in_region = (
                region_df["access_channel"].value_counts().idxmax()
                if not region_df.empty else "university"
            )
            best_label = CHANNEL_LABELS.get(best_channel_in_region, best_channel_in_region)

            # Find most demanded track nationally
            top_track = df["training_track"].value_counts().idxmax() if not df.empty else ""
            top_track_label = TRACK_LABELS.get(top_track, top_track)

            recs.append({
                "id": f"geo_underrep_{region.lower().replace(' ', '_')}",
                "category": "geographic_gap",
                "priority": PRIORITY_MEDIUM,
                "region": region,
                "insight": (
                    f"{region} has only {count} registration(s) ({pct}% of total) — "
                    f"below the {REGION_UNDERREP_THRESHOLD}% equity threshold."
                ),
                "recommendation": (
                    f"Strengthen {best_label} partnerships in {region} — "
                    f"this is already your best-performing channel there. "
                    f"Promote the '{top_track_label}' track which has highest national demand. "
                    f"Target {round(REGION_UNDERREP_THRESHOLD - pct, 1)}% more registrations to reach equity threshold."
                ),
                "metric": {"region": region, "registrations": count, "percentage": pct},
            })

    return recs


def _channel_recommendations(df: pd.DataFrame, total: int) -> List[dict]:
    recs = []
    channel_counts = df["access_channel"].value_counts().to_dict()

    for channel in ALL_CHANNELS:
        count = int(channel_counts.get(channel, 0))
        pct = _pct(count, total)
        label = CHANNEL_LABELS.get(channel, channel)

        if pct == 0:
            recs.append({
                "id": f"channel_absent_{channel}",
                "category": "channel_gap",
                "priority": PRIORITY_MEDIUM,
                "channel": channel,
                "insight": f"No registrations via {label} channel.",
                "recommendation": (
                    f"The {label} channel has not contributed any registrations. "
                    f"Explore formal partnerships or referral agreements with "
                    f"{label.lower()} organizations to activate this channel."
                ),
                "metric": {"channel": label, "registrations": 0, "percentage": 0.0},
            })

        elif pct < CHANNEL_WEAK_THRESHOLD:
            # Find which region this channel is weakest in
            channel_df = df[df["access_channel"] == channel]
            top_region_for_channel = (
                channel_df["geo_region"].value_counts().idxmax()
                if not channel_df.empty else "unknown"
            )
            recs.append({
                "id": f"channel_weak_{channel}",
                "category": "channel_gap",
                "priority": PRIORITY_LOW,
                "channel": channel,
                "insight": (
                    f"{label} channel is underperforming at {pct}% of registrations."
                ),
                "recommendation": (
                    f"Invest in activating the {label} channel more broadly. "
                    f"Currently strongest in {top_region_for_channel} — "
                    f"replicate that model in other regions. "
                    f"Set a target of doubling {label} referrals in the next campaign cycle."
                ),
                "metric": {"channel": label, "registrations": count, "percentage": pct},
            })

    return recs


def _skill_recommendations(df: pd.DataFrame, total: int) -> List[dict]:
    recs = []
    skill_cols = {
        "digital_literacy":  "digital_literacy_level",
        "cybersecurity":     "cybersecurity_level",
        "ai_programming":    "ai_programming_level",
        "data_skills":       "data_skills_level",
    }
    skill_labels = {
        "digital_literacy": "Digital Literacy",
        "cybersecurity":    "Cybersecurity",
        "ai_programming":   "AI Programming",
        "data_skills":      "Data Skills",
    }

    for skill_key, col in skill_cols.items():
        if col not in df.columns:
            continue
        counts = df[col].value_counts().to_dict()
        basic = int(counts.get("Basic", 0))
        none_ = int(counts.get("None", 0))
        low_skill_ratio = (basic + none_) / total if total else 0

        if low_skill_ratio >= SKILL_CONCERN_THRESHOLD:
            label = skill_labels[skill_key]
            top_track_for_skill = {
                "digital_literacy": "digital_literacy",
                "cybersecurity":    "national_cybersecurity",
                "ai_programming":   "microsoft_ai_academy",
                "data_skills":      "oracle_technical_leadership",
            }.get(skill_key, "")
            track_label = TRACK_LABELS.get(top_track_for_skill, label)

            recs.append({
                "id": f"skill_gap_{skill_key}",
                "category": "skill_gap",
                "priority": PRIORITY_HIGH if low_skill_ratio >= 0.75 else PRIORITY_MEDIUM,
                "skill": label,
                "insight": (
                    f"{round(low_skill_ratio * 100, 1)}% of learners report Basic or no {label} skills "
                    f"({basic} Basic + {none_} None out of {total})."
                ),
                "recommendation": (
                    f"Prioritize foundational {label} content in the program. "
                    f"The '{track_label}' track directly addresses this gap — "
                    f"ensure it is promoted in outreach materials. "
                    f"Consider prerequisite micro-modules before learners start advanced tracks."
                ),
                "metric": {
                    "skill": label,
                    "basic_count": basic,
                    "none_count": none_,
                    "low_skill_percentage": round(low_skill_ratio * 100, 1),
                },
            })

    return recs


def _track_demand_recommendations(df: pd.DataFrame, total: int) -> List[dict]:
    recs = []
    track_counts = df["training_track"].value_counts().to_dict()

    if not track_counts:
        return recs

    # Find tracks with very low demand
    avg_count = total / len(TRACK_LABELS)
    for track, count in track_counts.items():
        pct = _pct(count, total)
        label = TRACK_LABELS.get(track, track)
        if count < avg_count * 0.5:  # less than half the average
            recs.append({
                "id": f"track_low_demand_{track}",
                "category": "track_demand",
                "priority": PRIORITY_LOW,
                "track": track,
                "insight": f"'{label}' has below-average demand ({count} registrations, {pct}%).",
                "recommendation": (
                    f"Review positioning of '{label}' track in outreach materials. "
                    f"Consider highlighting career outcomes and success stories from this track. "
                    f"Survey registrants to understand awareness barriers."
                ),
                "metric": {"track": label, "registrations": count, "percentage": pct},
            })

    # Highlight the top track as a success to double down on
    top_track = max(track_counts, key=track_counts.get)
    top_label = TRACK_LABELS.get(top_track, top_track)
    top_count = track_counts[top_track]
    recs.append({
        "id": "track_top_performer",
        "category": "track_demand",
        "priority": PRIORITY_LOW,
        "track": top_track,
        "insight": f"'{top_label}' is the most demanded track with {top_count} registrations.",
        "recommendation": (
            f"Double down on '{top_label}' — it has the strongest demand. "
            f"Ensure sufficient capacity (instructors, slots) and use it as a flagship "
            f"track in all national communications."
        ),
        "metric": {
            "track": top_label,
            "registrations": top_count,
            "percentage": _pct(top_count, total),
        },
    })

    return recs


def _motivation_recommendations(df: pd.DataFrame, total: int) -> List[dict]:
    recs = []
    reason_counts: Dict[str, int] = {}
    for reasons in df.get("learning_reason", pd.Series(dtype=object)):
        for r in _safe_list(reasons):
            reason_counts[r] = reason_counts.get(r, 0) + 1

    if not reason_counts:
        return recs

    # If job_transition is high → learners need fast-track, practical content
    job_transition = reason_counts.get("job_transition", 0)
    if job_transition / total >= 0.15:
        recs.append({
            "id": "motivation_job_transition",
            "category": "program_design",
            "priority": PRIORITY_MEDIUM,
            "insight": (
                f"{job_transition} learners ({_pct(job_transition, total)}%) are joining for job transition — "
                f"a significant share needing fast, practical outcomes."
            ),
            "recommendation": (
                "Design accelerated, outcome-focused learning paths for career-switchers. "
                "Partner with employers to create direct hiring pipelines post-certification. "
                "Highlight job placement outcomes in marketing materials."
            ),
            "metric": {
                "motivation": "job_transition",
                "count": job_transition,
                "percentage": _pct(job_transition, total),
            },
        })

    # If business motivation is high → B2B / employer track needed
    business = reason_counts.get("business", 0)
    if business / total >= 0.30:
        recs.append({
            "id": "motivation_business",
            "category": "program_design",
            "priority": PRIORITY_MEDIUM,
            "insight": (
                f"{business} learners ({_pct(business, total)}%) are joining for business needs — "
                f"strong signal for B2B/organizational demand."
            ),
            "recommendation": (
                "Develop a dedicated enterprise enrollment track or cohort. "
                "Create tailored content for business owners and managers. "
                "Approach Chambers of Commerce and employer federations for group enrollment deals."
            ),
            "metric": {
                "motivation": "business",
                "count": business,
                "percentage": _pct(business, total),
            },
        })

    return recs


# ── Main public function ──────────────────────────────────────────────────────

def compute_recommendations(df: pd.DataFrame) -> dict:
    """
    Analyze the normalized DataFrame and return prioritized policy recommendations.
    Called once on startup and stored in app.state.aggregations["recommendations"].
    """
    if df is None or df.empty:
        return {"total": 0, "recommendations": [], "summary": {}}

    total = len(df)
    all_recs: List[dict] = []

    all_recs.extend(_geo_recommendations(df, total))
    all_recs.extend(_channel_recommendations(df, total))
    all_recs.extend(_skill_recommendations(df, total))
    all_recs.extend(_track_demand_recommendations(df, total))
    all_recs.extend(_motivation_recommendations(df, total))

    # Sort: high → medium → low
    priority_order = {PRIORITY_HIGH: 0, PRIORITY_MEDIUM: 1, PRIORITY_LOW: 2}
    all_recs.sort(key=lambda r: priority_order.get(r["priority"], 3))

    # Summary counts
    summary = {
        "total": len(all_recs),
        "high":   sum(1 for r in all_recs if r["priority"] == PRIORITY_HIGH),
        "medium": sum(1 for r in all_recs if r["priority"] == PRIORITY_MEDIUM),
        "low":    sum(1 for r in all_recs if r["priority"] == PRIORITY_LOW),
        "by_category": {},
    }
    for rec in all_recs:
        cat = rec["category"]
        summary["by_category"][cat] = summary["by_category"].get(cat, 0) + 1

    logger.info(
        "[recommendations] Generated %d recommendations (%d high, %d medium, %d low).",
        len(all_recs), summary["high"], summary["medium"], summary["low"],
    )

    return {
        "total": len(all_recs),
        "summary": summary,
        "recommendations": all_recs,
    }