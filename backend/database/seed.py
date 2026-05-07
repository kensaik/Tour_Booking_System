import os
import sys
from datetime import datetime, timedelta

from src import create_app
from src.constants import DepartureStatus, TourStatus, UserRole
from src.extensions import db
from src.models.tour import Departure, Destination, Tour
from src.models.user import CompanyProfile, GuestProfile, User
from src.utils.auth import hash_password

ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "Admin@123"
COMPANY_APPROVED_EMAIL = "abc@travel.com"
COMPANY_APPROVED_PASSWORD = "Company@123"
COMPANY_PENDING_EMAIL = "pending@travel.com"
COMPANY_PENDING_PASSWORD = "Company@123"
GUEST_EMAIL = "a@gmail.com"
GUEST_PASSWORD = "Guest@123"


def _refuse_in_production():
    if os.environ.get("FLASK_ENV") == "production":
        print("Refusing to seed: FLASK_ENV=production", file=sys.stderr)
        sys.exit(1)


def _get_or_create_user(email, password, role, **extras):
    user = User.query.filter_by(email=email).first()
    if user:
        return user, False
    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_active=extras.pop("is_active", True),
    )
    db.session.add(user)
    db.session.flush()
    return user, True


def _seed_admin():
    user, created = _get_or_create_user(
        ADMIN_EMAIL, ADMIN_PASSWORD, UserRole.ADMIN
    )
    return user, created


def _seed_company(email, password, company_name, is_approved):
    user, created = _get_or_create_user(email, password, UserRole.COMPANY)
    if created or not user.company_profile:
        profile = CompanyProfile(
            user_id=user.id,
            company_name=company_name,
            description=f"{company_name} description",
            commission_rate=10.0,
            is_approved=is_approved,
        )
        db.session.add(profile)
        db.session.flush()
    return user


def _seed_guest():
    user, created = _get_or_create_user(GUEST_EMAIL, GUEST_PASSWORD, UserRole.GUEST)
    if created or not user.guest_profile:
        profile = GuestProfile(
            user_id=user.id,
            full_name="Sample Guest",
            phone_number="0900000000",
        )
        db.session.add(profile)
        db.session.flush()
    return user


def _seed_destination(name, description=""):
    dest = Destination.query.filter_by(name=name).first()
    if dest:
        return dest
    dest = Destination(name=name, description=description)
    db.session.add(dest)
    db.session.flush()
    return dest


def _seed_tour(company_user, destination, name, price=1500000.0, total_days=3):
    tour = Tour.query.filter_by(name=name).first()
    if tour:
        return tour
    tour = Tour(
        company_id=company_user.company_profile.id,
        destination_id=destination.id,
        name=name,
        description=f"{name} description",
        price=price,
        total_days=total_days,
        status=TourStatus.ACTIVE,
    )
    db.session.add(tour)
    db.session.flush()
    return tour


def _seed_departure(tour, total_seats=20):
    existing = Departure.query.filter_by(tour_id=tour.id).first()
    if existing:
        return existing
    start = datetime.utcnow() + timedelta(days=30)
    end = start + timedelta(days=tour.total_days)
    dep = Departure(
        tour_id=tour.id,
        start_date=start,
        end_date=end,
        total_seats=total_seats,
        available_seats=total_seats,
        guide_name="Seed Guide",
        status=DepartureStatus.PLANNED,
    )
    db.session.add(dep)
    db.session.flush()
    return dep


def seed():
    _refuse_in_production()
    app = create_app()
    with app.app_context():
        db.create_all()

        _seed_admin()
        approved = _seed_company(
            COMPANY_APPROVED_EMAIL,
            COMPANY_APPROVED_PASSWORD,
            "ABC Travel",
            is_approved=True,
        )
        _seed_company(
            COMPANY_PENDING_EMAIL,
            COMPANY_PENDING_PASSWORD,
            "Pending Travel",
            is_approved=False,
        )
        _seed_guest()

        dalat = _seed_destination("Đà Lạt", "Thành phố ngàn hoa")
        _seed_destination("Phú Quốc", "Đảo ngọc phía Nam")
        _seed_destination("Paris", "Kinh đô ánh sáng")

        tour = _seed_tour(approved, dalat, "Tour Đà Lạt 3 ngày")
        _seed_departure(tour, total_seats=20)

        db.session.commit()
        print(
            f"Seed complete: admin={ADMIN_EMAIL}, "
            f"company_approved={COMPANY_APPROVED_EMAIL}, "
            f"company_pending={COMPANY_PENDING_EMAIL}, guest={GUEST_EMAIL}"
        )


if __name__ == "__main__":
    seed()
