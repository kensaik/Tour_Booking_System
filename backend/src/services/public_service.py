from datetime import UTC, datetime

from sqlalchemy import or_

from src.constants import TourStatus
from src.extensions import db
from src.models.tour import Departure, Destination, Tour


class PublicService:
    @staticmethod
    def get_all_destinations():
        return Destination.query.all()

    @staticmethod
    def search_active_tours_query(destination_id=None, keyword=None):
        query = Tour.query.filter_by(status=TourStatus.ACTIVE)

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

        return query

    @staticmethod
    def get_tour_detail(tour_id):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.status != TourStatus.ACTIVE:
            return None

        now = datetime.now(UTC).replace(tzinfo=None)
        tour._valid_departures = (
            tour.departures.filter(
                Departure.start_date > now,
                Departure.available_seats > 0,
            )
            .order_by(Departure.start_date)
            .all()
        )

        return tour
