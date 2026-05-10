"""Tests for src.services.cloudinary_service."""

from unittest.mock import patch

from src.services import cloudinary_service as cs


def test_configure_cloudinary_uses_app_config(app):
    app.config["CLOUDINARY_CLOUD_NAME"] = "test-cloud"
    app.config["CLOUDINARY_API_KEY"] = "key"
    app.config["CLOUDINARY_API_SECRET"] = "secret"
    with (
        patch("src.services.cloudinary_service.cloudinary.config") as cfg,
        app.app_context(),
    ):
        cs.configure_cloudinary()
    cfg.assert_called_once()
    kwargs = cfg.call_args.kwargs
    assert kwargs["cloud_name"] == "test-cloud"
    assert kwargs["api_key"] == "key"
    assert kwargs["api_secret"] == "secret"
    assert kwargs["secure"] is True


def test_upload_image_strips_data_uri_and_returns_dict():
    with patch("src.services.cloudinary_service.cloudinary.uploader.upload") as up:
        up.return_value = {
            "secure_url": "https://res.cloudinary.com/x.jpg",
            "public_id": "abc",
            "width": 1200,
            "height": 800,
        }
        result = cs.upload_image("data:image/png;base64,AAAA")
    assert result["url"] == "https://res.cloudinary.com/x.jpg"
    assert result["public_id"] == "abc"
    # The base64 prefix should be stripped before being passed in.
    args, _ = up.call_args
    assert args[0] == "AAAA"


def test_upload_image_returns_error_on_exception():
    with patch(
        "src.services.cloudinary_service.cloudinary.uploader.upload",
        side_effect=RuntimeError("nope"),
    ):
        result = cs.upload_image("rawbase64")
    assert "error" in result


def test_delete_image_success():
    with patch("src.services.cloudinary_service.cloudinary.uploader.destroy") as d:
        assert cs.delete_image("pub_id") is True
    d.assert_called_once_with("pub_id")


def test_delete_image_failure():
    with patch(
        "src.services.cloudinary_service.cloudinary.uploader.destroy",
        side_effect=RuntimeError("boom"),
    ):
        assert cs.delete_image("pub_id") is False


def test_get_optimized_url_invokes_cloudinary(monkeypatch):
    called = {}

    def fake_url(public_id, transformation=None):
        called["public_id"] = public_id
        called["transformation"] = transformation
        return f"https://res.cloudinary.com/{public_id}.jpg"

    monkeypatch.setattr(cs.cloudinary, "url", fake_url, raising=False)
    url = cs.get_optimized_url("pid", width=600)
    assert url == "https://res.cloudinary.com/pid.jpg"
    assert called["public_id"] == "pid"
    assert called["transformation"][0]["width"] == 600
