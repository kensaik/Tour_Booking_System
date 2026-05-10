from datetime import datetime, timezone

from sqlalchemy import or_

from src.constants import TourStatus
from src.extensions import db
from src.models.tour import Destination, Tour


class PublicService:
    @staticmethod
    def get_all_destinations():
        return Destination.query.all()

    @staticmethod
    def search_active_tours(destination_id=None, keyword=None):
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

        return query.all()

    @staticmethod
    def get_tour_detail(tour_id):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.status != TourStatus.ACTIVE:
            return None

        # Filter valid departures dynamically
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        valid_departures = [
            dep
            for dep in tour.departures.all()
            if dep.start_date > now and dep.available_seats > 0
        ]

        # Override departures with only valid ones for serialization
        # This is a bit of a hack but works for serialization purposes
        tour._valid_departures = valid_departures

        return tour
