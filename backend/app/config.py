import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

JWT_SECRET = os.getenv("JWT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", FRONTEND_URL).split(",")
    if origin.strip()
]

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").strip().lower() == "true"

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # sessions last 24hours
RESET_TOKEN_EXPIRE_MINUTES = 15

if not SUPABASE_URL or not SUPABASE_KEY or not JWT_SECRET:
    raise ValueError("SUPABASE_URL, SUPABASE_KEY and JWT_SECRET must be set in .env")

# Single shared Supabase client instance, imported by route modules
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
