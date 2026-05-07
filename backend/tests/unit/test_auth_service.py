from unittest.mock import MagicMock

from src.constants import UserRole
from src.services.auth_service import AuthService


def _patch_user_lookup(mocker, found):
    mock_user_cls = mocker.patch("src.services.auth_service.User")
    mock_user_cls.query.filter_by.return_value.first.return_value = found
    return mock_user_cls


class TestRegisterUser:
    def test_missing_email_returns_400(self):
        result = AuthService.register_user({"password": "p", "role": UserRole.GUEST})
        assert result["status"] == 400
        assert "Email and password" in result["error"]

    def test_missing_password_returns_400(self):
        result = AuthService.register_user({"email": "x@y.com", "role": UserRole.GUEST})
        assert result["status"] == 400
        assert "Email and password" in result["error"]

    def test_duplicate_email_returns_400(self, mocker):
        _patch_user_lookup(mocker, MagicMock())
        result = AuthService.register_user(
            {"email": "x@y.com", "password": "p", "role": UserRole.GUEST}
        )
        assert result["status"] == 400
        assert "already registered" in result["error"]

    def test_invalid_role_returns_400(self, mocker):
        _patch_user_lookup(mocker, None)
        result = AuthService.register_user(
            {"email": "x@y.com", "password": "p", "role": "UNKNOWN"}
        )
        assert result["status"] == 400
        assert "Invalid role" in result["error"]

    def test_company_missing_company_name_rolls_back(self, mocker):
        _patch_user_lookup(mocker, None)
        mock_db = mocker.patch("src.services.auth_service.db")
        mocker.patch("src.services.auth_service.hash_password", return_value="hashed")

        result = AuthService.register_user(
            {"email": "x@y.com", "password": "p", "role": UserRole.COMPANY}
        )

        assert result["status"] == 400
        assert "Company name" in result["error"]
        mock_db.session.rollback.assert_called_once()

    def test_guest_missing_full_name_rolls_back(self, mocker):
        _patch_user_lookup(mocker, None)
        mock_db = mocker.patch("src.services.auth_service.db")
        mocker.patch("src.services.auth_service.hash_password", return_value="hashed")

        result = AuthService.register_user(
            {"email": "x@y.com", "password": "p", "role": UserRole.GUEST}
        )

        assert result["status"] == 400
        assert "Full name" in result["error"]
        mock_db.session.rollback.assert_called_once()


class TestLoginUser:
    def test_unknown_email_returns_401(self, mocker):
        _patch_user_lookup(mocker, None)
        result = AuthService.login_user("ghost@x.com", "p")
        assert result["status"] == 401
        assert "Invalid" in result["error"]

    def test_wrong_password_returns_401(self, mocker):
        fake_user = MagicMock(password_hash="hashed", is_active=True)
        _patch_user_lookup(mocker, fake_user)
        mocker.patch("src.services.auth_service.check_password", return_value=False)

        result = AuthService.login_user("x@y.com", "wrong")
        assert result["status"] == 401

    def test_inactive_account_returns_403(self, mocker):
        fake_user = MagicMock(password_hash="hashed", is_active=False)
        _patch_user_lookup(mocker, fake_user)
        mocker.patch("src.services.auth_service.check_password", return_value=True)

        result = AuthService.login_user("x@y.com", "p")
        assert result["status"] == 403
        assert "deactivated" in result["error"]

    def test_valid_credentials_returns_user(self, mocker):
        fake_user = MagicMock(password_hash="hashed", is_active=True)
        _patch_user_lookup(mocker, fake_user)
        mocker.patch("src.services.auth_service.check_password", return_value=True)

        result = AuthService.login_user("x@y.com", "p")
        assert result["status"] == 200
        assert result["user"] is fake_user
