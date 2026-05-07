from unittest.mock import MagicMock

from src.constants import BookingStatus
from src.services.company_service import CompanyService


class TestCreateTour:
    def test_missing_required_field_returns_400(self):
        result = CompanyService.create_tour(
            company_id=1,
            data={
                "description": "x",
                "price": 100,
                "total_days": 2,
                "destination_id": 1,
            },
        )
        assert result["status"] == 400
        assert "name" in result["error"]

    def test_invalid_destination_id_returns_400(self, mocker):
        mocker.patch("src.services.company_service.db.session.get", return_value=None)

        result = CompanyService.create_tour(
            company_id=1,
            data={
                "name": "T",
                "description": "d",
                "price": 100,
                "total_days": 2,
                "destination_id": 9999,
            },
        )
        assert result["status"] == 400
        assert "Invalid destination_id" in result["error"]


class TestAddDeparture:
    def test_tour_not_owned_returns_404(self, mocker):
        foreign_tour = MagicMock(company_id=999)
        mocker.patch(
            "src.services.company_service.db.session.get", return_value=foreign_tour
        )

        result = CompanyService.add_departure(
            company_id=1,
            tour_id=5,
            data={
                "start_date": "2026-09-01T08:00:00",
                "end_date": "2026-09-05T17:00:00",
                "total_seats": 10,
            },
        )
        assert result["status"] == 404

    def test_invalid_date_format_returns_400(self, mocker):
        tour = MagicMock(id=5, company_id=1)
        mocker.patch("src.services.company_service.db.session.get", return_value=tour)

        result = CompanyService.add_departure(
            company_id=1,
            tour_id=5,
            data={
                "start_date": "not-a-date",
                "end_date": "2026-09-05T17:00:00",
                "total_seats": 10,
            },
        )
        assert result["status"] == 400
        assert "Invalid date format" in result["error"]

    def test_start_date_after_end_date_returns_400(self, mocker):
        tour = MagicMock(id=5, company_id=1)
        mocker.patch("src.services.company_service.db.session.get", return_value=tour)

        result = CompanyService.add_departure(
            company_id=1,
            tour_id=5,
            data={
                "start_date": "2026-09-10T08:00:00",
                "end_date": "2026-09-01T17:00:00",
                "total_seats": 10,
            },
        )
        assert result["status"] == 400
        assert "start_date must be before end_date" in result["error"]

    def test_zero_total_seats_returns_400(self, mocker):
        tour = MagicMock(id=5, company_id=1)
        mocker.patch("src.services.company_service.db.session.get", return_value=tour)

        result = CompanyService.add_departure(
            company_id=1,
            tour_id=5,
            data={
                "start_date": "2026-09-01T08:00:00",
                "end_date": "2026-09-05T17:00:00",
                "total_seats": 0,
            },
        )
        assert result["status"] == 400
        assert "positive" in result["error"]


class TestUpdateBookingStatus:
    def test_invalid_status_returns_400(self, mocker):
        booking = MagicMock()
        booking.departure.tour.company_id = 1
        booking.booking_status = BookingStatus.PENDING
        mocker.patch(
            "src.services.company_service.db.session.get", return_value=booking
        )

        result = CompanyService.update_booking_status(
            company_id=1, booking_id=10, new_status="FOO"
        )
        assert result["status"] == 400
        assert "Invalid booking status" in result["error"]

    def test_cancellation_returns_seats_to_pool(self, mocker):
        booking = MagicMock()
        booking.departure.tour.company_id = 1
        booking.departure.available_seats = 5
        booking.booking_status = BookingStatus.CONFIRMED
        booking.num_people = 2
        mocker.patch(
            "src.services.company_service.db.session.get", return_value=booking
        )
        mocker.patch("src.services.company_service.db.session.commit")

        result = CompanyService.update_booking_status(
            company_id=1, booking_id=10, new_status=BookingStatus.CANCELLED
        )
        assert result["status"] == 200
        assert booking.departure.available_seats == 7
        assert booking.booking_status == BookingStatus.CANCELLED

    def test_uncancelling_without_seats_returns_400(self, mocker):
        booking = MagicMock()
        booking.departure.tour.company_id = 1
        booking.departure.available_seats = 0
        booking.booking_status = BookingStatus.CANCELLED
        booking.num_people = 2
        mocker.patch(
            "src.services.company_service.db.session.get", return_value=booking
        )

        result = CompanyService.update_booking_status(
            company_id=1, booking_id=10, new_status=BookingStatus.CONFIRMED
        )
        assert result["status"] == 400
        assert "Not enough" in result["error"]
