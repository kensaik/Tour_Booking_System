"""Unit tests for src.utils.rate_limit helpers."""

from unittest.mock import patch

from flask_jwt_extended import create_access_token
from tests.conftest import make_admin, make_guest

from src.utils import rate_limit as rl


def test_bearer_token_extracts_value(app):
    with app.test_request_context(headers={"Authorization": "Bearer abc.def"}):
        assert rl._bearer_token() == "abc.def"


def test_bearer_token_missing_returns_none(app):
    with app.test_request_context():
        assert rl._bearer_token() is None


def test_bearer_token_non_bearer_returns_none(app):
    with app.test_request_context(headers={"Authorization": "Basic xxxx"}):
        assert rl._bearer_token() is None


def test_decode_silent_returns_none_on_invalid_token(app):
    with app.app_context():
        assert rl._decode_silent("not.a.token") is None


def test_decode_silent_returns_claims_for_valid_token(app):
    with app.app_context():
        token = create_access_token(identity="42")
        claims = rl._decode_silent(token)
        assert claims is not None
        assert claims["sub"] == "42"


def test_key_returns_user_prefix_when_token_present(app):
    with app.app_context():
        token = create_access_token(identity="7")
    with app.test_request_context(headers={"Authorization": f"Bearer {token}"}):
        assert rl._key() == "user:7"


def test_key_falls_back_to_remote_address(app):
    with app.test_request_context(environ_base={"REMOTE_ADDR": "9.9.9.9"}):
        assert rl._key() == "9.9.9.9"


def test_is_admin_returns_false_without_token(app):
    with app.test_request_context():
        assert rl._is_admin() is False


def test_is_admin_returns_false_with_invalid_token(app):
    with (
        app.test_request_context(headers={"Authorization": "Bearer junk"}),
        app.app_context(),
    ):
        assert rl._is_admin() is False


def test_is_admin_true_for_admin_user(app):
    with app.app_context():
        admin = make_admin()
        token = create_access_token(identity=str(admin.id))
    with (
        app.test_request_context(headers={"Authorization": f"Bearer {token}"}),
        app.app_context(),
    ):
        assert rl._is_admin() is True


def test_is_admin_false_for_non_admin_user(app):
    with app.app_context():
        guest = make_guest()
        token = create_access_token(identity=str(guest.id))
    with (
        app.test_request_context(headers={"Authorization": f"Bearer {token}"}),
        app.app_context(),
    ):
        assert rl._is_admin() is False


def test_is_admin_uses_request_cache_on_second_call(app):
    with app.app_context():
        admin = make_admin()
        token = create_access_token(identity=str(admin.id))
    with (
        app.test_request_context(headers={"Authorization": f"Bearer {token}"}),
        app.app_context(),
    ):
        first = rl._is_admin()
        # Force a second call — should hit the cached attribute, not DB.
        from flask import request

        request._rate_limit_admin_cache = "CACHED"
        assert rl._is_admin() == "CACHED"
        assert first is True


def test_admin_exempt_short_circuits_when_perf_profiling_set(app, monkeypatch):
    monkeypatch.setenv("PERF_PROFILING", "1")
    with app.test_request_context(), app.app_context():
        assert rl._admin_exempt() is True


def test_admin_exempt_delegates_to_is_admin(app, monkeypatch):
    monkeypatch.delenv("PERF_PROFILING", raising=False)
    with (
        patch("src.utils.rate_limit._is_admin", return_value=True),
        app.test_request_context(),
    ):
        assert rl._admin_exempt() is True
