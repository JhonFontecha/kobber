"""Acceso al panel. La contraseña la verifica Supabase Auth.

Hace falta un usuario con app_metadata.role = "admin". Los pasos para crear
el primero están en CLAUDE.md. No hay clave en el código ni en variables de entorno.
"""
from __future__ import annotations

import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from admin_auth import AuthError, current_admin, sign_in

router = APIRouter()

_WINDOW = 15 * 60
_MAX_FAILS = 8
_fails: dict[str, list[float]] = defaultdict(list)


class LoginIn(BaseModel):
    email: str
    password: str


def reset_login_limits():
    _fails.clear()


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


def _bearer(request: Request) -> str:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sesión no válida.")
    return header.split(" ", 1)[1].strip()


@router.post("/login")
def login(body: LoginIn, request: Request):
    ip = _client_ip(request)
    if _too_many(ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Probá de nuevo más tarde.")
    try:
        session = sign_in(body.email.strip(), body.password)
    except AuthError as exc:
        if exc.status in (401, 403):
            _fails[ip].append(time.time())
        raise HTTPException(status_code=exc.status, detail=exc.detail)
    _fails.pop(ip, None)
    return session


@router.get("/me")
def me(request: Request):
    try:
        admin = current_admin(_bearer(request))
    except AuthError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.detail)
    return {"email": admin["email"], "role": "admin"}
