from datetime import datetime

from sqlalchemy.orm import joinedload

from src.constants import BookingStatus
from src.extensions import db
from src.models.booking import Booking
from src.models.tour import Departure, Destination, Tour, TourItinerary


class CompanyService:
    @staticmethod
    def get_my_tours_query(company_id):
        return Tour.query.filter_by(company_id=company_id)

    @staticmethod
    def create_tour(company_id, data):
        required_fields = [
            "name",
            "description",
            "price",
            "total_days",
            "destination_id",
        ]
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}", "status": 400}

        destination = db.session.get(Destination, data["destination_id"])
        if not destination:
            return {"error": "Invalid destination_id", "status": 400}

        new_tour = Tour(
            company_id=company_id,
            destination_id=destination.id,
            name=data["name"],
            description=data["description"],
            price=float(data["price"]),
            total_days=int(data["total_days"]),
            image_url=data.get("image_url"),
        )
        db.session.add(new_tour)
        db.session.flush()  # assign tour.id without committing

        for iti_data in data.get("itineraries", []) or []:
            db.session.add(
                TourItinerary(
                    tour_id=new_tour.id,
                    day_number=iti_data.get("day_number"),
                    title=iti_data.get("title"),
                    description=iti_data.get("content")
                    or iti_data.get("description", ""),
                )
            )

        db.session.commit()
        return {"tour": new_tour, "status": 201}

    @staticmethod
    def get_tour_detail(company_id, tour_id):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.company_id != company_id:
            return None
        return tour

    @staticmethod
    def update_tour(company_id, tour_id, data):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.company_id != company_id:
            return {"error": "Tour not found or access denied", "status": 404}

        if "name" in data:
            tour.name = data["name"]
        if "description" in data:
            tour.description = data["description"]
        if "price" in data:
            tour.price = float(data["price"])
        if "total_days" in data:
            tour.total_days = int(data["total_days"])
        if "status" in data:
            tour.status = data["status"]
        if "image_url" in data:
            tour.image_url = data["image_url"]
        if "destination_id" in data:
            tour.destination_id = int(data["destination_id"])

        if "itineraries" in data:
            # Replace itineraries wholesale when client sends a new list
            TourItinerary.query.filter_by(tour_id=tour.id).delete()
            for iti_data in data["itineraries"] or []:
                db.session.add(
                    TourItinerary(
                        tour_id=tour.id,
                        day_number=iti_data.get("day_number"),
                        title=iti_data.get("title"),
                        description=iti_data.get("content")
                        or iti_data.get("description", ""),
                    )
                )

        db.session.commit()
        return {"tour": tour, "status": 200}

    @staticmethod
    def delete_tour(company_id, tour_id):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.company_id != company_id:
            return {"error": "Tour not found or access denied", "status": 404}

        for departure in tour.departures:
            if departure.bookings.count() > 0:
                return {
                    "error": "Cannot delete tour because there are bookings for its departures.",
                    "status": 400,
                }

        db.session.delete(tour)
        db.session.commit()
        return {"status": 200}

    @staticmethod
    def add_itinerary(company_id, tour_id, data):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.company_id != company_id:
            return {"error": "Tour not found or access denied", "status": 404}

        if not all(k in data for k in ("day_number", "title", "description")):
            return {
                "error": "day_number, title, description are required",
                "status": 400,
            }

        iti = TourItinerary(
            tour_id=tour.id,
            day_number=int(data["day_number"]),
            title=data["title"],
            description=data["description"],
        )
        db.session.add(iti)
        db.session.commit()
        return {"itinerary": iti, "status": 201}

    @staticmethod
    def modify_itinerary(company_id, iti_id, data, method):
        iti = db.session.get(TourItinerary, iti_id)
        if not iti or iti.tour.company_id != company_id:
            return {"error": "Itinerary not found or access denied", "status": 404}

        if method == "DELETE":
            db.session.delete(iti)
            db.session.commit()
            return {"status": 200}

        if "day_number" in data:
            iti.day_number = int(data["day_number"])
        if "title" in data:
            iti.title = data["title"]
        if "description" in data:
            iti.description = data["description"]

        db.session.commit()
        return {"status": 200}

    @staticmethod
    def add_departure(company_id, tour_id, data):
        tour = db.session.get(Tour, tour_id)
        if not tour or tour.company_id != company_id:
            return {"error": "Tour not found or access denied", "status": 404}

        required_fields = ["start_date", "end_date", "total_seats"]
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}", "status": 400}

        try:
            start_date = datetime.fromisoformat(data["start_date"])
            end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            return {
                "error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)",
                "status": 400,
            }

        if start_date >= end_date:
            return {"error": "start_date must be before end_date", "status": 400}

        total_seats = int(data["total_seats"])
        if total_seats <= 0:
            return {"error": "total_seats must be positive", "status": 400}

        dep = Departure(
            tour_id=tour.id,
            start_date=start_date,
            end_date=end_date,
            total_seats=total_seats,
            available_seats=total_seats,
            guide_name=data.get("guide_name"),
        )
        db.session.add(dep)
        db.session.commit()
        return {"departure": dep, "status": 201}

    @staticmethod
    def get_company_departures(company_id):
        return (
            Departure.query.join(Tour)
            .filter(Tour.company_id == company_id)
            .order_by(Departure.start_date.asc())
            .all()
        )

    @staticmethod
    def get_company_bookings_query(
        company_id, status_filter=None, payment_status=None, departure_id=None
    ):
        query = (
            Booking.query.options(
                joinedload(Booking.guest),
                joinedload(Booking.departure).joinedload(Departure.tour),
            )
            .join(Departure)
            .join(Tour)
            .filter(Tour.company_id == company_id)
        )

        if status_filter:
            query = query.filter(Booking.booking_status == status_filter)
        if payment_status:
            query = query.filter(Booking.payment_status == payment_status)
        if departure_id:
            query = query.filter(Booking.departure_id == int(departure_id))

        return query

    @staticmethod
    def get_booking_detail(company_id, booking_id):
        booking = db.session.get(Booking, booking_id)
        if (
            not booking
            or not booking.departure
            or not booking.departure.tour
            or booking.departure.tour.company_id != company_id
        ):
            return None
        return booking

    @staticmethod
    def update_booking_status(company_id, booking_id, new_status):
        booking = db.session.get(Booking, booking_id)
        if (
            not booking
            or not booking.departure
            or not booking.departure.tour
            or booking.departure.tour.company_id != company_id
        ):
            return {"error": "Booking not found or access denied", "status": 404}

        if new_status not in [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
        ]:
            return {"error": "Invalid booking status", "status": 400}

        old_status = booking.booking_status

        if (
            old_status != BookingStatus.CANCELLED
            and new_status == BookingStatus.CANCELLED
        ):
            booking.departure.available_seats += booking.num_people
        elif (
            old_status == BookingStatus.CANCELLED
            and new_status != BookingStatus.CANCELLED
        ):
            if booking.departure.available_seats < booking.num_people:
                return {
                    "error": "Not enough available seats to restore this booking",
                    "status": 400,
                }
            booking.departure.available_seats -= booking.num_people

        booking.booking_status = new_status
        db.session.commit()
        return {"booking": booking, "status": 200}
