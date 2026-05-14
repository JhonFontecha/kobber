import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

_storage_raw = os.getenv("STORAGE_PATH", "./storage")
STORAGE_PATH = Path(_storage_raw).expanduser().resolve()

DB_PATH      = STORAGE_PATH / "products.db"
IMAGES_PATH  = STORAGE_PATH / "images"
EXPORTS_PATH = STORAGE_PATH / "exports"

def init_storage():
    STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    IMAGES_PATH.mkdir(parents=True, exist_ok=True)
    EXPORTS_PATH.mkdir(parents=True, exist_ok=True)
