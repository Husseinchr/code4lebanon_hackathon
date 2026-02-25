from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd

logger = logging.getLogger(__name__)

TRACK_LABELS: Dict[str, str] = {
    "oracle_technical_leadership": "Technical Leadership, by Oracle",
    "lebanon_coding": "Lebanon Coding",
    "microsoft_ai_academy": "AI Academy, by Microsoft",
    "digital_literacy": "Digital Literacy & Inclusion",
    "national_cybersecurity": "National Cybersecurity",
}

CHANNEL_LABELS: Dict[str, str] = {
    "university": "University",
    "public_sector": "Public Sector",
    "ngo": "Community / NGO",
    "employer": "Employer",
    "other": "Other",
}

AGE_LABELS: Dict[str, str] = {
    "under_18": "Under 18",
    "18_24": "18–24",
    "25_34": "25–34",
    "35_44": "35–44",
    "45_54": "45–54",
    "55_plus": "55+",
}

EMPLOYMENT_LABELS: Dict[str, str] = {
    "student": "Student",
    "full_time": "Employed full-time",
    "part_time": "Employed part-time",
    "freelancer": "Self-employed / Freelancer",
    "entrepreneur": "Entrepreneur / Founder",
    "not_working": "Currently not working",
}

LEARNING_REASON_LABELS: Dict[str, str] = {
    "personal": "Personal interest",
    "career_growth": "Career growth",
    "job_transition": "Job transition",
    "business": "Business needs",
}

AI_GOALS_LABELS: Dict[str, str] = {
    "productivity": "Improve productivity at work",
    "career": "Learn AI for career growth",
    "business_ai": "Apply AI in my business or organization",
    "build_tools": "Build AI tools or applications",
    "strategy": "Understand AI strategy & impact",
    "explore": "Just exploring / curious",
}

SKILL_LEVELS = ["Advanced", "Intermediate", "Basic", "None"]

ALL_REGIONS = [
    "Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon",
    "Bekaa", "Nabatieh", "Akkar", "Baalbek-Hermel",
]

_REGION_MAP: Dict[str, str] = {
    "beirut": "Beirut",
    "mount lebanon": "Mount Lebanon",
    "jabal lubnan": "Mount Lebanon",
    "north lebanon": "North Lebanon",
    "liban-nord": "North Lebanon",
    "liban nord": "North Lebanon",
    "south lebanon": "South Lebanon",
    "liban-sud": "South Lebanon",
    "liban sud": "South Lebanon",
    "bekaa": "Bekaa",
    "beqaa": "Bekaa",
    "nabatieh": "Nabatieh",
    "nabatiyeh": "Nabatieh",
    "akkar": "Akkar",
    "baalbek-hermel": "Baalbek-Hermel",
    "baalbek": "Baalbek-Hermel",
    "hermel": "Baalbek-Hermel",
}


def _normalize_region(raw: Optional[str]) -> str:
    if not raw:
        return "Unknown"
    return _REGION_MAP.get(raw.strip().lower(), raw.strip())


def _get_sub_entity(answers: dict, channel: str) -> Optional[str]:
    mapping = {
        "university": "university_name",
        "public_sector": "public_sector_name",
        "ngo": "ngo_name",
        "employer": "employer_name",
        "other": "other_access_channel",
    }
    key = mapping.get(channel)
    return answers.get(key) if key else None


