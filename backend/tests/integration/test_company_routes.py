from datetime import datetime, timedelta

from tests.conftest import (
    make_booking,
    make_company,
    make_departure,
    make_destination,
    make_guest,
    make_itinerary,
    make_tour,
)

from src.constants import BookingStatus


def test_get_my_tours_returns_only_own(client, auth_client):
    co_a = make_company(approved=True)
    co_b = make_company(approved=True)
    make_tour(co_a, name="A1")
    make_tour(co_b, name="B1")
    res = auth_client(co_a).get("/api/company/tours")
    assert res.status_code == 200
    names = [t["name"] for t in res.get_json()["tours"]]
    assert names == ["A1"]


def test_get_my_tours_unapproved_returns_403(client, auth_client):
    co = make_company(approved=False)
    res = auth_client(co).get("/api/company/tours")
    assert res.status_code == 403


def test_get_my_tours_no_token_returns_401(client):
    res = client.get("/api/company/tours")
    assert res.status_code == 401


def test_create_tour_success(client, auth_client):
    co = make_company(approved=True)
    dest = make_destination()
    res = auth_client(co).post(
        "/api/company/tours",
        json={
            "name": "T1",
            "description": "Desc",
            "price": 1000,
            "total_days": 3,
            "destination_id": dest.id,
        },
    )
    assert res.status_code == 201
    assert res.get_json()["tour_id"]


def test_create_tour_missing_field_returns_400(client, auth_client):
    co = make_company(approved=True)
    res = auth_client(co).post("/api/company/tours", json={"name": "Incomplete"})
    assert res.status_code == 400


def test_create_tour_invalid_destination_returns_400(client, auth_client):
    co = make_company(approved=True)
    res = auth_client(co).post(
        "/api/company/tours",
        json={
            "name": "T",
            "description": "D",
            "price": 100,
            "total_days": 1,
            "destination_id": 9999,
        },
    )
    assert res.status_code == 400


