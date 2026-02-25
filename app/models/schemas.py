from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class SkillsDistribution(BaseModel):
    digital_literacy: Dict[str, int]
    cybersecurity: Dict[str, int]
    ai_programming: Dict[str, int]
    data_skills: Dict[str, int]


class SummaryResponse(BaseModel):
    total_registrations: int
    completed_registrations: int
    completion_rate: float
    active_surveys: int
    last_updated: str
    by_channel: Dict[str, int]
    by_track: Dict[str, int]
    by_region: Dict[str, int]
    regions_covered: int
    top_track: str
    top_channel: str
    skills_distribution: SkillsDistribution


class SubEntity(BaseModel):
    name: str
    count: int


class GrowthPoint(BaseModel):
    date: str
    count: int
    cumulative: int


class ChannelBreakdown(BaseModel):
    channel: str
    label: str
    count: int
    percentage: float
    sub_entities: List[SubEntity]
    growth: List[GrowthPoint]


class DisseminationResponse(BaseModel):
    total: int
    by_channel: List[ChannelBreakdown]
    growth_over_time: List[GrowthPoint]


class TrackDemand(BaseModel):
    track: str
    label: str
    count: int
    percentage: float


class MotivationItem(BaseModel):
    motivation: str
    label: str
    count: int
    percentage: float


class AiGoalItem(BaseModel):
    goal: str
    label: str
    count: int
    percentage: float


class InterestsResponse(BaseModel):
    by_track: List[TrackDemand]
    motivations: List[MotivationItem]
    ai_goals: List[AiGoalItem]
    skill_gaps: Dict[str, Dict[str, int]]
    age_distribution: Dict[str, int]
    employment_status: Dict[str, int]


class CityCount(BaseModel):
    city: str
    count: int


class RegionStat(BaseModel):
    region: str
    count: int
    percentage: float
    cities: List[CityCount]
    is_underrepresented: bool


class UnderrepresentedRegion(BaseModel):
    region: str
    count: int
    percentage: float
    gap_from_threshold: float
    recommendation: str


class GeographyResponse(BaseModel):
    total_regions: int
    covered_regions: int
    coverage_percentage: float
    underrepresented_threshold: float
    regions: List[RegionStat]
    underrepresented: List[UnderrepresentedRegion]


class LearnerListItem(BaseModel):
    id: str
    name: str
    email: str
    training_track: str
    track_label: str
    channel: str
    channel_label: str
    region: str
    city: str
    age_range: str
    employment_status: str
    submission_status: str
    registered_at: str
    provider_badge: Optional[str]


class LearnersResponse(BaseModel):
    learners: List[LearnerListItem]
    pagination: PaginationMeta


class SkillsProfile(BaseModel):
    digital_literacy: str
    cybersecurity: str
    ai_programming: str
    data_skills: str


class GeoProfile(BaseModel):
    country: str
    region: str
    city: str


class UtmProfile(BaseModel):
    source: Optional[str]
    medium: Optional[str]
    campaign: Optional[str]


class ProviderStatus(BaseModel):
    provider: str
    provider_track: str
    enrollment_date: str
    completion_percentage: float
    modules_completed: int
    total_modules: int
    is_certified: bool
    certificate_id: Optional[str]
    last_activity: Optional[str]


class LearnerProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    age_range: str
    training_track: str
    track_label: str
    access_channel: str
    channel_label: str
    sub_entity: Optional[str]
    employment_status: str
    job_level: str
    experience_years: str
    learning_reason: List[str]
    ai_goals: List[str]
    skills: SkillsProfile
    geo: GeoProfile
    utm: UtmProfile
    registered_at: str
    submission_status: str
    provider_status: Optional[ProviderStatus]


class RefreshResponse(BaseModel):
    success: bool
    message: str
    total_records: int
    timestamp: str
