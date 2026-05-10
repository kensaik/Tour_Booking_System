from datetime import datetime

from src.constants import UserRole
from src.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default=UserRole.GUEST)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    company_profile = db.relationship(
        "CompanyProfile", backref="user", uselist=False, cascade="all, delete-orphan"
    )
    guest_profile = db.relationship(
        "GuestProfile", backref="user", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class CompanyProfile(db.Model):
    __tablename__ = "company_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )
    company_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    commission_rate = db.Column(db.Float, default=10.0)  # Admin configures this
    is_approved = db.Column(db.Boolean, default=False)  # Admin needs to approve

    tours = db.relationship("Tour", backref="company", lazy="dynamic")

    @property
    def total_revenue(self):
        from src.models.booking import Booking, Payment
        from src.models.tour import Departure, Tour

        revenue = (
            db.session.query(db.func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Departure, Booking.departure_id == Departure.id)
            .join(Tour, Departure.tour_id == Tour.id)
            .filter(
                Tour.company_id == self.id,
                Booking.booking_status == "confirmed",
                Payment.status == "SUCCESS",
            )
            .scalar()
            or 0
        )
        return float(revenue)

    @property
    def tours_count(self):
        return self.tours.filter_by(status="active").count()

    @property
    def bookings_count(self):
        from src.models.booking import Booking
        from src.models.tour import Departure, Tour

        return (
            Booking.query.join(Departure, Booking.departure_id == Departure.id)
            .join(Tour, Departure.tour_id == Tour.id)
            .filter(Tour.company_id == self.id)
            .count()
        )

    def __repr__(self):
        return f"<CompanyProfile {self.company_name}>"


class GuestProfile(db.Model):
    __tablename__ = "guest_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )
    full_name = db.Column(db.String(150), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)

    bookings = db.relationship("Booking", backref="guest", lazy="dynamic")

    def __repr__(self):
        return f"<GuestProfile {self.full_name}>"