def test_get_tour_detail_own(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    res = auth_client(co).get(f"/api/company/tours/{tour.id}")
    assert res.status_code == 200
    assert res.get_json()["tour"]["id"] == tour.id


def test_get_tour_detail_cross_company_returns_404(client, auth_client):
    co_a = make_company(approved=True)
    co_b = make_company(approved=True)
    tour_b = make_tour(co_b)
    res = auth_client(co_a).get(f"/api/company/tours/{tour_b.id}")
    assert res.status_code == 404


def test_update_tour_success(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co, name="Old")
    res = auth_client(co).put(
        f"/api/company/tours/{tour.id}",
        json={"name": "New", "price": 2000, "status": "ACTIVE"},
    )
    assert res.status_code == 200


def test_update_tour_cross_company_returns_404(client, auth_client):
    co_a = make_company(approved=True)
    co_b = make_company(approved=True)
    tour_b = make_tour(co_b)
    res = auth_client(co_a).put(
        f"/api/company/tours/{tour_b.id}", json={"name": "Hacked"}
    )
    assert res.status_code == 404


def test_delete_tour_with_bookings_returns_400(client, auth_client):
    co = make_company(approved=True)
    guest = make_guest()
    tour = make_tour(co)
    dep = make_departure(tour, total_seats=10)
    make_booking(guest, dep)
    res = auth_client(co).delete(f"/api/company/tours/{tour.id}")
    assert res.status_code == 400


def test_delete_tour_success(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    res = auth_client(co).delete(f"/api/company/tours/{tour.id}")
    assert res.status_code == 200


def test_add_itinerary_success(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/itineraries",
        json={"day_number": 1, "title": "Day 1", "description": "Intro"},
    )
    assert res.status_code == 201


def test_add_itinerary_missing_fields_returns_400(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/itineraries",
        json={"day_number": 1},
    )
    assert res.status_code == 400


def test_modify_itinerary_update(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    iti = make_itinerary(tour)
    res = auth_client(co).put(
        f"/api/company/itineraries/{iti.id}",
        json={"title": "Updated", "day_number": 2},
    )
    assert res.status_code == 200


def test_modify_itinerary_delete(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    iti = make_itinerary(tour)
    res = auth_client(co).delete(f"/api/company/itineraries/{iti.id}")
    assert res.status_code == 200


def test_modify_itinerary_cross_company_returns_404(client, auth_client):
    co_a = make_company(approved=True)
    co_b = make_company(approved=True)
    tour_b = make_tour(co_b)
    iti = make_itinerary(tour_b)
    res = auth_client(co_a).put(
        f"/api/company/itineraries/{iti.id}", json={"title": "X"}
    )
    assert res.status_code == 404


def test_add_departure_success(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    start = (datetime.utcnow() + timedelta(days=10)).isoformat()
    end = (datetime.utcnow() + timedelta(days=13)).isoformat()
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/departures",
        json={"start_date": start, "end_date": end, "total_seats": 20},
    )
    assert res.status_code == 201


def test_add_departure_invalid_date_format_returns_400(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/departures",
        json={"start_date": "not-a-date", "end_date": "x", "total_seats": 10},
    )
    assert res.status_code == 400


def test_add_departure_start_after_end_returns_400(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    start = (datetime.utcnow() + timedelta(days=15)).isoformat()
    end = (datetime.utcnow() + timedelta(days=10)).isoformat()
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/departures",
        json={"start_date": start, "end_date": end, "total_seats": 10},
    )
    assert res.status_code == 400


def test_add_departure_zero_seats_returns_400(client, auth_client):
    co = make_company(approved=True)
    tour = make_tour(co)
    start = (datetime.utcnow() + timedelta(days=10)).isoformat()
    end = (datetime.utcnow() + timedelta(days=13)).isoformat()
    res = auth_client(co).post(
        f"/api/company/tours/{tour.id}/departures",
        json={"start_date": start, "end_date": end, "total_seats": 0},
    )
    assert res.status_code == 400


def test_get_company_bookings_filtered(client, auth_client):
    co = make_company(approved=True)
    guest = make_guest()
    tour = make_tour(co)
    dep = make_departure(tour, total_seats=10)
    make_booking(guest, dep, booking_status=BookingStatus.PENDING)
    make_booking(guest, dep, booking_status=BookingStatus.CONFIRMED)

    res = auth_client(co).get("/api/company/bookings?status=PENDING")
    assert res.status_code == 200
    bookings = res.get_json()["bookings"]
    assert len(bookings) == 1
    assert bookings[0]["booking_status"] == "PENDING"


def test_get_booking_detail_cross_company_returns_404(client, auth_client):
    co_a = make_company(approved=True)
    co_b = make_company(approved=True)
    guest = make_guest()
    tour_b = make_tour(co_b)
    dep_b = make_departure(tour_b, total_seats=10)
    booking = make_booking(guest, dep_b)
    res = auth_client(co_a).get(f"/api/company/bookings/{booking.id}")
    assert res.status_code == 404


def test_update_booking_status_to_cancelled_restores_seats(client, auth_client):
    co = make_company(approved=True)
    guest = make_guest()
    tour = make_tour(co)
    dep = make_departure(tour, total_seats=10, available_seats=8)
    booking = make_booking(guest, dep, num_people=2)

    res = auth_client(co).put(
        f"/api/company/bookings/{booking.id}/status",
        json={"booking_status": "CANCELLED"},
    )
    assert res.status_code == 200
    assert res.get_json()["new_status"] == "CANCELLED"


def test_update_booking_status_invalid_returns_400(client, auth_client):
    co = make_company(approved=True)
    guest = make_guest()
    tour = make_tour(co)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep)
    res = auth_client(co).put(
        f"/api/company/bookings/{booking.id}/status",
        json={"booking_status": "BOGUS"},
    )
    assert res.status_code == 400
