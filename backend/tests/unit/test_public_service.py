"""Unit tests for src.services.public_service.PublicService."""
from datetime import datetime, timedelta
from unittest.mock import MagicMock

from tests.conftest import (
    make_company,
    make_departure,
    make_destination,
    make_tour,
)

from src.constants import TourStatus
from src.services.public_service import PublicService


class TestSearchActiveToursIntegration:
    def test_no_filters_returns_only_active(self, app):
        company = make_company(approved=True)
        active = make_tour(company, status=TourStatus.ACTIVE, name="Active")
        make_tour(company, status=TourStatus.DRAFT, name="Draft")
        results = PublicService.search_active_tours()
        ids = [t.id for t in results]
        assert active.id in ids
        assert len(ids) == 1

    def test_destination_filter_narrows(self, app):
        company = make_company(approved=True)
        d1 = make_destination(name="Halong")
        d2 = make_destination(name="Sapa")
        t1 = make_tour(company, destination=d1, status=TourStatus.ACTIVE)
        make_tour(company, destination=d2, status=TourStatus.ACTIVE)
        results = PublicService.search_active_tours(destination_id=str(d1.id))
        assert [t.id for t in results] == [t1.id]

    def test_keyword_filter_matches_name(self, app):
        company = make_company(approved=True)
        t1 = make_tour(company, name="Halong Bay Cruise", status=TourStatus.ACTIVE)
        make_tour(company, name="Da Nang Beach", status=TourStatus.ACTIVE)
        results = PublicService.search_active_tours(keyword="halong")
        assert [t.id for t in results] == [t1.id]

    def test_start_date_and_min_guests_filter_use_departure_join(self, app):
        company = make_company(approved=True)
        tour = make_tour(company, status=TourStatus.ACTIVE)
        # Departure 30 days from now with 5 seats
        make_departure(
            tour, start_date=datetime.utcnow() + timedelta(days=30),
            total_seats=5, available_seats=5,
        )
        results = PublicService.search_active_tours(
            start_date=(datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d"),
            min_guests=2,
        )
        assert [t.id for t in results] == [tour.id]

    def test_invalid_start_date_does_not_crash(self, app):
        company = make_company(approved=True)
        tour = make_tour(company, status=TourStatus.ACTIVE)
        make_departure(tour)
        # Invalid date is silently ignored.
        results = PublicService.search_active_tours(start_date="not-a-date", min_guests=1)
        assert tour.id in [t.id for t in results]

    def test_invalid_min_guests_silently_ignored(self, app):
        company = make_company(approved=True)
        tour = make_tour(company, status=TourStatus.ACTIVE)
        make_departure(tour)
        results = PublicService.search_active_tours(min_guests="abc")
        assert tour.id in [t.id for t in results]


class TestGetTourDetail:
    def test_nonexistent_tour_returns_none(self, mocker):
        mocker.patch("src.services.public_service.db.session.get", return_value=None)
        assert PublicService.get_tour_detail(9999) is None

    def test_non_active_tour_returns_none(self, mocker):
        tour = MagicMock(status=TourStatus.DRAFT)
        mocker.patch("src.services.public_service.db.session.get", return_value=tour)
        assert PublicService.get_tour_detail(5) is None

    def test_active_tour_filters_valid_departures(self, app):
        company = make_company(approved=True)
        tour = make_tour(company, status=TourStatus.ACTIVE)
        future = make_departure(
            tour, start_date=datetime.utcnow() + timedelta(days=10),
            total_seats=5, available_seats=5,
        )
        # Past departure — should be filtered out.
        make_departure(
            tour, start_date=datetime.utcnow() - timedelta(days=1),
            end_date=datetime.utcnow() + timedelta(days=1),
            total_seats=5, available_seats=5,
        )
        # Sold-out future departure — should be filtered out.
        make_departure(
            tour, start_date=datetime.utcnow() + timedelta(days=20),
            total_seats=5, available_seats=0,
        )
        result = PublicService.get_tour_detail(tour.id)
        assert result is not None
        assert [d.id for d in result._valid_departures] == [future.id]

    def test_get_all_destinations_returns_all(self, app):
        make_destination(name="Halong")
        make_destination(name="Sapa")
        names = {d.name for d in PublicService.get_all_destinations()}
        assert {"Halong", "Sapa"} <= names
