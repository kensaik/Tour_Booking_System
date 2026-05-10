from unittest.mock import MagicMock

from src.services.admin_service import AdminService


class TestApproveCompany:
    def test_company_not_found_returns_404(self, mocker):
        mocker.patch("src.services.admin_service.db.session.get", return_value=None)
        result = AdminService.approve_company(company_id=9999)
        assert result["status"] == 404

    def test_already_approved_is_idempotent(self, mocker):
        company = MagicMock(is_approved=True)
        mocker.patch("src.services.admin_service.db.session.get", return_value=company)

        result = AdminService.approve_company(company_id=5)
        assert result["status"] == 200
        assert "already approved" in result["message"]

    def test_pending_company_gets_approved(self, mocker):
        company = MagicMock(is_approved=False)
        mocker.patch("src.services.admin_service.db.session.get", return_value=company)
        mock_commit = mocker.patch("src.services.admin_service.db.session.commit")

        result = AdminService.approve_company(company_id=5)
        assert result["status"] == 200
        assert company.is_approved is True
        mock_commit.assert_called_once()


class TestUpdateCommission:
    def test_company_not_found_returns_404(self, mocker):
        mocker.patch("src.services.admin_service.db.session.get", return_value=None)
        result = AdminService.update_commission(company_id=9999, new_rate=10)
        assert result["status"] == 404

    def test_non_numeric_rate_returns_400(self, mocker):
        company = MagicMock()
        mocker.patch("src.services.admin_service.db.session.get", return_value=company)

        result = AdminService.update_commission(company_id=5, new_rate="abc")
        assert result["status"] == 400
        assert "Valid commission_rate" in result["error"]

    def test_negative_rate_returns_400(self, mocker):
        company = MagicMock()
        mocker.patch("src.services.admin_service.db.session.get", return_value=company)

        result = AdminService.update_commission(company_id=5, new_rate=-5)
        assert result["status"] == 400
        assert "between 0 and 100" in result["error"]

    def test_rate_at_upper_bound_succeeds(self, mocker):
        company = MagicMock()
        mocker.patch("src.services.admin_service.db.session.get", return_value=company)
        mocker.patch("src.services.admin_service.db.session.commit")

        result = AdminService.update_commission(company_id=5, new_rate=100)
        assert result["status"] == 200
        assert company.commission_rate == 100.0


class TestCreateDestination:
    def test_missing_name_returns_400(self):
        result = AdminService.create_destination({"description": "x"})
        assert result["status"] == 400
        assert "name is required" in result["error"]

    def test_duplicate_name_returns_400(self, mocker):
        mock_dest = mocker.patch("src.services.admin_service.Destination")
        mock_dest.query.filter_by.return_value.first.return_value = MagicMock()

        result = AdminService.create_destination({"name": "Paris"})
        assert result["status"] == 400
        assert "already exists" in result["error"]


class TestDeleteDestination:
    def test_destination_not_found_returns_404(self, mocker):
        mocker.patch("src.services.admin_service.db.session.get", return_value=None)
        result = AdminService.delete_destination(dest_id=9999)
        assert result["status"] == 404

    def test_destination_with_tours_cannot_be_deleted(self, mocker):
        dest = MagicMock()
        dest.tours.count.return_value = 3
        mocker.patch("src.services.admin_service.db.session.get", return_value=dest)

        result = AdminService.delete_destination(dest_id=1)
        assert result["status"] == 400
        assert "linked to existing tours" in result["error"]
