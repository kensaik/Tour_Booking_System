import uuid
from datetime import datetime, timedelta

import pytest
from flask_jwt_extended import create_access_token

from src import create_app
from src.config import Config
from src.constants import (
    BookingStatus,
    DepartureStatus,
    PaymentStatus,
    TourStatus,
    UserRole,
)
from src.extensions import db
from src.integrations import email as email_integration, payment as payment_integration
from src.models.booking import Booking, Payment
from src.models.tour import Departure, Destination, Tour, TourItinerary
from src.models.user import CompanyProfile, GuestProfile, User
from src.utils.auth import hash_password


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret-key"


@pytest.fixture
def app():
    app = create_app(config_class=TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def _patch_integrations(monkeypatch):
    def _fake_charge(booking_id, amount):
        return {
            "transaction_id": f"test_tx_{booking_id}",
            "status": "success",
            "amount": float(amount),
            "booking_id": booking_id,
        }

    def _fake_send(to, subject, body):
        return True

    monkeypatch.setattr(payment_integration, "charge_deposit", _fake_charge)
    monkeypatch.setattr(email_integration, "send_email", _fake_send)
    yield


def _uniq(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:8]}"


def make_user(
    role: str = UserRole.GUEST,
    email: str | None = None,
    password: str = "Pass123!",
    is_active: bool = True,
    **profile_overrides,
) -> User:
    user = User(
        email=email or f"user_{_uniq()}@test.local",
        password_hash=hash_password(password),
        role=role,
        is_active=is_active,
    )
    db.session.add(user)
    db.session.flush()

    if role == UserRole.COMPANY:
        company = CompanyProfile(
            user_id=user.id,
            company_name=profile_overrides.pop("company_name", f"Company {_uniq()}"),
            description=profile_overrides.pop("description", ""),
            commission_rate=profile_overrides.pop("commission_rate", 10.0),
            is_approved=profile_overrides.pop("is_approved", False),
        )
        db.session.add(company)
    elif role == UserRole.GUEST:
        guest = GuestProfile(
            user_id=user.id,
            full_name=profile_overrides.pop("full_name", f"Guest {_uniq()}"),
            phone_number=profile_overrides.pop("phone_number", "0900000000"),
        )
        db.session.add(guest)

    db.session.commit()
    db.session.refresh(user)
    return user


def make_company(approved: bool = True, **kwargs) -> User:
    kwargs.setdefault("is_approved", approved)
    return make_user(role=UserRole.COMPANY, **kwargs)


def make_guest(**kwargs) -> User:
    return make_user(role=UserRole.GUEST, **kwargs)


def make_admin(**kwargs) -> User:
    kwargs.setdefault("email", f"admin_{_uniq()}@test.local")
    return make_user(role=UserRole.ADMIN, **kwargs)


def make_destination(name: str | None = None, **kwargs) -> Destination:
    dest = Destination(
        name=name or f"Destination {_uniq()}",
        description=kwargs.pop("description", "A scenic test destination"),
        image_url=kwargs.pop("image_url", None),
    )
    db.session.add(dest)
    db.session.commit()
    return dest


def make_tour(
    company_user: User,
    destination: Destination | None = None,
    status: str = TourStatus.ACTIVE,
    **kwargs,
) -> Tour:
    if destination is None:
        destination = make_destination()

    tour = Tour(
        company_id=company_user.company_profile.id,
        destination_id=destination.id,
        name=kwargs.pop("name", f"Tour {_uniq()}"),
        description=kwargs.pop("description", "Test tour description"),
        price=float(kwargs.pop("price", 1_500_000.0)),
        total_days=int(kwargs.pop("total_days", 3)),
        status=status,
        image_url=kwargs.pop("image_url", None),
    )
    db.session.add(tour)
    db.session.commit()
    return tour


def make_itinerary(tour: Tour, day_number: int = 1, **kwargs) -> TourItinerary:
    iti = TourItinerary(
        tour_id=tour.id,
        day_number=day_number,
        title=kwargs.pop("title", f"Day {day_number}"),
        description=kwargs.pop("description", "Test itinerary day"),
    )
    db.session.add(iti)
    db.session.commit()
    return iti


def make_departure(
    tour: Tour,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    total_seats: int = 10,
    available_seats: int | None = None,
    status: str = DepartureStatus.PLANNED,
    **kwargs,
) -> Departure:
    start = start_date or (datetime.utcnow() + timedelta(days=30))
    end = end_date or (start + timedelta(days=tour.total_days or 3))
    dep = Departure(
        tour_id=tour.id,
        start_date=start,
        end_date=end,
        total_seats=total_seats,
        available_seats=total_seats if available_seats is None else available_seats,
        guide_name=kwargs.pop("guide_name", "Test Guide"),
        status=status,
    )
    db.session.add(dep)
    db.session.commit()
    return dep


def make_booking(
    guest_user: User,
    departure: Departure,
    num_people: int = 1,
    booking_status: str = BookingStatus.PENDING,
    payment_status: str = PaymentStatus.UNPAID,
    **kwargs,
) -> Booking:
    total_price = kwargs.pop("total_price", float(departure.tour.price) * num_people)
    booking = Booking(
        guest_id=guest_user.guest_profile.id,
        departure_id=departure.id,
        num_people=num_people,
        total_price=total_price,
        booking_status=booking_status,
        payment_status=payment_status,
    )
    db.session.add(booking)
    db.session.commit()
    return booking


def make_payment(booking: Booking, amount: float | None = None, **kwargs) -> Payment:
    payment = Payment(
        booking_id=booking.id,
        amount=float(amount if amount is not None else booking.total_price),
        payment_method=kwargs.pop("payment_method", "VNPAY"),
        status=kwargs.pop("status", "SUCCESS"),
    )
    db.session.add(payment)
    db.session.commit()
    return payment


class _AuthClient:
    def __init__(self, client, token: str):
        self._client = client
        self._headers = {"Authorization": f"Bearer {token}"}

    def _merged_headers(self, kwargs):
        headers = dict(kwargs.pop("headers", {}) or {})
        headers.update(self._headers)
        return headers

    def get(self, *args, **kwargs):
        return self._client.get(*args, headers=self._merged_headers(kwargs), **kwargs)

    def post(self, *args, **kwargs):
        return self._client.post(*args, headers=self._merged_headers(kwargs), **kwargs)

    def put(self, *args, **kwargs):
        return self._client.put(*args, headers=self._merged_headers(kwargs), **kwargs)

    def delete(self, *args, **kwargs):
        return self._client.delete(
            *args, headers=self._merged_headers(kwargs), **kwargs
        )


@pytest.fixture
def auth_client(client):
    def _factory(user: User) -> _AuthClient:
        token = create_access_token(identity=str(user.id))
        return _AuthClient(client, token)

    return _factory


@pytest.fixture
def guest_user(app):
    return make_guest()


@pytest.fixture
def company_pending(app):
    return make_company(approved=False)


@pytest.fixture
def company_approved(app):
    return make_company(approved=True)


@pytest.fixture
def admin_user(app):
    return make_admin()


__all__ = [
    "TestConfig",
    "make_admin",
    "make_booking",
    "make_company",
    "make_departure",
    "make_destination",
    "make_guest",
    "make_itinerary",
    "make_payment",
    "make_tour",
    "make_user",
]
