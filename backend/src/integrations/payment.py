import uuid

from flask import current_app, has_app_context


def charge_deposit(booking_id: int, amount: float) -> dict:
    transaction_id = f"sim_{uuid.uuid4().hex[:12]}"

    if has_app_context():
        current_app.logger.debug(
            "charge_deposit booking_id=%s amount=%s tx=%s",
            booking_id,
            amount,
            transaction_id,
        )

    return {
        "transaction_id": transaction_id,
        "status": "success",
        "amount": float(amount),
        "booking_id": booking_id,
    }
