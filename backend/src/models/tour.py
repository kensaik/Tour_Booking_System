from datetime import datetime

from src.constants import DepartureStatus, TourStatus
from src.extensions import db


class Destination(db.Model):
    __tablename__ = "destinations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.Text, nullable=True)

    tours = db.relationship("Tour", backref="destination", lazy="dynamic")

    def __repr__(self):
        return f"<Destination {self.name}>"


class Tour(db.Model):
    __tablename__ = "tours"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(
        db.Integer, db.ForeignKey("company_profiles.id"), nullable=False
    )
    destination_id = db.Column(
        db.Integer, db.ForeignKey("destinations.id"), nullable=False
    )
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    total_days = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default=TourStatus.DRAFT)
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    itineraries = db.relationship(
        "TourItinerary",
        backref="tour",
        lazy="dynamic",
        cascade="all, delete-orphan",
        order_by="TourItinerary.day_number",
    )
    departures = db.relationship(
        "Departure", backref="tour", lazy="dynamic", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Tour {self.name}>"


class TourItinerary(db.Model):
    __tablename__ = "tour_itineraries"

    id = db.Column(db.Integer, primary_key=True)
    tour_id = db.Column(db.Integer, db.ForeignKey("tours.id"), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<TourItinerary Day {self.day_number} - {self.title}>"


class Departure(db.Model):
    __tablename__ = "departures"

    id = db.Column(db.Integer, primary_key=True)
    tour_id = db.Column(db.Integer, db.ForeignKey("tours.id"), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    guide_name = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default=DepartureStatus.PLANNED)

    bookings = db.relationship("Booking", backref="departure", lazy="dynamic")

    def __repr__(self):
        return f"<Departure {self.start_date} (Tour {self.tour_id})>"
