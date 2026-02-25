from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    SURVEY_API_BASE_URL: str = "https://numu-survey.codeforlebanon.com"
    SURVEY_API_KEY: str = "cfl_7f3a9b2c8d1e4f6a0b5c3d9e2f4a1b3c"

    CACHE_TTL_SECONDS: int = 300

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    ADMIN_API_KEY: str = "numu_admin_2026"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
