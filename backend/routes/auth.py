"""Acceso al panel. La contraseña vive solo en variables de entorno del backend.

No hay clave por defecto. Si ADMIN_EMAIL y ADMIN_PASSWORD (o
ADMIN_PASSWORD_SHA256) no están definidos, el login queda cerrado.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()

_TOKEN_TTL = 60 * 60 * 12
_WINDOW = 15 * 60
_MAX_FAILS = 8
_fails: dict[str, list[float]] = defaultdict(list)


class LoginIn(BaseModel):
    email: str
    password: str


def reset_login_limits():
    _fails.clear()


def _secret() -> bytes | None:
    raw = os.getenv("AUTH_SECRET", "").strip()
    if not raw:
        return None
    return raw.encode()


def _digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _eq(left: str, right: str) -> bool:
    return hmac.compare_digest(_digest(left), _digest(right))


def issue_token(email: str) -> str:
    secret = _secret()
    if secret is None:
        raise HTTPException(status_code=503, detail="Falta AUTH_SECRET en el servidor.")
    payload = {"sub": email, "role": "admin", "exp": int(time.time()) + _TOKEN_TTL}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    sig = hmac.new(secret, body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"


def read_token(token: str) -> dict | None:
    secret = _secret()
    if not secret or "." not in token:
        return None
    body, sig = token.rsplit(".", 1)
    expected = hmac.new(secret, body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return None
    padded = body + "=" * (-len(body) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()))
    except (ValueError, json.JSONDecodeError):
        return None
    if payload.get("role") != "admin":
        return None
    if int(payload.get("exp") or 0) < int(time.time()):
        return None
    return payload


def credentials_configured() -> bool:
    email = os.getenv("ADMIN_EMAIL", "").strip()
    password = os.getenv("ADMIN_PASSWORD", "")
    password_hash = os.getenv("ADMIN_PASSWORD_SHA256", "").strip()
    return bool(email and (password or password_hash) and _secret())


def _password_ok(password: str) -> bool:
    expected_hash = os.getenv("ADMIN_PASSWORD_SHA256", "").strip().lower()
    if expected_hash:
        return hmac.compare_digest(_digest(password), expected_hash)
    expected = os.getenv("ADMIN_PASSWORD", "")
    if not expected:
        return False
    return _eq(password, expected)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:80]
    if request.client:
        return request.client.host
    return "unknown"


def _too_many(ip: str) -> bool:
    now = time.time()
    recent = [t for t in _fails[ip] if now - t < _WINDOW]
    _fails[ip] = recent
    return len(recent) >= _MAX_FAILS


def _register_fail(ip: str):
    _fails[ip].append(time.time())


@router.post("/login")
def login(body: LoginIn, request: Request):
    ip = _client_ip(request)
    if _too_many(ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Probá de nuevo más tarde.")

    if not credentials_configured():
        # Misma respuesta de tiempo aproximado: comparamos contra un valor fijo.
        _eq(body.password, "no-configurado")
        raise HTTPException(
            status_code=503,
            detail="El acceso al panel no está configurado en este servidor.",
        )

    email_ok = _eq(body.email.strip().lower(), os.getenv("ADMIN_EMAIL", "").strip().lower())
    password_ok = _password_ok(body.password)
    if not (email_ok and password_ok):
        _register_fail(ip)
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    _fails.pop(ip, None)
    return {"token": issue_token(body.email.strip().lower()), "role": "admin"}


@router.get("/me")
def me(request: Request):
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sesión no válida.")
    payload = read_token(header.split(" ", 1)[1].strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Sesión no válida.")
    return {"email": payload["sub"], "role": "admin"}
