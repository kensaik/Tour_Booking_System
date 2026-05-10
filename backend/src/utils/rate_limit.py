"""Flask-Limiter wiring: per-user/per-IP keys with admin bypass."""

from flask import request
from flask_jwt_extended import decode_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.constants import UserRole


def _bearer_token():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _decode_silent(token):
    try:
        return decode_token(token)
    except Exception:
        return None


def _key():
    token = _bearer_token()
    if token:
        claims = _decode_silent(token)
        if claims and claims.get("sub"):
            return f"user:{claims['sub']}"
    return get_remote_address()


def _is_admin():
    """Bypass callback: True when caller is an authenticated admin."""
    token = _bearer_token()
    if not token:
        return False
    claims = _decode_silent(token)
    if not claims:
        return False
    user_id = claims.get("sub")
    if not user_id:
        return False

    cache = getattr(request, "_rate_limit_admin_cache", None)
    if cache is not None:
        return cache
    from src.extensions import db
    from src.models.user import User

    user = db.session.get(User, user_id)
    is_admin = bool(user and user.role == UserRole.ADMIN)
    request._rate_limit_admin_cache = is_admin
    return is_admin


limiter = Limiter(
    key_func=_key,
    default_limits=["200/minute"],
    default_limits_exempt_when=_is_admin,
    storage_uri="memory://",
)


@limiter.request_filter
def _admin_exempt():
    """Skip ALL limits (default + per-route) when caller is admin.

    Also bypassed entirely when PERF_PROFILING is set, so the perf rig
    can exercise endpoint code (not the limiter) and surface real
    bottlenecks. Documented in perf/README.md.

    Bypassed when DISABLE_RATE_LIMIT is truthy — used by Playwright E2E
    where workers share one IP and the 5/min login cap would 429 every
    fixture login after the first handful.
    """
    import os

    if os.environ.get("PERF_PROFILING"):
        return True
    if os.environ.get("DISABLE_RATE_LIMIT", "").lower() in {"1", "true", "yes"}:
        return True
    return _is_admin()
