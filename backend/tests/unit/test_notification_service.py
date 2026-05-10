"""Tests for src.services.notification_service.NotificationService."""
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from src.services.notification_service import NotificationService


@pytest.fixture(autouse=True)
def _reset_config():
    original = dict(NotificationService._config)
    yield
    NotificationService._config.clear()
    NotificationService._config.update(original)


def _make_booking(payment_status="unpaid"):
    booking = MagicMock()
    booking.id = 99
    booking.contact_name = "Tester"
    booking.contact_email = "guest@x.y"
    booking.contact_phone = "0900000000"
    booking.num_people = 2
    booking.total_price = 1500000
    booking.payment_status = payment_status
    booking.departure.start_date = datetime(2026, 6, 1)
    booking.departure.tour.name = "Halong Bay"
    booking.departure.tour.company.company_name = "Co"
    return booking


def test_configure_updates_config():
    NotificationService.configure(
        smtp_host="smtp.test", smtp_port=2525, smtp_user="u",
        smtp_password="p", from_name="Brand", enabled=True,
    )
    cfg = NotificationService._config
    assert cfg["smtp_host"] == "smtp.test"
    assert cfg["smtp_port"] == 2525
    assert cfg["smtp_user"] == "u"
    assert cfg["smtp_password"] == "p"
    assert cfg["from_name"] == "Brand"
    assert cfg["enabled"] is True


def test_send_email_when_disabled_returns_true_without_smtp():
    NotificationService._config["enabled"] = False
    with patch("src.services.notification_service.smtplib.SMTP") as smtp:
        result = NotificationService._send_email("a@b.c", "subj", "<p>x</p>")
    assert result is True
    smtp.assert_not_called()


def test_send_email_when_enabled_calls_smtp():
    NotificationService.configure(
        smtp_host="smtp.test", smtp_port=587, smtp_user="u",
        smtp_password="p", enabled=True,
    )
    fake = MagicMock()
    fake.__enter__.return_value = fake
    with patch("src.services.notification_service.smtplib.SMTP", return_value=fake):
        ok = NotificationService._send_email(
            "to@x.y", "subj", "<p>html</p>", text_body="text"
        )
    assert ok is True
    fake.starttls.assert_called_once()
    fake.login.assert_called_once_with("u", "p")
    fake.send_message.assert_called_once()


def test_send_email_swallows_exception_returns_false():
    NotificationService._config["enabled"] = True
    with patch(
        "src.services.notification_service.smtplib.SMTP",
        side_effect=RuntimeError("nope"),
    ):
        assert NotificationService._send_email("a@b.c", "s", "<p>b</p>") is False


def test_send_booking_confirmation_invokes_send_email():
    NotificationService._config["enabled"] = False
    booking = _make_booking(payment_status="fully_paid")
    with patch.object(
        NotificationService, "_send_email", return_value=True
    ) as send:
        result = NotificationService.send_booking_confirmation(booking, "g@x.y")
    assert result is True
    args, _ = send.call_args
    assert args[0] == "g@x.y"
    assert "#99" in args[1]
    assert "Halong Bay" in args[2]


def test_send_payment_confirmation_invokes_send_email():
    booking = _make_booking()
    with patch.object(
        NotificationService, "_send_email", return_value=True
    ) as send:
        NotificationService.send_payment_confirmation(booking, "g@x.y")
    assert send.called


def test_send_booking_to_company_invokes_send_email():
    booking = _make_booking()
    with patch.object(
        NotificationService, "_send_email", return_value=True
    ) as send:
        NotificationService.send_booking_to_company(booking, "co@x.y")
    args, _ = send.call_args
    assert args[0] == "co@x.y"
    assert "Co" in args[2]


def test_send_booking_status_update_known_status():
    booking = _make_booking()
    with patch.object(
        NotificationService, "_send_email", return_value=True
    ) as send:
        NotificationService.send_booking_status_update(booking, "g@x.y", "confirmed")
    args, _ = send.call_args
    assert "đã được xác nhận" in args[2]


def test_send_booking_status_update_unknown_status_falls_back():
    booking = _make_booking()
    with patch.object(
        NotificationService, "_send_email", return_value=True
    ) as send:
        NotificationService.send_booking_status_update(booking, "g@x.y", "weird")
    args, _ = send.call_args
    assert "weird" in args[2]
