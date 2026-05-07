from tests.conftest import (
    make_admin,
    make_company,
    make_destination,
    make_guest,
    make_tour,
)


def test_admin_get_destinations(client, auth_client):
    admin = make_admin()
    make_destination(name="DA")
    make_destination(name="DB")
    res = auth_client(admin).get("/api/admin/destinations")
    assert res.status_code == 200
    assert len(res.get_json()["destinations"]) == 2


def test_admin_create_destination(client, auth_client):
    admin = make_admin()
    res = auth_client(admin).post(
        "/api/admin/destinations",
        json={"name": "Hue", "description": "Imperial city"},
    )
    assert res.status_code == 201
    assert res.get_json()["destination"]["name"] == "Hue"


def test_admin_create_destination_missing_name_returns_400(client, auth_client):
    admin = make_admin()
    res = auth_client(admin).post("/api/admin/destinations", json={})
    assert res.status_code == 400


def test_admin_create_destination_duplicate_returns_400(client, auth_client):
    admin = make_admin()
    make_destination(name="Dup")
    res = auth_client(admin).post("/api/admin/destinations", json={"name": "Dup"})
    assert res.status_code == 400


def test_admin_update_destination(client, auth_client):
    admin = make_admin()
    dest = make_destination(name="Old")
    res = auth_client(admin).put(
        f"/api/admin/destinations/{dest.id}", json={"name": "New", "description": "x"}
    )
    assert res.status_code == 200


def test_admin_update_destination_not_found_returns_404(client, auth_client):
    admin = make_admin()
    res = auth_client(admin).put("/api/admin/destinations/9999", json={"name": "X"})
    assert res.status_code == 404


def test_admin_delete_destination_with_tours_returns_400(client, auth_client):
    admin = make_admin()
    co = make_company(approved=True)
    dest = make_destination()
    make_tour(co, dest)
    res = auth_client(admin).delete(f"/api/admin/destinations/{dest.id}")
    assert res.status_code == 400


def test_admin_delete_destination_success(client, auth_client):
    admin = make_admin()
    dest = make_destination()
    res = auth_client(admin).delete(f"/api/admin/destinations/{dest.id}")
    assert res.status_code == 200


def test_admin_get_companies_pending_filter(client, auth_client):
    admin = make_admin()
    make_company(approved=False)
    make_company(approved=True)
    res = auth_client(admin).get("/api/admin/companies?status=pending")
    assert res.status_code == 200
    companies = res.get_json()["companies"]
    assert len(companies) == 1
    assert companies[0]["is_approved"] is False


def test_admin_approve_company(client, auth_client):
    admin = make_admin()
    co = make_company(approved=False)
    res = auth_client(admin).put(
        f"/api/admin/companies/{co.company_profile.id}/approve"
    )
    assert res.status_code == 200


def test_admin_approve_company_idempotent(client, auth_client):
    admin = make_admin()
    co = make_company(approved=True)
    res = auth_client(admin).put(
        f"/api/admin/companies/{co.company_profile.id}/approve"
    )
    assert res.status_code == 200
    assert "already" in res.get_json()["message"].lower()


def test_admin_approve_company_not_found_returns_404(client, auth_client):
    admin = make_admin()
    res = auth_client(admin).put("/api/admin/companies/9999/approve")
    assert res.status_code == 404


def test_admin_update_commission(client, auth_client):
    admin = make_admin()
    co = make_company(approved=True)
    res = auth_client(admin).put(
        f"/api/admin/companies/{co.company_profile.id}/commission",
        json={"commission_rate": 12.5},
    )
    assert res.status_code == 200
    assert res.get_json()["commission_rate"] == 12.5


def test_admin_update_commission_out_of_range_returns_400(client, auth_client):
    admin = make_admin()
    co = make_company(approved=True)
    res = auth_client(admin).put(
        f"/api/admin/companies/{co.company_profile.id}/commission",
        json={"commission_rate": 150},
    )
    assert res.status_code == 400


def test_admin_update_commission_invalid_type_returns_400(client, auth_client):
    admin = make_admin()
    co = make_company(approved=True)
    res = auth_client(admin).put(
        f"/api/admin/companies/{co.company_profile.id}/commission",
        json={"commission_rate": "abc"},
    )
    assert res.status_code == 400


def test_admin_endpoint_no_token_returns_401(client):
    res = client.get("/api/admin/destinations")
    assert res.status_code == 401


def test_admin_endpoint_non_admin_returns_403(client, auth_client):
    guest = make_guest()
    res = auth_client(guest).get("/api/admin/destinations")
    assert res.status_code == 403