def _pct(count: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round(count / total * 100, 1)


def _safe_list(val: Any) -> List[str]:
    if isinstance(val, list):
        return val
    if isinstance(val, str) and val:
        return [val]
    return []


def normalize_df(raw_responses: List[dict]) -> pd.DataFrame:
    if not raw_responses:
        return pd.DataFrame()

    rows = []
    for resp in raw_responses:
        answers: dict = resp.get("responses") or {}
        channel = answers.get("access_channel", "") or ""
        sub_entity = _get_sub_entity(answers, channel)
        region = _normalize_region(resp.get("geo_region"))

        rows.append({
            "id":               resp.get("id", ""),
            "survey_id":        resp.get("survey_id", ""),
            "name":             resp.get("respondent_name") or answers.get("name", ""),
            "email":            resp.get("respondent_email") or answers.get("email", ""),
            "phone":            resp.get("respondent_phone") or answers.get("phone", ""),
            "age_range":            answers.get("age_range", ""),
            "training_track":       answers.get("training_track", ""),
            "access_channel":       channel,
            "sub_entity":           sub_entity,
            "employment_status":    answers.get("employment_status", ""),
            "job_level":            answers.get("job_level", ""),
            "experience_years":     answers.get("experience_years", ""),
            "learning_reason":      _safe_list(answers.get("learning_reason")),
            "ai_goals":             _safe_list(answers.get("ai_goals")),
            "digital_literacy_level":   answers.get("digital_literacy_level", ""),
            "cybersecurity_level":       answers.get("cybersecurity_level", ""),
            "ai_programming_level":      answers.get("ai_programming_level", ""),
            "data_skills_level":         answers.get("data_skills_level", ""),
            "geo_country":  resp.get("geo_country", "Lebanon"),
            "geo_region":   region,
            "geo_city":     resp.get("geo_city", ""),
            "utm_source":   resp.get("utm_source") or "",
            "utm_medium":   resp.get("utm_medium") or "",
            "utm_campaign": resp.get("utm_campaign") or "",
            "submission_status": resp.get("submission_status", ""),
            "ip_address":        resp.get("ip_address", ""),
            "user_agent":        resp.get("user_agent", ""),
            "created_at":        pd.to_datetime(resp.get("created_at"), utc=True, errors="coerce"),
            "updated_at":        pd.to_datetime(resp.get("updated_at"), utc=True, errors="coerce"),
        })

    df = pd.DataFrame(rows)
    for col in ("created_at", "updated_at"):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")
    return df


def compute_summary(df: pd.DataFrame) -> dict:
    if df.empty:
        return _empty_summary()

    total = len(df)
    completed = int((df["submission_status"] == "completed").sum())
    by_channel = df["access_channel"].value_counts().to_dict()
    by_track   = df["training_track"].value_counts().to_dict()
    by_region  = df["geo_region"].value_counts().to_dict()
    top_track   = max(by_track, key=by_track.get) if by_track else ""
    top_channel = max(by_channel, key=by_channel.get) if by_channel else ""
    last_dt = df["created_at"].max()
    last_updated = last_dt.isoformat() if pd.notna(last_dt) else datetime.now(timezone.utc).isoformat()

    def _skill_dist(col: str) -> Dict[str, int]:
        counts = df[col].value_counts().to_dict()
        return {lvl: int(counts.get(lvl, 0)) for lvl in SKILL_LEVELS}

    return {
        "total_registrations": total,
        "completed_registrations": completed,
        "completion_rate": round(completed / total, 4) if total else 0.0,
        "active_surveys": 1,
        "last_updated": last_updated,
        "by_channel": {k: int(v) for k, v in by_channel.items()},
        "by_track":   {k: int(v) for k, v in by_track.items()},
        "by_region":  {k: int(v) for k, v in by_region.items()},
        "regions_covered": int(df["geo_region"].nunique()),
        "top_track": top_track,
        "top_channel": top_channel,
        "skills_distribution": {
            "digital_literacy": _skill_dist("digital_literacy_level"),
            "cybersecurity":    _skill_dist("cybersecurity_level"),
            "ai_programming":   _skill_dist("ai_programming_level"),
            "data_skills":      _skill_dist("data_skills_level"),
        },
    }


def _empty_summary() -> dict:
    empty_skills = {lvl: 0 for lvl in SKILL_LEVELS}
    return {
        "total_registrations": 0, "completed_registrations": 0,
        "completion_rate": 0.0, "active_surveys": 1,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "by_channel": {}, "by_track": {}, "by_region": {},
        "regions_covered": 0, "top_track": "", "top_channel": "",
        "skills_distribution": {
            "digital_literacy": empty_skills, "cybersecurity": empty_skills,
            "ai_programming": empty_skills, "data_skills": empty_skills,
        },
    }


def compute_dissemination(df: pd.DataFrame, channel_filter: Optional[str] = None) -> dict:
    if df.empty:
        return {"total": 0, "by_channel": [], "growth_over_time": []}

    total = len(df)
    work_df = df if not channel_filter else df[df["access_channel"] == channel_filter]

    by_channel = []
    for channel, group in df.groupby("access_channel"):
        sub_entities = []
        if channel_filter is None or channel == channel_filter:
            se_counts = group["sub_entity"].dropna().value_counts()
            sub_entities = [{"name": n, "count": int(c)} for n, c in se_counts.items() if n]

        channel_growth = _build_growth_series(group)
        by_channel.append({
            "channel": channel,
            "label": CHANNEL_LABELS.get(channel, channel),
            "count": len(group),
            "percentage": _pct(len(group), total),
            "sub_entities": sub_entities,
            "growth": channel_growth,
        })

    by_channel.sort(key=lambda x: x["count"], reverse=True)
    growth_over_time = _build_growth_series(work_df)

    return {
        "total": len(work_df),
        "by_channel": by_channel,
        "growth_over_time": growth_over_time,
    }


def _build_growth_series(df: pd.DataFrame) -> List[dict]:
    if df.empty or df["created_at"].isna().all():
        return []
    dated = df.dropna(subset=["created_at"]).copy()
    dated["date_str"] = dated["created_at"].dt.strftime("%Y-%m-%d")
    daily = dated.groupby("date_str").size().sort_index()
    cumulative = 0
    result = []
    for date_str, count in daily.items():
        cumulative += int(count)
        result.append({"date": date_str, "count": int(count), "cumulative": cumulative})
    return result


def compute_interests(
    df: pd.DataFrame,
    channel_filter: Optional[str] = None,
    region_filter: Optional[str] = None,
) -> dict:
    if df.empty:
        return _empty_interests()

    work_df = df.copy()
    if channel_filter:
        work_df = work_df[work_df["access_channel"] == channel_filter]
    if region_filter:
        work_df = work_df[work_df["geo_region"] == region_filter]

    total = len(work_df)
    if total == 0:
        return _empty_interests()

    track_counts = work_df["training_track"].value_counts()
    by_track = [
        {
            "track": track,
            "label": TRACK_LABELS.get(track, track),
            "count": int(cnt),
            "percentage": _pct(int(cnt), total),
        }
        for track, cnt in track_counts.items()
    ]

    reason_counts: Dict[str, int] = defaultdict(int)
    for reasons in work_df["learning_reason"]:
        for r in _safe_list(reasons):
            reason_counts[r] += 1
    motivations = [
        {
            "motivation": m,
            "label": LEARNING_REASON_LABELS.get(m, m),
            "count": c,
            "percentage": _pct(c, total),
        }
        for m, c in sorted(reason_counts.items(), key=lambda x: -x[1])
    ]

    goal_counts: Dict[str, int] = defaultdict(int)
    for goals in work_df["ai_goals"]:
        for g in _safe_list(goals):
            goal_counts[g] += 1
    ai_goals = [
        {
            "goal": g,
            "label": AI_GOALS_LABELS.get(g, g),
            "count": c,
            "percentage": _pct(c, total),
        }
        for g, c in sorted(goal_counts.items(), key=lambda x: -x[1])
    ]

    def _gaps(col: str) -> Dict[str, int]:
        counts = work_df[col].value_counts().to_dict()
        return {lvl: int(counts.get(lvl, 0)) for lvl in SKILL_LEVELS}

    age_counts = work_df["age_range"].value_counts().to_dict()
    age_distribution = {k: int(age_counts.get(k, 0)) for k in AGE_LABELS}

    emp_counts = work_df["employment_status"].value_counts().to_dict()
    employment_status = {k: int(emp_counts.get(k, 0)) for k in EMPLOYMENT_LABELS}

    return {
        "by_track": by_track,
        "motivations": motivations,
        "ai_goals": ai_goals,
        "skill_gaps": {
            "digital_literacy": _gaps("digital_literacy_level"),
            "cybersecurity":    _gaps("cybersecurity_level"),
            "ai_programming":   _gaps("ai_programming_level"),
            "data_skills":      _gaps("data_skills_level"),
        },
        "age_distribution": age_distribution,
        "employment_status": employment_status,
    }


def _empty_interests() -> dict:
    empty_gaps = {lvl: 0 for lvl in SKILL_LEVELS}
    return {
        "by_track": [], "motivations": [], "ai_goals": [],
        "skill_gaps": {
            "digital_literacy": empty_gaps, "cybersecurity": empty_gaps,
            "ai_programming": empty_gaps, "data_skills": empty_gaps,
        },
        "age_distribution": {k: 0 for k in AGE_LABELS},
        "employment_status": {k: 0 for k in EMPLOYMENT_LABELS},
    }


UNDERREPRESENTED_THRESHOLD = 10.0


def compute_geography(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "total_regions": len(ALL_REGIONS),
            "covered_regions": 0,
            "coverage_percentage": 0.0,
            "underrepresented_threshold": UNDERREPRESENTED_THRESHOLD,
            "regions": [],
            "underrepresented": [],
        }

    total = len(df)
    region_counts = df.groupby("geo_region").size().to_dict()

    regions = []
    underrepresented = []

    for region in ALL_REGIONS:
        count = int(region_counts.get(region, 0))
        pct = _pct(count, total)
        is_under = (count == 0) or (pct < UNDERREPRESENTED_THRESHOLD)

        region_df = df[df["geo_region"] == region]
        city_counts = region_df["geo_city"].value_counts().to_dict()
        cities = [{"city": c, "count": int(n)} for c, n in city_counts.items() if c]

        regions.append({
            "region": region,
            "count": count,
            "percentage": pct,
            "cities": cities,
            "is_underrepresented": is_under,
        })

        if is_under:
            gap = round(UNDERREPRESENTED_THRESHOLD - pct, 1)
            underrepresented.append({
                "region": region,
                "count": count,
                "percentage": pct,
                "gap_from_threshold": max(gap, 0.0),
                "recommendation": f"Increase outreach in {region} region — currently {pct}% of registrations.",
            })

    for region, count in region_counts.items():
        if region not in ALL_REGIONS and region != "Unknown":
            pct = _pct(int(count), total)
            region_df = df[df["geo_region"] == region]
            city_counts = region_df["geo_city"].value_counts().to_dict()
            cities = [{"city": c, "count": int(n)} for c, n in city_counts.items() if c]
            regions.append({
                "region": region, "count": int(count), "percentage": pct,
                "cities": cities, "is_underrepresented": pct < UNDERREPRESENTED_THRESHOLD,
            })

    regions.sort(key=lambda x: x["count"], reverse=True)
    covered = sum(1 for r in regions if r["count"] > 0)

    return {
        "total_regions": len(ALL_REGIONS),
        "covered_regions": covered,
        "coverage_percentage": _pct(covered, len(ALL_REGIONS)),
        "underrepresented_threshold": UNDERREPRESENTED_THRESHOLD,
        "regions": regions,
        "underrepresented": underrepresented,
    }


def get_learner_list(
    df: pd.DataFrame,
    page: int = 1,
    limit: int = 10,
    channel_filter: Optional[str] = None,
    region_filter: Optional[str] = None,
    track_filter: Optional[str] = None,
    provider_map: Optional[Dict[str, str]] = None,
) -> dict:
    if df.empty:
        return {"learners": [], "pagination": {"page": page, "limit": limit, "total": 0, "total_pages": 0, "has_next": False, "has_prev": False}}

    work_df = df.copy()
    if channel_filter:
        work_df = work_df[work_df["access_channel"] == channel_filter]
    if region_filter:
        work_df = work_df[work_df["geo_region"] == region_filter]
    if track_filter:
        work_df = work_df[work_df["training_track"] == track_filter]

    work_df = work_df.sort_values("created_at", ascending=False, na_position="last")

    total = len(work_df)
    total_pages = max(1, (total + limit - 1) // limit)
    page = max(1, min(page, total_pages))
    start = (page - 1) * limit
    end = start + limit
    page_df = work_df.iloc[start:end]

    learners = []
    for _, row in page_df.iterrows():
        rid = row["id"]
        badge = (provider_map or {}).get(rid)
        learners.append({
            "id": rid,
            "name": row["name"],
            "email": row["email"],
            "training_track": row["training_track"],
            "track_label": TRACK_LABELS.get(row["training_track"], row["training_track"]),
            "channel": row["access_channel"],
            "channel_label": CHANNEL_LABELS.get(row["access_channel"], row["access_channel"]),
            "region": row["geo_region"],
            "city": row["geo_city"],
            "age_range": row["age_range"],
            "employment_status": row["employment_status"],
            "submission_status": row["submission_status"],
            "registered_at": row["created_at"].isoformat() if pd.notna(row["created_at"]) else "",
            "provider_badge": badge,
        })

    return {
        "learners": learners,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


def get_learner_by_id(
    df: pd.DataFrame,
    learner_id: str,
    provider_detail: Optional[dict] = None,
) -> Optional[dict]:
    if df.empty:
        return None
    matches = df[df["id"] == learner_id]
    if matches.empty:
        return None
    row = matches.iloc[0]
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "age_range": row["age_range"],
        "training_track": row["training_track"],
        "track_label": TRACK_LABELS.get(row["training_track"], row["training_track"]),
        "access_channel": row["access_channel"],
        "channel_label": CHANNEL_LABELS.get(row["access_channel"], row["access_channel"]),
        "sub_entity": row.get("sub_entity"),
        "employment_status": row["employment_status"],
        "job_level": row["job_level"],
        "experience_years": row["experience_years"],
        "learning_reason": _safe_list(row["learning_reason"]),
        "ai_goals": _safe_list(row["ai_goals"]),
        "skills": {
            "digital_literacy": row["digital_literacy_level"],
            "cybersecurity":    row["cybersecurity_level"],
            "ai_programming":   row["ai_programming_level"],
            "data_skills":      row["data_skills_level"],
        },
        "geo": {
            "country": row["geo_country"],
            "region":  row["geo_region"],
            "city":    row["geo_city"],
        },
        "utm": {
            "source":   row["utm_source"] or None,
            "medium":   row["utm_medium"] or None,
            "campaign": row["utm_campaign"] or None,
        },
        "registered_at": row["created_at"].isoformat() if pd.notna(row["created_at"]) else "",
        "submission_status": row["submission_status"],
        "provider_status": provider_detail,
    }
