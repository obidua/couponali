from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "CouponAli API"
    DEBUG: bool = True
    # Use psycopg (psycopg3) driver explicitly to avoid psycopg2 import
    DATABASE_URL: str = "postgresql+psycopg://postgres:hardik123@localhost:5432/couponali"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "dev-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:3000"
    DEFAULT_PASSWORD: str = "hardik123"

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields in .env file

@lru_cache()
def get_settings() -> Settings:
    return Settings()