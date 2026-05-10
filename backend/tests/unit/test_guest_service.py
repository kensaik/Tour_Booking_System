from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

from src.constants import PaymentStatus
from src.services.guest_service import GuestService


def _make_departure(available_seats=10, days_in_future=10, tour_price=1_000_000.0):
    dep = MagicMock()
    dep.id = 42
    dep.start_date = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=days_in_future)
    dep.available_seats = available_seats
    dep.tour.price = tour_price
    return dep


class TestBookDeparture:
    def test_departure_not_found_returns_404(self, mocker):
        mock_db = mocker.patch("src.services.guest_service.db")
        mock_db.session.get.return_value = None

        result = GuestService.book_departure(guest_id=1, departure_id=99, num_people=2)
        assert result["status"] == 404
        assert "not found" in result["error"].lower()

    def test_past_departure_returns_400(self, mocker):
        past = _make_departure(days_in_future=-1)
        mocker.patch("src.services.guest_service.db.session.get", return_value=past)

        result = GuestService.book_departure(guest_id=1, departure_id=42, num_people=2)
        assert result["status"] == 400
        assert (
            "past" in result["error"].lower()
            or "already started" in result["error"].lower()
        )

    def test_invalid_num_people_returns_400(self, mocker):
        dep = _make_departure()
        mocker.patch("src.services.guest_service.db.session.get", return_value=dep)

        result = GuestService.book_departure(guest_id=1, departure_id=42, num_people=0)
        assert result["status"] == 400
        assert "positive integer" in result["error"]

    def test_insufficient_seats_returns_400(self, mocker):
        dep = _make_departure(available_seats=1)
        mocker.patch("src.services.guest_service.db.session.get", return_value=dep)

        result = GuestService.book_departure(guest_id=1, departure_id=42, num_people=5)
        assert result["status"] == 400
        assert "Not enough seats" in result["error"]
        assert "1 seats left" in result["error"]


class TestProcessPayment:
    def test_missing_fields_returns_400(self):
        result = GuestService.process_payment(
            guest_id=1, booking_id=None, amount=1000, payment_method="VNPAY"
        )
        assert result["status"] == 400
        assert "required" in result["error"]

    def test_non_positive_amount_returns_400(self):
        result = GuestService.process_payment(
            guest_id=1, booking_id=1, amount=0, payment_method="VNPAY"
        )
        assert result["status"] == 400
        assert "positive number" in result["error"]

    def test_booking_not_owned_returns_404(self, mocker):
        other_booking = MagicMock(guest_id=999, total_price=1000.0)
        mocker.patch(
            "src.services.guest_service.db.session.get", return_value=other_booking
        )

        result = GuestService.process_payment(
            guest_id=1, booking_id=5, amount=100, payment_method="VNPAY"
        )
        assert result["status"] == 404
        assert "access denied" in result["error"]

    def test_full_payment_marks_booking_fully_paid(self, mocker):
        booking = MagicMock(guest_id=1, total_price=1000.0)
        mocker.patch("src.services.guest_service.db.session.get", return_value=booking)
        mocker.patch("src.services.guest_service.db.session.add")
        mocker.patch("src.services.guest_service.db.session.commit")

        result = GuestService.process_payment(
            guest_id=1, booking_id=5, amount=1000, payment_method="VNPAY"
        )
        assert result["status"] == 201
        assert booking.payment_status == PaymentStatus.FULLY_PAID

    def test_partial_payment_marks_booking_deposit_paid(self, mocker):
        booking = MagicMock(guest_id=1, total_price=3_000_000.0)
        mocker.patch("src.services.guest_service.db.session.get", return_value=booking)
        mocker.patch("src.services.guest_service.db.session.add")
        mocker.patch("src.services.guest_service.db.session.commit")

        result = GuestService.process_payment(
            guest_id=1, booking_id=5, amount=1_000_000, payment_method="VNPAY"
        )
        assert result["status"] == 201
        assert booking.payment_status == PaymentStatus.DEPOSIT_PAID
