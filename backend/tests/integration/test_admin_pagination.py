from tests.conftest import make_admin, make_company, make_guest

from src.constants import UserRole


def test_admin_users_requires_admin(app, auth_client):
    guest = make_guest()
    cli = auth_client(guest)
    resp = cli.get("/api/admin/users")
    assert resp.status_code == 403


def test_admin_users_list_no_password_hash(app, auth_client):
    admin = make_admin()
    make_guest(email="guest1@test.local")
    cli = auth_client(admin)
    resp = cli.get("/api/admin/users")
    assert resp.status_code == 200
    users = resp.get_json()["users"]
    for u in users:
        assert "password_hash" not in u


def test_admin_users_filter_by_role_and_is_active(app, auth_client):
    admin = make_admin()
    make_guest(email="g1@test.local")
    make_guest(email="g2@test.local", is_active=False)
    make_company(approved=True)
    cli = auth_client(admin)

    resp = cli.get(f"/api/admin/users?role={UserRole.GUEST}")
    emails = [u["email"] for u in resp.get_json()["users"]]
    assert "g1@test.local" in emails and "g2@test.local" in emails
    assert all(u["role"] == UserRole.GUEST for u in resp.get_json()["users"])

    resp = cli.get("/api/admin/users?is_active=false")
    emails = [u["email"] for u in resp.get_json()["users"]]
    assert emails == ["g2@test.local"]


def test_admin_users_email_search(app, auth_client):
    admin = make_admin()
    make_guest(email="alice@test.local")
    make_guest(email="bob@test.local")
    cli = auth_client(admin)
    resp = cli.get("/api/admin/users?email=alice")
    emails = [u["email"] for u in resp.get_json()["users"]]
    assert emails == ["alice@test.local"]


def test_admin_users_paginated(app, auth_client):
    admin = make_admin()
    for i in range(5):
        make_guest(email=f"u{i}@test.local")
    cli = auth_client(admin)
    resp = cli.get("/api/admin/users?page=1&page_size=2")
    data = resp.get_json()
    assert len(data["users"]) == 2
    assert data["pagination"]["total"] >= 6  # 5 guests + 1 admin


def test_admin_companies_backward_compat(app, auth_client):
    admin = make_admin()
    make_company(approved=True)
    cli = auth_client(admin)
    resp = cli.get("/api/admin/companies")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data["companies"], list)
    assert "pagination" not in data


def test_admin_companies_keyword_and_pagination(app, auth_client):
    admin = make_admin()
    make_company(approved=True, company_name="Alpha Tours")
    make_company(approved=True, company_name="Beta Travels")
    cli = auth_client(admin)

    resp = cli.get("/api/admin/companies?keyword=Alpha")
    names = [c["company_name"] for c in resp.get_json()["companies"]]
    assert names == ["Alpha Tours"]

    resp = cli.get("/api/admin/companies?page=1&page_size=1")
    data = resp.get_json()
    assert len(data["companies"]) == 1
    assert data["pagination"]["total"] == 2
