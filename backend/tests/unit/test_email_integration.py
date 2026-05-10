"""Tests for src.integrations.email."""
from unittest.mock import MagicMock, patch

import pytest

from src.integrations import email as email_mod

# Capture the real implementation BEFORE conftest's autouse fixture monkeypatches it.
_real_send_email = email_mod.send_email
_real_send_booking_confirmation = email_mod.send_booking_confirmation
_real_send_booking_cancellation = email_mod.send_booking_cancellation


@pytest.fixture
def configured_app(app):
    app.config["EMAIL_HOST"] = "smtp.test.local"
    app.config["EMAIL_HOST_USER"] = "u@test.local"
    app.config["EMAIL_HOST_PASSWORD"] = "secret"
    app.config["EMAIL_PORT"] = 587
    app.config["EMAIL_USE_TLS"] = True
    return app


def test_send_email_returns_false_when_unconfigured(app):
    with app.app_context():
        # No EMAIL_* config set
        assert _real_send_email("a@b.c", "subj", "body") is False


def test_send_email_success(configured_app):
    fake_server = MagicMock()
    fake_server.__enter__.return_value = fake_server
    with configured_app.app_context(), \
         patch("src.integrations.email.smtplib.SMTP", return_value=fake_server) as smtp:
        ok = _real_send_email("to@x.y", "Hi", "body", html_body="<p>body</p>")
    assert ok is True
    smtp.assert_called_once()
    fake_server.starttls.assert_called_once()
    fake_server.login.assert_called_once_with("u@test.local", "secret")
    fake_server.sendmail.assert_called_once()


def test_send_email_no_tls(configured_app):
    configured_app.config["EMAIL_USE_TLS"] = False
    fake_server = MagicMock()
    fake_server.__enter__.return_value = fake_server
    with configured_app.app_context(), \
         patch("src.integrations.email.smtplib.SMTP", return_value=fake_server):
        ok = _real_send_email("to@x.y", "Hi", "body")
    assert ok is True
    fake_server.starttls.assert_not_called()


def test_send_email_smtp_error_returns_false(configured_app):
    with configured_app.app_context(), \
         patch("src.integrations.email.smtplib.SMTP", side_effect=RuntimeError("boom")):
        assert _real_send_email("to@x.y", "s", "b") is False


def test_send_booking_confirmation_invokes_send_email(configured_app, monkeypatch):
    captured = {}

    def fake_send(to, subject, body, html_body=None):
        captured.update(to=to, subject=subject, body=body, html_body=html_body)
        return True

    monkeypatch.setattr(email_mod, "send_email", fake_send)
    ok = _real_send_booking_confirmation(
        "guest@x.y",
        {
            "booking_id": 42,
            "guest_name": "Ann",
            "tour_name": "Halong",
            "departure_date": "2026-06-01",
            "guests_count": 2,
            "total_price": 1500000,
        },
    )
    assert ok is True
    assert captured["to"] == "guest@x.y"
    assert "42" in captured["subject"]
    assert "Halong" in captured["body"]
    assert "Halong" in captured["html_body"]


def test_send_booking_cancellation_invokes_send_email(configured_app, monkeypatch):
    monkeypatch.setattr(email_mod, "send_email", lambda *a, **kw: True)
    ok = _real_send_booking_cancellation(
        "guest@x.y",
        {
            "booking_id": 7,
            "guest_name": "Bob",
            "tour_name": "Sapa",
            "departure_date": "2026-07-01",
        },
    )
    assert ok is True
