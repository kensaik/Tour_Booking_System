from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.constants import BookingStatus
from src.extensions import db
from src.models.booking import Booking
from src.models.tour import Departure, Destination, Tour, TourItinerary
from src.models.user import User
from src.utils.auth import company_required

company_bp = Blueprint("company", __name__, url_prefix="/api/company")


def get_current_company():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return user.company_profile


# TOUR MANAGEMENT
@company_bp.route("/tours", methods=["GET"])
@company_required()
def get_my_tours():
    company = get_current_company()
    tours = Tour.query.filter_by(company_id=company.id).all()

    result = []
    for t in tours:
        result.append(
            {
                "id": t.id,
                "name": t.name,
                "destination": t.destination.name if t.destination else None,
                "price": t.price,
                "total_days": t.total_days,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
        )
    return jsonify(tours=result), 200


@company_bp.route("/tours", methods=["POST"])
@company_required()
def create_tour():
    company = get_current_company()
    data = request.get_json()

    required_fields = ["name", "description", "price", "total_days", "destination_id"]
    for field in required_fields:
        if field not in data:
            return jsonify(
                error="Bad Request", message=f"Missing required field: {field}"
            ), 400

    destination = db.session.get(Destination, data["destination_id"])
    if not destination:
        return jsonify(error="Bad Request", message="Invalid destination_id"), 400

    new_tour = Tour(
        company_id=company.id,
        destination_id=destination.id,
        name=data["name"],
        description=data["description"],
        price=float(data["price"]),
        total_days=int(data["total_days"]),
    )
    db.session.add(new_tour)
    db.session.commit()

    return jsonify(message="Tour created successfully", tour_id=new_tour.id), 201


@company_bp.route("/tours/<int:id>", methods=["GET"])
@company_required()
def get_tour_detail(id):
    company = get_current_company()
    tour = db.session.get(Tour, id)

    if not tour or tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    itineraries = [
        {
            "id": iti.id,
            "day_number": iti.day_number,
            "title": iti.title,
            "description": iti.description,
        }
        for iti in tour.itineraries.all()
    ]

    departures = [
        {
            "id": dep.id,
            "start_date": dep.start_date.isoformat(),
            "end_date": dep.end_date.isoformat(),
            "total_seats": dep.total_seats,
            "available_seats": dep.available_seats,
            "guide_name": dep.guide_name,
            "status": dep.status,
        }
        for dep in tour.departures.all()
    ]

    result = {
        "id": tour.id,
        "name": tour.name,
        "description": tour.description,
        "price": tour.price,
        "total_days": tour.total_days,
        "destination": tour.destination.name if tour.destination else None,
        "status": tour.status,
        "itineraries": itineraries,
        "departures": departures,
    }

    return jsonify(tour=result), 200


@company_bp.route("/tours/<int:id>", methods=["PUT"])
@company_required()
def update_tour(id):
    company = get_current_company()
    tour = db.session.get(Tour, id)

    if not tour or tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    data = request.get_json()

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

    db.session.commit()
    return jsonify(message="Tour updated successfully"), 200


@company_bp.route("/tours/<int:id>", methods=["DELETE"])
@company_required()
def delete_tour(id):
    company = get_current_company()
    tour = db.session.get(Tour, id)

    if not tour or tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    # Constraint check: Do not delete if there are active bookings in any departure
    for departure in tour.departures:
        if departure.bookings.count() > 0:
            return jsonify(
                error="Bad Request",
                message="Cannot delete tour because there are bookings for its departures.",
            ), 400

    db.session.delete(tour)
    db.session.commit()
    return jsonify(message="Tour deleted successfully"), 200


# ITINERARY MANAGEMENT
@company_bp.route("/tours/<int:tour_id>/itineraries", methods=["POST"])
@company_required()
def add_itinerary(tour_id):
    company = get_current_company()
    tour = db.session.get(Tour, tour_id)

    if not tour or tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    data = request.get_json()
    if not all(k in data for k in ("day_number", "title", "description")):
        return jsonify(
            error="Bad Request", message="day_number, title, description are required"
        ), 400

    iti = TourItinerary(
        tour_id=tour.id,
        day_number=int(data["day_number"]),
        title=data["title"],
        description=data["description"],
    )
    db.session.add(iti)
    db.session.commit()

    return jsonify(message="Itinerary added successfully", itinerary_id=iti.id), 201


@company_bp.route("/itineraries/<int:id>", methods=["PUT", "DELETE"])
@company_required()
def modify_itinerary(id):
    company = get_current_company()
    iti = db.session.get(TourItinerary, id)

    if not iti or iti.tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Itinerary not found or access denied"
        ), 404

    if request.method == "DELETE":
        db.session.delete(iti)
        db.session.commit()
        return jsonify(message="Itinerary deleted successfully"), 200

    # PUT request
    data = request.get_json()
    if "day_number" in data:
        iti.day_number = int(data["day_number"])
    if "title" in data:
        iti.title = data["title"]
    if "description" in data:
        iti.description = data["description"]

    db.session.commit()
    return jsonify(message="Itinerary updated successfully"), 200


