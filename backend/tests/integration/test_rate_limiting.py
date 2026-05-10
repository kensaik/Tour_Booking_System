"""Rate-limiting integration tests.

Builds a fresh app with `RATELIMIT_ENABLED=True` and resets limiter storage
between tests to avoid cross-test contamination.
"""

import pytest
from flask_jwt_extended import create_access_token
from tests.conftest import TestConfig, make_admin, make_user

from src import create_app
from src.extensions import db
from src.utils.rate_limit import limiter


class _RateLimitConfig(TestConfig):
    RATELIMIT_ENABLED = True


@pytest.fixture
def rl_app():
    app = create_app(config_class=_RateLimitConfig)
    with app.app_context():
        db.create_all()
        limiter.reset()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def rl_client(rl_app):
    return rl_app.test_client()


def _login_payload():
    return {"email": "nope@test.local", "password": "wrong"}


def test_login_burst_returns_429_after_5_attempts(rl_client):
    for _ in range(5):
        rl_client.post("/api/auth/login", json=_login_payload())
    resp = rl_client.post("/api/auth/login", json=_login_payload())
    assert resp.status_code == 429
    assert resp.headers.get("Retry-After") is not None
    body = resp.get_json()
    assert body["error"] == "Too Many Requests"
    assert "message" in body


def test_unrelated_endpoint_unaffected_by_login_limit(rl_client):
    for _ in range(5):
        rl_client.post("/api/auth/login", json=_login_payload())
    resp = rl_client.get("/api/public/tours")
    assert resp.status_code == 200


def test_admin_token_bypasses_login_limit(rl_app, rl_client):
    with rl_app.app_context():
        admin = make_admin()
        token = create_access_token(identity=str(admin.id))
    headers = {"Authorization": f"Bearer {token}"}
    statuses = []
    for _ in range(10):
        resp = rl_client.post("/api/auth/login", json=_login_payload(), headers=headers)
        statuses.append(resp.status_code)
    assert 429 not in statuses


def test_authenticated_users_keyed_separately(rl_app, rl_client):
    """Two users hitting public/tours (60/min) share neither bucket."""
    with rl_app.app_context():
        u1 = make_user()
        u2 = make_user()
        t1 = create_access_token(identity=str(u1.id))
        t2 = create_access_token(identity=str(u2.id))

    # 60/minute on /api/public/tours; spend 30 on user 1, then 30 on user 2 — none should 429
    for _ in range(30):
        r = rl_client.get(
            "/api/public/tours", headers={"Authorization": f"Bearer {t1}"}
        )
        assert r.status_code == 200
    for _ in range(30):
        r = rl_client.get(
            "/api/public/tours", headers={"Authorization": f"Bearer {t2}"}
        )
        assert r.status_code == 200


def test_anonymous_keyed_by_ip(rl_client):
    """6th login attempt from same anon caller is throttled (5/min)."""
    statuses = [
        rl_client.post("/api/auth/login", json=_login_payload()).status_code
        for _ in range(6)
    ]
    assert statuses[-1] == 429
