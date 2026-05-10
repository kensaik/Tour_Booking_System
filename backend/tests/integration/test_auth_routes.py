from tests.conftest import make_admin, make_company, make_guest


def test_register_guest_returns_201(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "g1@example.com",
            "password": "Pass123!",
            "role": "GUEST",
            "full_name": "Guest A",
            "phone_number": "0900000111",
        },
    )
    assert res.status_code == 201
    body = res.get_json()
    assert body["user_id"]
    assert body["message"] == "User registered successfully"


def test_register_company_returns_201(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "c1@example.com",
            "password": "Pass123!",
            "role": "COMPANY",
            "company_name": "Co A",
            "description": "desc",
        },
    )
    assert res.status_code == 201
    assert res.get_json()["user_id"]


def test_register_duplicate_email_returns_400(client):
    payload = {
        "email": "dup@example.com",
        "password": "Pass123!",
        "role": "GUEST",
        "full_name": "Dup",
    }
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "already registered" in res.get_json()["message"].lower()


def test_register_missing_email_returns_400(client):
    res = client.post(
        "/api/auth/register",
        json={"password": "Pass123!", "role": "GUEST", "full_name": "X"},
    )
    assert res.status_code == 400


def test_register_invalid_role_returns_400(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "bad@example.com",
            "password": "Pass123!",
            "role": "ADMIN",
            "full_name": "Hacker",
        },
    )
    assert res.status_code == 400


def test_register_company_missing_name_returns_400(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "c2@example.com", "password": "Pass123!", "role": "COMPANY"},
    )
    assert res.status_code == 400


def test_register_guest_missing_full_name_returns_400(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "g2@example.com", "password": "Pass123!", "role": "GUEST"},
    )
    assert res.status_code == 400


def test_login_success_returns_token(client):
    make_guest(email="login@example.com", password="Pass123!")
    res = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "Pass123!"},
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["access_token"]
    assert body["user"]["email"] == "login@example.com"


def test_login_wrong_password_returns_401(client):
    make_guest(email="wp@example.com", password="Pass123!")
    res = client.post(
        "/api/auth/login",
        json={"email": "wp@example.com", "password": "WRONG"},
    )
    assert res.status_code == 401


def test_login_unknown_email_returns_401(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "Pass123!"},
    )
    assert res.status_code == 401


def test_login_inactive_returns_403(client):
    make_guest(email="off@example.com", password="Pass123!", is_active=False)
    res = client.post(
        "/api/auth/login",
        json={"email": "off@example.com", "password": "Pass123!"},
    )
    assert res.status_code == 403


def test_me_without_token_returns_401(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_me_returns_guest_profile(client, auth_client):
    user = make_guest()
    res = auth_client(user).get("/api/auth/me")
    assert res.status_code == 200
    body = res.get_json()["user"]
    assert body["email"] == user.email
    assert body["role"] == "GUEST"
    assert "guest_profile" in body


def test_me_returns_company_profile(client, auth_client):
    user = make_company()
    res = auth_client(user).get("/api/auth/me")
    assert res.status_code == 200
    body = res.get_json()["user"]
    assert "company_profile" in body
    assert body["role"] == "COMPANY"


def test_me_admin_no_profile(client, auth_client):
    user = make_admin()
    res = auth_client(user).get("/api/auth/me")
    assert res.status_code == 200
    body = res.get_json()["user"]
    assert body["role"] == "ADMIN"
    assert "guest_profile" not in body
    assert "company_profile" not in body
