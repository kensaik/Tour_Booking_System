# pyrefly: ignore [missing-import]
from tests.conftest import make_company, make_departure, make_destination, make_tour

# pyrefly: ignore [missing-import]
from src.constants import TourStatus


def test_get_destinations_returns_list(client):
    make_destination(name="Hanoi")
    make_destination(name="Saigon")
    res = client.get("/api/public/destinations")
    assert res.status_code == 200
    body = res.get_json()
    assert len(body["destinations"]) == 2
    assert {d["name"] for d in body["destinations"]} == {"Hanoi", "Saigon"}


def test_get_tours_empty_when_none_active(client):
    res = client.get("/api/public/tours")
    assert res.status_code == 200
    assert res.get_json()["tours"] == []


def test_get_tours_returns_only_active(client):
    company = make_company(approved=True)
    dest = make_destination()
    make_tour(company, dest, status=TourStatus.ACTIVE, name="Active Tour")
    make_tour(company, dest, status=TourStatus.DRAFT, name="Draft Tour")
    res = client.get("/api/public/tours")
    assert res.status_code == 200
    names = [t["name"] for t in res.get_json()["tours"]]
    assert names == ["Active Tour"]


def test_get_tours_filter_by_destination(client):
    company = make_company(approved=True)
    d1 = make_destination(name="D1")
    d2 = make_destination(name="D2")
    make_tour(company, d1, name="T1")
    make_tour(company, d2, name="T2")
    res = client.get(f"/api/public/tours?destination_id={d1.id}")
    assert res.status_code == 200
    names = [t["name"] for t in res.get_json()["tours"]]
    assert names == ["T1"]


def test_get_tours_keyword_search(client):
    company = make_company(approved=True)
    dest = make_destination()
    make_tour(company, dest, name="Beach Adventure")
    make_tour(company, dest, name="Mountain Trek")
    res = client.get("/api/public/tours?keyword=beach")
    assert res.status_code == 200
    names = [t["name"] for t in res.get_json()["tours"]]
    assert names == ["Beach Adventure"]


def test_get_tour_detail_returns_tour(client):
    company = make_company(approved=True)
    dest = make_destination()
    tour = make_tour(company, dest, status=TourStatus.ACTIVE)
    make_departure(tour)
    res = client.get(f"/api/public/tours/{tour.id}")
    assert res.status_code == 200
    body = res.get_json()["tour"]
    assert body["id"] == tour.id
    assert "departures" in body


def test_get_tour_detail_not_found_returns_404(client):
    res = client.get("/api/public/tours/99999")
    assert res.status_code == 404


def test_get_tour_detail_inactive_returns_404(client):
    company = make_company(approved=True)
    tour = make_tour(company, status=TourStatus.DRAFT)
    res = client.get(f"/api/public/tours/{tour.id}")
    assert res.status_code == 404
