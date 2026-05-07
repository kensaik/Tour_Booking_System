def _register_guest(api_client, email, password="Pw1!Test"):
    r = api_client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "GUEST",
            "full_name": "Tourist Auto",
            "phone_number": "0900000000",
        },
    )
    assert r.status_code == 201, r.text


def _login(api_client, email, password):
    r = api_client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def test_tourist_books_tour(api_client, unique_email):
    password = "Pw1!Test"
    _register_guest(api_client, unique_email, password)

    token = _login(api_client, unique_email, password)
    api_client.set_token(token)

    r = api_client.get("/api/public/tours")
    assert r.status_code == 200, r.text
    tours = r.json()["tours"]
    assert len(tours) >= 1, "expected at least one ACTIVE seeded tour"
    tour_id = tours[0]["id"]

    r = api_client.get(f"/api/public/tours/{tour_id}")
    assert r.status_code == 200, r.text
    departures = r.json()["tour"]["departures"]
    assert len(departures) >= 1, "expected at least one future departure with seats"
    departure_id = departures[0]["id"]

    r = api_client.post(
        f"/api/guest/departures/{departure_id}/book",
        json={"num_people": 2},
    )
    assert r.status_code == 201, r.text
    booking = r.json()
    assert "booking_id" in booking
    assert booking["total_price"] > 0

    r = api_client.get("/api/guest/bookings")
    assert r.status_code == 200, r.text
    assert any(b["id"] == booking["booking_id"] for b in r.json()["bookings"])

    deposit = round(booking["total_price"] * 0.3, 2)
    r = api_client.post(
        "/api/guest/payments",
        json={
            "booking_id": booking["booking_id"],
            "amount": deposit,
            "payment_method": "VNPAY",
        },
    )
    assert r.status_code == 201, r.text
    assert r.json()["booking_status"] == "DEPOSIT_PAID"


def test_book_without_auth_returns_401(api_client):
    r = api_client.get("/api/public/tours")
    assert r.status_code == 200, r.text
    tours = r.json()["tours"]
    assert tours, "seed required"
    tour_id = tours[0]["id"]

    r = api_client.get(f"/api/public/tours/{tour_id}")
    assert r.status_code == 200, r.text
    departures = r.json()["tour"]["departures"]
    assert departures
    departure_id = departures[0]["id"]

    r = api_client.post(
        f"/api/guest/departures/{departure_id}/book",
        json={"num_people": 1},
    )
    assert r.status_code == 401, r.text


def test_book_more_seats_than_available_returns_400(api_client, unique_email):
    password = "Pw1!Test"
    _register_guest(api_client, unique_email, password)
    token = _login(api_client, unique_email, password)
    api_client.set_token(token)

    r = api_client.get("/api/public/tours")
    tours = r.json()["tours"]
    tour_id = tours[0]["id"]
    r = api_client.get(f"/api/public/tours/{tour_id}")
    departures = r.json()["tour"]["departures"]
    departure_id = departures[0]["id"]

    r = api_client.post(
        f"/api/guest/departures/{departure_id}/book",
        json={"num_people": 99999},
    )
    assert r.status_code == 400, r.text
    assert "Not enough seats" in r.json().get("message", "")
