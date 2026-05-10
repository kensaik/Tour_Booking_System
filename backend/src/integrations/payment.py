"""Payment gateway integration stub.

Default implementation simulates a successful charge so the rest of the system
can run end-to-end without a real provider. Tests monkeypatch
`charge_deposit` to inject deterministic outcomes.
"""

import uuid

from flask import current_app, has_app_context


def charge_deposit(booking_id: int, amount: float) -> dict:
    """Simulate charging a deposit. Returns a transaction stub.

    Real provider wiring (e.g. VNPay, MoMo) replaces this body without
    changing the call signature so service-layer code remains stable.
    """
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
