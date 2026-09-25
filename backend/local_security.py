"""Defence in depth for the local administrator API, not remote authentication."""
from starlette.responses import JSONResponse

LOCAL_ORIGINS = {f"http://{host}:{port}" for host in ("127.0.0.1", "localhost") for port in (5173, 8000)}


class LocalOnlyMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            client = scope.get("client")
            origin = headers.get(b"origin", b"").decode("latin1")
            if (not client or client[0] not in {"127.0.0.1", "::1"}
                    or (origin and origin not in LOCAL_ORIGINS)
                    or headers.get(b"sec-fetch-site") == b"cross-site"):
                await JSONResponse({"detail": "Acceso permitido solo desde Kobber local."}, status_code=403)(scope, receive, send)
                return
        await self.app(scope, receive, send)
