from datetime import datetime, timedelta


def _register_company(api_client, email, name, password="Co1!Test"):
    r = api_client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "COMPANY",
            "company_name": name,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()["user_id"]


def _login(api_client, email, password):
    r = api_client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert r.status_code == 200, r.text
    return r.json()


def test_company_full_journey(api_client, unique_email, admin_token):
    password = "Co1!Test"
    company_name = f"AutoCo-{unique_email.split('@')[0]}"
    _register_company(api_client, unique_email, company_name, password)

    pending_login = _login(api_client, unique_email, password)
    pending_token = pending_login["access_token"]

    api_client.set_token(pending_token)
    r = api_client.get("/api/company/tours")
    assert r.status_code == 403, r.text

    admin_client = api_client.clone()
    admin_client.set_token(admin_token)
    r = admin_client.get("/api/admin/companies", params={"status": "pending"})
    assert r.status_code == 200, r.text
    pending_companies = r.json()["companies"]
    target = next(
        (c for c in pending_companies if c.get("company_name") == company_name),
        None,
    )
    assert target is not None, f"new company not in pending list: {pending_companies}"
    company_id = target["id"]

    r = admin_client.put(f"/api/admin/companies/{company_id}/approve")
    assert r.status_code == 200, r.text

    fresh_login = _login(api_client, unique_email, password)
    api_client.set_token(fresh_login["access_token"])

    r = api_client.get("/api/public/destinations")
    assert r.status_code == 200, r.text
    destinations = r.json()["destinations"]
    assert destinations, "seed missing destinations"
    destination_id = destinations[0]["id"]

    tour_payload = {
        "name": f"AutoTour-{unique_email.split('@')[0]}",
        "description": "Automation-created tour",
        "price": 1200000,
        "total_days": 2,
        "destination_id": destination_id,
    }
    r = api_client.post("/api/company/tours", json=tour_payload)
    assert r.status_code == 201, r.text
    tour_id = r.json()["tour_id"]

    r = api_client.post(
        f"/api/company/tours/{tour_id}/itineraries",
        json={
            "day_number": 1,
            "title": "Day 1 - Arrival",
            "description": "Transfer and hotel check-in.",
        },
    )
    assert r.status_code == 201, r.text
    assert "itinerary_id" in r.json()

    r = api_client.put(f"/api/company/tours/{tour_id}", json={"status": "ACTIVE"})
    assert r.status_code == 200, r.text

    start = datetime.utcnow() + timedelta(days=45)
    end = start + timedelta(days=2)
    departure_payload = {
        "start_date": start.replace(microsecond=0).isoformat(),
        "end_date": end.replace(microsecond=0).isoformat(),
        "total_seats": 10,
    }
    r = api_client.post(
        f"/api/company/tours/{tour_id}/departures", json=departure_payload
    )
    assert r.status_code == 201, r.text

    public_client = api_client.clone()
    r = public_client.get("/api/public/tours", params={"keyword": tour_payload["name"]})
    assert r.status_code == 200, r.text
    visible = r.json()["tours"]
    assert any(t["id"] == tour_id for t in visible), (
        f"tour not visible publicly: {visible}"
    )


def test_register_company_missing_company_name_returns_400(api_client, unique_email):
    r = api_client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "Co1!Test",
            "role": "COMPANY",
        },
    )
    assert r.status_code == 400, r.text
    assert "Company name" in r.json().get("message", "")
