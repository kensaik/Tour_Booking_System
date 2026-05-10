"""Tests for src.routes.upload."""

import io
from unittest.mock import patch

from src.routes.upload import allowed_file


def test_allowed_file_accepts_known_extensions():
    assert allowed_file("photo.png")
    assert allowed_file("PHOTO.JPG")
    assert allowed_file("animation.gif")


def test_allowed_file_rejects_unknown_or_missing_extension():
    assert not allowed_file("noext")
    assert not allowed_file("script.exe")


def test_upload_image_no_file_part(client):
    resp = client.post("/api/upload/image", data={})
    assert resp.status_code == 400
    assert "file part" in resp.get_json()["error"].lower()


def test_upload_image_empty_filename(client):
    data = {"image": (io.BytesIO(b""), "")}
    resp = client.post(
        "/api/upload/image", data=data, content_type="multipart/form-data"
    )
    assert resp.status_code == 400


def test_upload_image_disallowed_type(client):
    data = {"image": (io.BytesIO(b"x"), "evil.exe")}
    resp = client.post(
        "/api/upload/image", data=data, content_type="multipart/form-data"
    )
    assert resp.status_code == 400


def test_upload_image_success(client):
    # Mock makedirs/file.save to avoid hitting the disk.
    with (
        patch("src.routes.upload.os.path.exists", return_value=False),
        patch("src.routes.upload.os.makedirs") as mk,
        patch("werkzeug.datastructures.FileStorage.save") as save,
    ):
        data = {"image": (io.BytesIO(b"\x89PNG"), "pic.png")}
        resp = client.post(
            "/api/upload/image", data=data, content_type="multipart/form-data"
        )
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["url"].startswith("/static/uploads/")
    assert body["url"].endswith("_pic.png")
    mk.assert_called_once()
    save.assert_called_once()
