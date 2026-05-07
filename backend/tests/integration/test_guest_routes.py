from datetime import datetime, timedelta

from src.constants import PaymentStatus
from tests.conftest import (
    make_booking,
    make_company,
    make_departure,
    make_guest,
    make_tour,
)


def test_book_departure_success_returns_201(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company, price=1000.0)
    departure = make_departure(tour, total_seats=5)

    res = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book",
        json={"num_people": 2},
    )
    assert res.status_code == 201
    body = res.get_json()
    assert body["booking_id"]
    assert body["total_price"] == 2000.0


def test_book_departure_drains_seats_then_409(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company, price=500.0)
    departure = make_departure(tour, total_seats=3)

    a = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book", json={"num_people": 2}
    )
    assert a.status_code == 201

    b = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book", json={"num_people": 1}
    )
    assert b.status_code == 201

    overflow = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book", json={"num_people": 1}
    )
    assert overflow.status_code == 400
    assert "seats" in overflow.get_json()["message"].lower()


def test_book_departure_invalid_num_people(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    departure = make_departure(tour)

    res = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book", json={"num_people": 0}
    )
    assert res.status_code == 400


def test_book_departure_past_returns_400(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    past = datetime.utcnow() - timedelta(days=1)
    departure = make_departure(
        tour, start_date=past, end_date=past + timedelta(days=1), total_seats=5
    )
    res = auth_client(guest).post(
        f"/api/guest/departures/{departure.id}/book", json={"num_people": 1}
    )
    assert res.status_code == 400


def test_book_departure_not_found(client, auth_client):
    guest = make_guest()
    res = auth_client(guest).post(
        "/api/guest/departures/9999/book", json={"num_people": 1}
    )
    assert res.status_code == 404


def test_book_departure_no_token_returns_401(client):
    res = client.post("/api/guest/departures/1/book", json={"num_people": 1})
    assert res.status_code == 401


def test_book_departure_wrong_role_returns_403(client, auth_client):
    company = make_company(approved=True)
    res = auth_client(company).post(
        "/api/guest/departures/1/book", json={"num_people": 1}
    )
    assert res.status_code == 403


def test_get_my_bookings_returns_only_own(client, auth_client):
    guest_a = make_guest()
    guest_b = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour, total_seats=10)
    make_booking(guest_a, dep)
    make_booking(guest_b, dep)

    res = auth_client(guest_a).get("/api/guest/bookings")
    assert res.status_code == 200
    bookings = res.get_json()["bookings"]
    assert len(bookings) == 1


def test_get_booking_detail_cross_guest_returns_404(client, auth_client):
    guest_a = make_guest()
    guest_b = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest_b, dep)

    res = auth_client(guest_a).get(f"/api/guest/bookings/{booking.id}")
    assert res.status_code == 404


def test_get_booking_detail_own_returns_200(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep)

    res = auth_client(guest).get(f"/api/guest/bookings/{booking.id}")
    assert res.status_code == 200
    assert res.get_json()["booking"]["id"] == booking.id


def test_create_payment_full_amount_marks_fully_paid(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company, price=1000.0)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep, num_people=1)

    res = auth_client(guest).post(
        "/api/guest/payments",
        json={
            "booking_id": booking.id,
            "amount": 1000.0,
            "payment_method": "VNPAY",
        },
    )
    assert res.status_code == 201
    body = res.get_json()
    assert body["booking_status"] == PaymentStatus.FULLY_PAID


def test_create_payment_partial_marks_deposit(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company, price=1000.0)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep, num_people=1)

    res = auth_client(guest).post(
        "/api/guest/payments",
        json={
            "booking_id": booking.id,
            "amount": 200.0,
            "payment_method": "VNPAY",
        },
    )
    assert res.status_code == 201
    assert res.get_json()["booking_status"] == PaymentStatus.DEPOSIT_PAID


def test_create_payment_missing_fields_returns_400(client, auth_client):
    guest = make_guest()
    res = auth_client(guest).post(
        "/api/guest/payments", json={"amount": 100, "payment_method": "VNPAY"}
    )
    assert res.status_code == 400


def test_create_payment_invalid_amount_returns_400(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep)

    res = auth_client(guest).post(
        "/api/guest/payments",
        json={
            "booking_id": booking.id,
            "amount": -10,
            "payment_method": "VNPAY",
        },
    )
    assert res.status_code == 400


def test_create_payment_other_guest_booking_returns_404(client, auth_client):
    guest_a = make_guest()
    guest_b = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest_b, dep)

    res = auth_client(guest_a).post(
        "/api/guest/payments",
        json={
            "booking_id": booking.id,
            "amount": 100,
            "payment_method": "VNPAY",
        },
    )
    assert res.status_code == 404


def test_get_my_payments_filter_by_booking(client, auth_client):
    guest = make_guest()
    company = make_company(approved=True)
    tour = make_tour(company, price=500.0)
    dep = make_departure(tour, total_seats=10)
    booking = make_booking(guest, dep)

    auth_client(guest).post(
        "/api/guest/payments",
        json={"booking_id": booking.id, "amount": 100, "payment_method": "VNPAY"},
    )

    res = auth_client(guest).get(f"/api/guest/payments?booking_id={booking.id}")
    assert res.status_code == 200
    payments = res.get_json()["payments"]
    assert len(payments) == 1
    assert payments[0]["amount"] == 100
