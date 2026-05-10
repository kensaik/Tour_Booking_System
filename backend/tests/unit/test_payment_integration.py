"""Tests for src.integrations.payment."""

from src.integrations import payment as payment_mod

# Capture original before conftest autouse fixture patches it.
_real_charge_deposit = payment_mod.charge_deposit


def test_charge_deposit_outside_app_context():
    result = _real_charge_deposit(123, 250000.0)
    assert result["status"] == "success"
    assert result["booking_id"] == 123
    assert result["amount"] == 250000.0
    assert result["transaction_id"].startswith("sim_")


def test_charge_deposit_inside_app_context(app):
    with app.app_context():
        result = _real_charge_deposit(7, 100)
    assert result["booking_id"] == 7
    assert result["amount"] == 100.0
    assert result["transaction_id"].startswith("sim_")
