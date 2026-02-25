from __future__ import annotations

"""
cohort_profile.py
─────────────────
Smart Learner Segmentation Engine for NUMŪ Dashboard.
Automatically groups learners into strategic cohorts based on
employment, age, skills, and motivations.
"""

import logging
from typing import Any, List
import pandas as pd

logger = logging.getLogger(__name__)

TRACK_LABELS = {
    "oracle_technical_leadership": "Technical Leadership (Oracle)",
    "lebanon_coding":              "Lebanon Coding",
    "microsoft_ai_academy":        "AI Academy (Microsoft)",
    "digital_literacy":            "Digital Literacy & Inclusion",
    "national_cybersecurity":      "National Cybersecurity",
}


def _pct(count: int, total: int) -> float:
    return round(count / total * 100, 1) if total else 0.0


def _safe_list(val: Any) -> List[str]:
    return val if isinstance(val, list) else []


def _top_value(series: pd.Series) -> str:
    return series.value_counts().idxmax() if not series.empty else "unknown"


def _avg_skill(df: pd.DataFrame) -> str:
    skill_cols = [
        "digital_literacy_level", "cybersecurity_level",
        "ai_programming_level",   "data_skills_level",
    ]
    level_map  = {"Advanced": 3, "Intermediate": 2, "Basic": 1, "None": 0}
    scores = []
    for col in skill_cols:
        if col in df.columns:
            scores += [level_map.get(v, 0) for v in df[col].tolist()]
    if not scores:
        return "Unknown"
    avg = sum(scores) / len(scores)
    if avg >= 2.5: return "Advanced"
    if avg >= 1.5: return "Intermediate"
    if avg >= 0.5: return "Basic"
    return "None"


# ── Cohort definitions ────────────────────────────────────────────────────────
# Each cohort is defined by inclusion rules applied to the DataFrame.
# Learners are assigned to the FIRST cohort whose rules they match.
# Any remaining learners fall into "Other".

def _classify(row: pd.Series) -> str:
    emp    = row.get("employment_status", "")
    age    = row.get("age_range", "")
    reasons = _safe_list(row.get("learning_reason", []))

    # Career Climbers: working professionals motivated by career/business
    if emp in ("full_time", "entrepreneur") and age in ("25_34", "35_44", "45_54"):
        return "career_climbers"

    # Digital Newcomers: low digital experience, older, public sector or not working
    if emp in ("not_working", "full_time") and age in ("45_54", "55_plus"):
        return "digital_newcomers"
    if emp == "full_time" and age == "35_44" and "personal" in reasons:
        return "digital_newcomers"

    # Future Builders: young students and early-career individuals
    if emp in ("student", "part_time", "freelancer") and age in ("18_24", "25_34"):
        return "future_builders"

    return "other"


def compute_cohort_profile(df: pd.DataFrame) -> dict:
    if df is None or df.empty:
        return {"total_learners": 0, "cohorts": []}

    total = len(df)
    df    = df.copy()
    df["_cohort"] = df.apply(_classify, axis=1)

    cohorts = []

    # ── Career Climbers ───────────────────────────────────────────────────────
    cc_df = df[df["_cohort"] == "career_climbers"]
    if not cc_df.empty:
        top_track = _top_value(cc_df["training_track"])
        top_motivation = "career_growth"
        cohorts.append({
            "id":             "career_climbers",
            "name":           "Career Climbers",
            "count":          len(cc_df),
            "percentage":     _pct(len(cc_df), total),
            "profile":        "Full-time employed or entrepreneurs, aged 25–44, motivated by career growth and business outcomes.",
            "top_track":      TRACK_LABELS.get(top_track, top_track),
            "top_channel":    TRACK_LABELS.get(_top_value(cc_df["access_channel"]), _top_value(cc_df["access_channel"])),
            "avg_skill_level":_avg_skill(cc_df),
            "primary_motivation": top_motivation,
            "recommendation": "Offer evening and weekend scheduling. Focus on certification pathways and professional credentials. Create employer referral pipelines post-completion.",
            "content_advice": "Project-based, leadership-focused, real business case studies. Lean into Oracle and AI Academy tracks.",
            "regions":        cc_df["geo_region"].value_counts().head(3).to_dict(),
        })

    # ── Digital Newcomers ─────────────────────────────────────────────────────
    dn_df = df[df["_cohort"] == "digital_newcomers"]
    if not dn_df.empty:
        top_track = _top_value(dn_df["training_track"])
        cohorts.append({
            "id":             "digital_newcomers",
            "name":           "Digital Newcomers",
            "count":          len(dn_df),
            "percentage":     _pct(len(dn_df), total),
            "profile":        "Older learners (45+), public sector employees, not working. Low to zero digital skills. Joining for personal development.",
            "top_track":      TRACK_LABELS.get(top_track, top_track),
            "top_channel":    _top_value(dn_df["access_channel"]),
            "avg_skill_level":_avg_skill(dn_df),
            "primary_motivation": "personal",
            "recommendation": "Self-paced modules with flexible deadlines. Extra support resources and simplified UX. In-person option where possible.",
            "content_advice": "Step-by-step, visual-first, real-life examples. No jargon. Digital Literacy track is the right entry point.",
            "regions":        dn_df["geo_region"].value_counts().head(3).to_dict(),
        })

    # ── Future Builders ───────────────────────────────────────────────────────
    fb_df = df[df["_cohort"] == "future_builders"]
    if not fb_df.empty:
        top_track = _top_value(fb_df["training_track"])
        cohorts.append({
            "id":             "future_builders",
            "name":           "Future Builders",
            "count":          len(fb_df),
            "percentage":     _pct(len(fb_df), total),
            "profile":        "Students and young freelancers aged 18–24. AI-curious, motivated by career growth and job transition. Enrolled mainly via university and NGO channels.",
            "top_track":      TRACK_LABELS.get(top_track, top_track),
            "top_channel":    _top_value(fb_df["access_channel"]),
            "avg_skill_level":_avg_skill(fb_df),
            "primary_motivation": "career_growth",
            "recommendation": "Project-based learning with portfolio outcomes. Create internship and job placement pathways. Hackathon-style challenges to keep engagement high.",
            "content_advice": "Hands-on, fast-paced, collaborative. Lebanon Coding and AI Academy are ideal tracks.",
            "regions":        fb_df["geo_region"].value_counts().head(3).to_dict(),
        })

    # ── Other (catch-all) ─────────────────────────────────────────────────────
    other_df = df[df["_cohort"] == "other"]
    if not other_df.empty:
        top_track = _top_value(other_df["training_track"])
        cohorts.append({
            "id":             "other",
            "name":           "Other",
            "count":          len(other_df),
            "percentage":     _pct(len(other_df), total),
            "profile":        "Learners who do not fit the primary cohort patterns. Mixed profiles.",
            "top_track":      TRACK_LABELS.get(top_track, top_track),
            "top_channel":    _top_value(other_df["access_channel"]),
            "avg_skill_level":_avg_skill(other_df),
            "primary_motivation": "mixed",
            "recommendation": "Survey this group to understand needs. May represent emerging segments worth monitoring.",
            "content_advice": "Personalized pathway assessment recommended.",
            "regions":        other_df["geo_region"].value_counts().head(3).to_dict(),
        })

    logger.info(
        "[cohort_profile] %d learners segmented into %d cohorts.",
        total, len(cohorts),
    )

    return {
        "total_learners": total,
        "cohorts":        cohorts,
    }