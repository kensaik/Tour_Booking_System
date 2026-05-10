from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.extensions import db
from src.models.user import User
from src.serializers.booking_schema import BookingSchema
from src.serializers.tour_schema import DepartureSchema, TourSchema
from src.services.company_service import CompanyService
from src.utils.auth import company_required
from src.utils.query_helpers import build_envelope_or_list

company_bp = Blueprint("company", __name__, url_prefix="/api/company")


def get_current_company_id():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return user.company_profile.id if user and user.company_profile else None


@company_bp.route("/tours", methods=["GET"])
@company_required()
def get_my_tours():
    company_id = get_current_company_id()
    if not company_id:
        return jsonify(error="Unauthorized", message="Company profile not found"), 401
    query = CompanyService.get_my_tours_query(company_id)
    tour_schema = TourSchema(many=True, exclude=("itineraries", "departures"))
    try:
        return jsonify(
            build_envelope_or_list(query, request.args, "tours", tour_schema.dump)
        ), 200
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400


@company_bp.route("/tours", methods=["POST"])
@company_required()
def create_tour():
    company_id = get_current_company_id()
    data = request.get_json()

    result = CompanyService.create_tour(company_id, data)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(message="Tour created successfully", tour_id=result["tour"].id), 201


@company_bp.route("/tours/<int:id>", methods=["GET"])
@company_required()
def get_tour_detail(id):
    company_id = get_current_company_id()
    if not company_id:
        return jsonify(error="Unauthorized", message="Company profile not found"), 401
    tour = CompanyService.get_tour_detail(company_id, id)

    if not tour:
        return jsonify(
            error="Not Found", message="Tour not found or access denied"
        ), 404

    return jsonify(tour=TourSchema().dump(tour)), 200


@company_bp.route("/tours/<int:id>", methods=["PUT"])
@company_required()
def update_tour(id):
    company_id = get_current_company_id()
    data = request.get_json()

    result = CompanyService.update_tour(company_id, id, data)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(message="Tour updated successfully"), 200


@company_bp.route("/tours/<int:id>", methods=["DELETE"])
@company_required()
def delete_tour(id):
    company_id = get_current_company_id()
    result = CompanyService.delete_tour(company_id, id)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(message="Tour deleted successfully"), 200


@company_bp.route("/tours/<int:tour_id>/itineraries", methods=["POST"])
@company_required()
def add_itinerary(tour_id):
    company_id = get_current_company_id()
    data = request.get_json()

    result = CompanyService.add_itinerary(company_id, tour_id, data)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Itinerary added successfully", itinerary_id=result["itinerary"].id
    ), 201


@company_bp.route("/itineraries/<int:id>", methods=["PUT", "DELETE"])
@company_required()
def modify_itinerary(id):
    company_id = get_current_company_id()
    data = request.get_json() if request.method == "PUT" else {}

    result = CompanyService.modify_itinerary(company_id, id, data, request.method)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    msg = (
        "Itinerary deleted successfully"
        if request.method == "DELETE"
        else "Itinerary updated successfully"
    )
    return jsonify(message=msg), 200


@company_bp.route("/tours/<int:tour_id>/departures", methods=["POST"])
@company_required()
def add_departure(tour_id):
    company_id = get_current_company_id()
    data = request.get_json()

    result = CompanyService.add_departure(company_id, tour_id, data)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Departure added successfully", departure_id=result["departure"].id
    ), 201


@company_bp.route("/departures", methods=["GET"])
@company_required()
def get_company_departures():
    company_id = get_current_company_id()
    if not company_id:
        return jsonify(error="Unauthorized", message="Company profile not found"), 401

    departures = CompanyService.get_company_departures(company_id)
    return jsonify(departures=DepartureSchema(many=True).dump(departures)), 200


@company_bp.route("/bookings", methods=["GET"])
@company_required()
def get_company_bookings():
    company_id = get_current_company_id()
    status_filter = request.args.get("status")
    payment_status = request.args.get("payment_status")
    departure_id = request.args.get("departure_id")

    query = CompanyService.get_company_bookings_query(
        company_id,
        status_filter=status_filter,
        payment_status=payment_status,
        departure_id=departure_id,
    )
    try:
        return jsonify(
            build_envelope_or_list(
                query, request.args, "bookings", BookingSchema(many=True).dump
            )
        ), 200
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400


@company_bp.route("/bookings/<int:id>", methods=["GET"])
@company_required()
def get_booking_detail(id):
    company_id = get_current_company_id()
    booking = CompanyService.get_booking_detail(company_id, id)

    if not booking:
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404

    return jsonify(booking=BookingSchema().dump(booking)), 200


@company_bp.route("/bookings/<int:id>/status", methods=["PUT"])
@company_required()
def update_booking_status(id):
    company_id = get_current_company_id()
    data = request.get_json()
    new_status = data.get("booking_status")

    result = CompanyService.update_booking_status(company_id, id, new_status)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Booking status updated successfully",
        new_status=result["booking"].booking_status,
    ), 200
