import time
from collections import defaultdict

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 10):
        super().__init__(app)
        self.rate = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/api/fertilizer/calculate":
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            window = now - 60

            self.requests[client_ip] = [
                t for t in self.requests[client_ip] if t > window
            ]

            if len(self.requests[client_ip]) >= self.rate:
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": "请求过于频繁，请每分钟不超过10次",
                    },
                )

            self.requests[client_ip].append(now)

        return await call_next(request)
