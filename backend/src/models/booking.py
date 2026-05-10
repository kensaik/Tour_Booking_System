from datetime import datetime, timezone


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

from src.constants import BookingStatus, PaymentStatus
from src.extensions import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    guest_id = db.Column(db.Integer, db.ForeignKey("guest_profiles.id"), nullable=False)
    departure_id = db.Column(db.Integer, db.ForeignKey("departures.id"), nullable=False)

    num_people = db.Column(db.Integer, nullable=False, default=1)
    total_price = db.Column(db.Float, nullable=False)

    payment_status = db.Column(db.String(20), default=PaymentStatus.UNPAID)
    booking_status = db.Column(db.String(20), default=BookingStatus.PENDING)

    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(
        db.DateTime, default=_utcnow, onupdate=_utcnow
    )

    payments = db.relationship(
        "Payment", backref="booking", lazy="dynamic", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Booking {self.id} for Departure {self.departure_id}>"


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="SUCCESS")
    created_at = db.Column(db.DateTime, default=_utcnow)

    def __repr__(self):
        return f"<Payment {self.id} for Booking {self.booking_id}>"
