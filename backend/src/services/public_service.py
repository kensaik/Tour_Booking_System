import contextlib
from datetime import datetime

from sqlalchemy import or_

from src.constants import TourStatus
from src.extensions import db
from src.models.tour import Destination, Tour


class PublicService:
    @staticmethod
    def get_all_destinations():
        return Destination.query.all()

    @staticmethod
    def search_active_tours(
        destination_id=None, keyword=None, start_date=None, min_guests=None
    ):
        from src.constants import DepartureStatus
        from src.models.tour import Departure

        query = Tour.query.filter(Tour.status.ilike(TourStatus.ACTIVE))

        if destination_id:
            query = query.filter_by(destination_id=int(destination_id))

        if keyword:
            search_pattern = f"%{keyword}%"
            query = query.filter(
                or_(
                    Tour.name.ilike(search_pattern),
                    Tour.description.ilike(search_pattern),
                )
            )

        if start_date or min_guests:
            query = query.join(Departure)
            query = query.filter(Departure.status == DepartureStatus.PLANNED)

            if start_date:
                try:
                    dt = datetime.strptime(start_date, "%Y-%m-%d")
                    query = query.filter(Departure.start_date >= dt)
                except (ValueError, TypeError):
                    pass

            if min_guests:
                with contextlib.suppress(ValueError, TypeError):
                    query = query.filter(Departure.available_seats >= int(min_guests))

            query = query.distinct()

        return query.all()

    @staticmethod
    def get_tour_detail(tour_id):
        tour = db.session.get(Tour, tour_id)

        if not tour or tour.status.upper() != TourStatus.ACTIVE:
            return None

        now = datetime.utcnow()
        valid_departures = [
            dep
            for dep in tour.departures.all()
            if dep.start_date > now and dep.available_seats > 0
        ]

        tour._valid_departures = valid_departures

        return tour
