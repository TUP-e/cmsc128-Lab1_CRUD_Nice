import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

JWT_SECRET = os.getenv("JWT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# When true, the reset link is also returned in the API response (local demo only)
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # sessions last 24hours
RESET_TOKEN_EXPIRE_MINUTES = 15

if not SUPABASE_URL or not SUPABASE_KEY or not JWT_SECRET:
    raise ValueError("SUPABASE_URL, SUPABASE_KEY and JWT_SECRET must be set in .env")

# Single shared Supabase client instance, imported by route modules
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)