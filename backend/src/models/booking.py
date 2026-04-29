from datetime import datetime

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

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<Booking {self.id} for Departure {self.departure_id}>"
