from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "development"
    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg2://smartmetra:smartmetra@localhost:5432/smartmetra"

    JWT_SECRET: str = "dev-secret"
    JWT_ALG: str = "HS256"
    JWT_EXPIRE_MIN: int = 1440

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "./data/faiss.index"
    UPLOAD_DIR: str = "./data/uploads"

    OCR_ENGINE: str = "paddle"
    CORS_ORIGINS: str = "http://localhost:5173"
    DEMO_MODE: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()