import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Forge Sentinel"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./forge_sentinel.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "forge_sentinel_hackathon_super_secret_jwt_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
