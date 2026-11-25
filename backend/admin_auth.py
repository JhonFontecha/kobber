"""Login del panel contra Supabase Auth.

El rol de administrador vive en app_metadata.role (raw_app_meta_data).
No se lee user_metadata: el usuario puede editar ese campo.
"""
from __future__ import annotations

from fastapi import HTTPException, Request


class AuthError(Exception):
    def __init__(self, status: int, detail: str):
        self.status = status
        self.detail = detail
        super().__init__(detail)


def _client():
    from config import SUPABASE_KEY, SUPABASE_URL
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise AuthError(503, "Falta SUPABASE_URL o SUPABASE_KEY en el servidor.")
    from supabase import create_client
    # La anon key alcanza para sign-in y para get_user. La service role no hace falta.
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def _as_dict(value):
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    if hasattr(value, "__dict__"):
        return dict(value.__dict__)
    return {}


def _user(result):
    if result is None:
        return None
    if isinstance(result, dict):
        return result.get("user")
    return getattr(result, "user", None)


def _app_metadata(user) -> dict:
    if user is None:
        return {}
    raw = user.get("app_metadata") if isinstance(user, dict) else getattr(user, "app_metadata", None)
    return _as_dict(raw)


def _email(user) -> str:
    if isinstance(user, dict):
        return user.get("email") or ""
    return getattr(user, "email", None) or ""


def _uid(user) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or "")
    return str(getattr(user, "id", "") or "")


def _is_admin(user) -> bool:
    return _app_metadata(user).get("role") == "admin"


def sign_in(email: str, password: str) -> dict:
    client = _client()
    try:
        result = client.auth.sign_in_with_password({"email": email, "password": password})
    except AuthError:
        raise
    except Exception:
        raise AuthError(401, "Correo o contraseña incorrectos.")

    user = _user(result)
    session = result.get("session") if isinstance(result, dict) else getattr(result, "session", None)
    token = None
    if isinstance(session, dict):
        token = session.get("access_token")
    elif session is not None:
        token = getattr(session, "access_token", None)
    if not user or not token:
        raise AuthError(401, "Correo o contraseña incorrectos.")
    if not _is_admin(user):
        raise AuthError(403, "Esta cuenta no tiene acceso al panel.")
    return {"token": token, "email": _email(user), "role": "admin"}


def current_admin(token: str) -> dict:
    if not token:
        raise AuthError(401, "Sesión no válida.")
    client = _client()
    try:
        result = client.auth.get_user(token)
    except AuthError:
        raise
    except Exception:
        raise AuthError(401, "Sesión no válida.")
    user = _user(result)
    if not user:
        raise AuthError(401, "Sesión no válida.")
    if not _is_admin(user):
        raise AuthError(403, "Esta cuenta no tiene acceso al panel.")
    return {"email": _email(user), "sub": _uid(user), "role": "admin"}


def require_admin(request: Request) -> dict:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sesión no válida.")
    try:
        return current_admin(header.split(" ", 1)[1].strip())
    except AuthError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.detail)
