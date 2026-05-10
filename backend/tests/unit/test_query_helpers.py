from datetime import datetime

import pytest
from tests.conftest import make_company, make_tour
from werkzeug.datastructures import MultiDict

from src.extensions import db
from src.models.tour import Departure, Tour
from src.utils.query_helpers import (
    apply_date_range,
    apply_text_search,
    build_envelope_or_list,
    paginate_query,
    parse_pagination,
    to_bool,
)


def _args(**kwargs):
    return MultiDict(kwargs)


# parse_pagination ----------------------------------------------------------


def test_parse_pagination_no_page_returns_none():
    page, size = parse_pagination(_args())
    assert page is None
    assert size == 20


def test_parse_pagination_with_page_and_size():
    page, size = parse_pagination(_args(page="2", page_size="50"))
    assert page == 2
    assert size == 50


def test_parse_pagination_uses_default_size_when_only_page_given():
    page, size = parse_pagination(_args(page="3"))
    assert page == 3
    assert size == 20


@pytest.mark.parametrize("bad", ["0", "-1", "abc"])
def test_parse_pagination_invalid_page(bad):
    with pytest.raises(ValueError):
        parse_pagination(_args(page=bad))


@pytest.mark.parametrize("bad", ["0", "101", "abc", "-5"])
def test_parse_pagination_invalid_page_size(bad):
    with pytest.raises(ValueError):
        parse_pagination(_args(page="1", page_size=bad))


def test_apply_text_search_filters_with_like(app):
    with app.app_context():
        company = make_company(approved=True)
        make_tour(company, name="Beach Paradise", description="Sun")
        make_tour(company, name="Mountain Trek", description="Hike")

        q = apply_text_search(Tour.query, [Tour.name, Tour.description], "beach")
        names = [t.name for t in q.all()]
        assert names == ["Beach Paradise"]


def test_apply_text_search_empty_term_returns_query_unchanged(app):
    with app.app_context():
        company = make_company(approved=True)
        make_tour(company, name="A")
        make_tour(company, name="B")

        q = apply_text_search(Tour.query, [Tour.name], "")
        assert q.count() == 2


def test_apply_date_range_both_bounds(app):
    with app.app_context():
        company = make_company(approved=True)
        tour = make_tour(company)
        d1 = Departure(
            tour_id=tour.id,
            start_date=datetime(2026, 1, 1),
            end_date=datetime(2026, 1, 5),
            total_seats=10,
            available_seats=10,
        )
        d2 = Departure(
            tour_id=tour.id,
            start_date=datetime(2026, 6, 1),
            end_date=datetime(2026, 6, 5),
            total_seats=10,
            available_seats=10,
        )
        db.session.add_all([d1, d2])
        db.session.commit()

        q = apply_date_range(
            Departure.query, Departure.start_date, "2026-05-01", "2026-12-31"
        )
        assert q.count() == 1
        assert q.first().start_date.month == 6


def test_apply_date_range_neither_bound_no_op(app):
    with app.app_context():
        company = make_company(approved=True)
        make_tour(company)
        q = apply_date_range(Tour.query, Tour.created_at, None, None)
        assert q.count() == 1


# paginate_query ------------------------------------------------------------


def test_paginate_query_returns_envelope_with_correct_totals(app):
    with app.app_context():
        company = make_company(approved=True)
        for i in range(5):
            make_tour(company, name=f"Tour {i}")

        result = paginate_query(
            Tour.query,
            page=1,
            page_size=2,
            items_key="tours",
            dump_fn=lambda items: [t.name for t in items],
        )
        assert result["pagination"] == {
            "page": 1,
            "page_size": 2,
            "total": 5,
            "total_pages": 3,
        }
        assert len(result["tours"]) == 2


def test_build_envelope_or_list_array_when_no_page(app):
    with app.app_context():
        company = make_company(approved=True)
        make_tour(company, name="Solo")

        result = build_envelope_or_list(
            Tour.query, _args(), "tours", lambda items: [t.name for t in items]
        )
        assert result == {"tours": ["Solo"]}


def test_build_envelope_or_list_envelope_when_page(app):
    with app.app_context():
        company = make_company(approved=True)
        for i in range(3):
            make_tour(company, name=f"T{i}")

        result = build_envelope_or_list(
            Tour.query,
            _args(page="2", page_size="2"),
            "tours",
            lambda items: [t.name for t in items],
        )
        assert result["pagination"]["page"] == 2
        assert result["pagination"]["total"] == 3
        assert len(result["tours"]) == 1


# to_bool -------------------------------------------------------------------


@pytest.mark.parametrize("v", ["true", "1", "yes", "TRUE", "On"])
def test_to_bool_truthy(v):
    assert to_bool(v) is True


@pytest.mark.parametrize("v", ["false", "0", "", "no"])
def test_to_bool_falsy(v):
    assert to_bool(v) is False


def test_to_bool_none():
    assert to_bool(None) is None
