from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart ATS Hiring Suite"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "smart_ats"
    
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    OPENAI_API_KEY: str | None = None
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM_EMAIL: str = ""
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

print("SMTP_USER from settings =", settings.SMTP_USER)
print("SMTP_FROM_EMAIL =", settings.SMTP_FROM_EMAIL)