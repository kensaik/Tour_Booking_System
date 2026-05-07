from unittest.mock import MagicMock

from src.constants import TourStatus
from src.services.public_service import PublicService


class TestSearchActiveTours:
    def test_no_filters_returns_all_active(self, mocker):
        mock_tour = mocker.patch("src.services.public_service.Tour")
        chain = mock_tour.query.filter_by.return_value
        chain.all.return_value = ["t1", "t2"]

        result = PublicService.search_active_tours()

        assert result == ["t1", "t2"]
        mock_tour.query.filter_by.assert_called_once_with(status=TourStatus.ACTIVE)

    def test_destination_filter_narrows_query(self, mocker):
        mock_tour = mocker.patch("src.services.public_service.Tour")
        first = mock_tour.query.filter_by.return_value
        second = first.filter_by.return_value
        second.all.return_value = ["filtered"]

        result = PublicService.search_active_tours(destination_id="3")

        assert result == ["filtered"]
        first.filter_by.assert_called_once_with(destination_id=3)

    def test_keyword_filter_uses_or_clause(self, mocker):
        mock_tour = mocker.patch("src.services.public_service.Tour")
        mocker.patch("src.services.public_service.or_", return_value="OR_CLAUSE")
        first = mock_tour.query.filter_by.return_value
        first.filter.return_value.all.return_value = ["match"]

        result = PublicService.search_active_tours(keyword="Đà Lạt")

        assert result == ["match"]
        first.filter.assert_called_once_with("OR_CLAUSE")

    def test_empty_result_returns_empty_list(self, mocker):
        mock_tour = mocker.patch("src.services.public_service.Tour")
        mocker.patch("src.services.public_service.or_", return_value="OR_CLAUSE")
        first = mock_tour.query.filter_by.return_value
        first.filter.return_value.all.return_value = []

        result = PublicService.search_active_tours(keyword="Atlantis")
        assert result == []


class TestGetTourDetail:
    def test_nonexistent_tour_returns_none(self, mocker):
        mocker.patch("src.services.public_service.db.session.get", return_value=None)
        assert PublicService.get_tour_detail(9999) is None

    def test_non_active_tour_returns_none(self, mocker):
        tour = MagicMock(status=TourStatus.DRAFT)
        mocker.patch("src.services.public_service.db.session.get", return_value=tour)
        assert PublicService.get_tour_detail(5) is None
