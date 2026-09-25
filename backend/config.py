import os
from dotenv import load_dotenv
from runtime_paths import BACKEND_DIR, project_path

# Load from the directory where this file lives, regardless of cwd
load_dotenv(BACKEND_DIR / ".env")

ANTHROPIC_API_KEY    = os.getenv("ANTHROPIC_API_KEY", "")
SUPABASE_URL         = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY         = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

_storage_raw = os.getenv("STORAGE_PATH", "./storage")
STORAGE_PATH = project_path(_storage_raw)
EXPORTS_PATH = STORAGE_PATH / "exports"

def init_storage():
    STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    EXPORTS_PATH.mkdir(parents=True, exist_ok=True)
