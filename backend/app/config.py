from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    google_api_key: str
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    environment: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()

