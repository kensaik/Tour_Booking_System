from tests.conftest import (
    make_booking,
    make_company,
    make_departure,
    make_guest,
    make_tour,
)

from src.constants import BookingStatus, PaymentStatus


def _make_bookings_for_company(company):
    tour = make_tour(company)
    dep = make_departure(tour)
    guest1 = make_guest()
    guest2 = make_guest()
    make_booking(guest1, dep, num_people=1, booking_status=BookingStatus.PENDING)
    make_booking(
        guest2, dep, num_people=2,
        booking_status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.FULLY_PAID,
    )


def test_company_bookings_backward_compat_array(app, auth_client):
    company = make_company(approved=True)
    _make_bookings_for_company(company)
    cli = auth_client(company)
    resp = cli.get("/api/company/bookings")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data["bookings"], list)
    assert len(data["bookings"]) == 2
    assert "pagination" not in data


def test_company_bookings_paginated_envelope(app, auth_client):
    company = make_company(approved=True)
    _make_bookings_for_company(company)
    cli = auth_client(company)
    resp = cli.get("/api/company/bookings?page=1&page_size=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["bookings"]) == 1
    assert data["pagination"]["total"] == 2
    assert data["pagination"]["total_pages"] == 2


def test_company_bookings_status_filter(app, auth_client):
    company = make_company(approved=True)
    _make_bookings_for_company(company)
    cli = auth_client(company)
    resp = cli.get(f"/api/company/bookings?status={BookingStatus.CONFIRMED}")
    assert resp.status_code == 200
    bookings = resp.get_json()["bookings"]
    assert len(bookings) == 1
    assert bookings[0]["booking_status"] == BookingStatus.CONFIRMED


def test_company_bookings_payment_status_filter(app, auth_client):
    company = make_company(approved=True)
    _make_bookings_for_company(company)
    cli = auth_client(company)
    resp = cli.get(f"/api/company/bookings?payment_status={PaymentStatus.FULLY_PAID}")
    assert resp.status_code == 200
    assert len(resp.get_json()["bookings"]) == 1


def test_company_bookings_invalid_page_returns_400(app, auth_client):
    company = make_company(approved=True)
    _make_bookings_for_company(company)
    cli = auth_client(company)
    resp = cli.get("/api/company/bookings?page=0")
    assert resp.status_code == 400


def test_company_cannot_see_other_company_bookings(app, auth_client):
    c1 = make_company(approved=True)
    c2 = make_company(approved=True)
    t1 = make_tour(c1)
    t2 = make_tour(c2)
    d1 = make_departure(t1)
    d2 = make_departure(t2)
    g = make_guest()
    make_booking(g, d1)
    make_booking(g, d2)

    cli = auth_client(c1)
    resp = cli.get("/api/company/bookings")
    assert resp.status_code == 200
    assert len(resp.get_json()["bookings"]) == 1


def test_guest_bookings_filter_and_paginate(app, auth_client):
    company = make_company(approved=True)
    tour = make_tour(company)
    dep = make_departure(tour)
    guest = make_guest()
    for i in range(3):
        make_booking(
            guest, dep,
            booking_status=BookingStatus.PENDING if i < 2 else BookingStatus.CONFIRMED,
        )

    cli = auth_client(guest)

    resp = cli.get("/api/guest/bookings")
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["bookings"], list)
    assert len(resp.get_json()["bookings"]) == 3

    resp = cli.get("/api/guest/bookings?page=1&page_size=2")
    data = resp.get_json()
    assert data["pagination"]["total"] == 3
    assert len(data["bookings"]) == 2

    resp = cli.get(f"/api/guest/bookings?status={BookingStatus.CONFIRMED}")
    assert len(resp.get_json()["bookings"]) == 1
