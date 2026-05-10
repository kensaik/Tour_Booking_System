from datetime import datetime
from math import ceil

from sqlalchemy import or_

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

_TRUTHY = {"true", "1", "yes", "on"}
_FALSY = {"false", "0", "no", "off", ""}


def _parse_int(value, *, field):
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid {field}: {value!r}") from exc


def parse_pagination(args):
    raw_page = args.get("page")
    raw_size = args.get("page_size")

    page_size = DEFAULT_PAGE_SIZE
    if raw_size is not None:
        page_size = _parse_int(raw_size, field="page_size")
        if page_size < 1 or page_size > MAX_PAGE_SIZE:
            raise ValueError(f"page_size must be between 1 and {MAX_PAGE_SIZE}")

    if raw_page is None:
        return None, page_size

    page = _parse_int(raw_page, field="page")
    if page < 1:
        raise ValueError("page must be >= 1")

    return page, page_size


def apply_text_search(query, columns, term):
    if not term:
        return query
    pattern = f"%{term}%"
    return query.filter(or_(*(col.ilike(pattern) for col in columns)))


def apply_date_range(query, column, start, end):
    if start:
        query = query.filter(column >= datetime.fromisoformat(start))
    if end:
        query = query.filter(column <= datetime.fromisoformat(end))
    return query


def paginate_query(query, *, page, page_size, items_key, dump_fn):
    total = query.order_by(None).count()
    items = query.limit(page_size).offset((page - 1) * page_size).all()
    return {
        items_key: dump_fn(items),
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": ceil(total / page_size) if page_size else 0,
        },
    }


def build_envelope_or_list(query, args, items_key, dump_fn):
    page, page_size = parse_pagination(args)
    if page is None:
        return {items_key: dump_fn(query.all())}
    return paginate_query(
        query,
        page=page,
        page_size=page_size,
        items_key=items_key,
        dump_fn=dump_fn,
    )


def to_bool(value):
    if value is None:
        return None
    s = str(value).strip().lower()
    if s in _TRUTHY:
        return True
    if s in _FALSY:
        return False
    raise ValueError(f"Cannot interpret {value!r} as bool")
