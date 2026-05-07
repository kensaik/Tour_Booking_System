import os
import uuid

import pytest
import requests

API_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:5000")

ADMIN_EMAIL = os.environ.get("AUTOMATION_ADMIN_EMAIL", "admin@test.com")
ADMIN_PASSWORD = os.environ.get("AUTOMATION_ADMIN_PASSWORD", "Admin@123")


class ApiClient:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.headers = self.session.headers

    def _url(self, path):
        if path.startswith("http"):
            return path
        return f"{self.base_url}{path}"

    def get(self, path, **kwargs):
        return self.session.get(self._url(path), timeout=10, **kwargs)

    def post(self, path, **kwargs):
        return self.session.post(self._url(path), timeout=10, **kwargs)

    def put(self, path, **kwargs):
        return self.session.put(self._url(path), timeout=10, **kwargs)

    def delete(self, path, **kwargs):
        return self.session.delete(self._url(path), timeout=10, **kwargs)

    def set_token(self, token):
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"
        else:
            self.session.headers.pop("Authorization", None)

    def clone(self):
        return ApiClient(self.base_url)


@pytest.fixture(scope="session")
def api_base_url():
    return API_BASE_URL


@pytest.fixture
def api_client(api_base_url):
    return ApiClient(api_base_url)


@pytest.fixture
def unique_email():
    return f"auto_{uuid.uuid4().hex[:10]}@test.local"


@pytest.fixture(scope="session")
def admin_token(api_base_url):
    client = ApiClient(api_base_url)
    r = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert (
        r.status_code == 200
    ), f"Admin login failed (seed missing?): {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session", autouse=True)
def _ensure_api_alive(api_base_url):
    try:
        r = requests.get(f"{api_base_url}/api/health", timeout=5)
    except requests.RequestException as exc:
        pytest.skip(f"API not reachable at {api_base_url}: {exc}")
    if r.status_code != 200:
        pytest.skip(f"API health check failed: {r.status_code}")