# DEPARTURE MANAGEMENT
@company_bp.route("/tours/<int:tour_id>/departures", methods=["POST"])
@company_required()
def add_departure(tour_id):
    company = get_current_company()
    tour = db.session.get(Tour, tour_id)

    if not tour or tour.company_id != company.id:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    data = request.get_json()
    required_fields = ["start_date", "end_date", "total_seats"]
    for field in required_fields:
        if field not in data:
            return jsonify(
                error="Bad Request", message=f"Missing required field: {field}"
            ), 400

    try:
        start_date = datetime.fromisoformat(data["start_date"])
        end_date = datetime.fromisoformat(data["end_date"])
    except ValueError:
        return jsonify(
            error="Bad Request",
            message="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)",
        ), 400

    if start_date >= end_date:
        return jsonify(
            error="Bad Request", message="start_date must be before end_date"
        ), 400

    total_seats = int(data["total_seats"])
    if total_seats <= 0:
        return jsonify(error="Bad Request", message="total_seats must be positive"), 400

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

    return jsonify(message="Departure added successfully", departure_id=dep.id), 201


# BOOKING MANAGEMENT
@company_bp.route("/bookings", methods=["GET"])
@company_required()
def get_company_bookings():
    company = get_current_company()

    status_filter = request.args.get("status")
    departure_id = request.args.get("departure_id")

    query = (
        Booking.query.join(Departure).join(Tour).filter(Tour.company_id == company.id)
    )

    if status_filter:
        query = query.filter(Booking.booking_status == status_filter)
    if departure_id:
        query = query.filter(Booking.departure_id == int(departure_id))

    bookings = query.all()
    result = []
    for b in bookings:
        result.append(
            {
                "id": b.id,
                "tour_name": b.departure.tour.name
                if b.departure and b.departure.tour
                else None,
                "start_date": b.departure.start_date.isoformat()
                if b.departure
                else None,
                "guest_name": b.guest.full_name if b.guest else None,
                "guest_phone": b.guest.phone_number if b.guest else None,
                "num_people": b.num_people,
                "total_price": b.total_price,
                "payment_status": b.payment_status,
                "booking_status": b.booking_status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
        )
    return jsonify(bookings=result), 200


@company_bp.route("/bookings/<int:id>", methods=["GET"])
@company_required()
def get_booking_detail(id):
    company = get_current_company()
    booking = db.session.get(Booking, id)

    if (
        not booking
        or not booking.departure
        or not booking.departure.tour
        or booking.departure.tour.company_id != company.id
    ):
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404

    result = {
        "id": booking.id,
        "guest_name": booking.guest.full_name if booking.guest else None,
        "guest_phone": booking.guest.phone_number if booking.guest else None,
        "tour_name": booking.departure.tour.name,
        "start_date": booking.departure.start_date.isoformat(),
        "num_people": booking.num_people,
        "total_price": booking.total_price,
        "payment_status": booking.payment_status,
        "booking_status": booking.booking_status,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
    }
    return jsonify(booking=result), 200


@company_bp.route("/bookings/<int:id>/status", methods=["PUT"])
@company_required()
def update_booking_status(id):
    company = get_current_company()
    booking = db.session.get(Booking, id)

    if (
        not booking
        or not booking.departure
        or not booking.departure.tour
        or booking.departure.tour.company_id != company.id
    ):
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404

    data = request.get_json()
    new_status = data.get("booking_status")

    if new_status not in [
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
    ]:
        return jsonify(error="Bad Request", message="Invalid booking status"), 400

    old_status = booking.booking_status

    # Refund seats if cancelled
    if old_status != BookingStatus.CANCELLED and new_status == BookingStatus.CANCELLED:
        booking.departure.available_seats += booking.num_people

    # Deduct seats if un-cancelling (Optional safety check)
    elif (
        old_status == BookingStatus.CANCELLED and new_status != BookingStatus.CANCELLED
    ):
        if booking.departure.available_seats < booking.num_people:
            return jsonify(
                error="Bad Request",
                message="Not enough available seats to restore this booking",
            ), 400
        booking.departure.available_seats -= booking.num_people

    booking.booking_status = new_status
    db.session.commit()

    return jsonify(
        message="Booking status updated successfully", new_status=booking.booking_status
    ), 200
