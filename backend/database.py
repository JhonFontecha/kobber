from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        # service_role key bypasses RLS — required for backend operations
        key = SUPABASE_SERVICE_KEY or SUPABASE_KEY
        _client = create_client(SUPABASE_URL, key)
    return _client
