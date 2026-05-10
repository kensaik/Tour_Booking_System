from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.extensions import db
from src.models.user import User
from src.serializers.booking_schema import BookingSchema, PaymentSchema
from src.services.guest_service import GuestService
from src.utils.auth import guest_required

guest_bp = Blueprint("guest", __name__, url_prefix="/api/guest")


def get_current_guest_id():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return user.guest_profile.id if user and user.guest_profile else None


@guest_bp.route("/departures/<int:id>/book", methods=["POST"])
@guest_required()
def book_departure(id):
    guest_id = get_current_guest_id()
    if not guest_id:
        return jsonify(error="Forbidden", message="Guest profile not found"), 403

    data = request.get_json()
    num_people = data.get("num_people")

    contact_info = {
        "contact_name": data.get("contact_name"),
        "contact_email": data.get("contact_email"),
        "contact_phone": data.get("contact_phone"),
        "notes": data.get("notes"),
    }

    result = GuestService.book_departure(guest_id, id, num_people, contact_info)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    booking = result["booking"]
    return jsonify(
        message="Booking successful",
        booking_id=booking.id,
        total_price=booking.total_price,
    ), 201


@guest_bp.route("/bookings", methods=["GET"])
@guest_required()
def get_my_bookings():
    guest_id = get_current_guest_id()
    if not guest_id:
        return jsonify(error="Forbidden", message="Guest profile not found"), 403

    schema = BookingSchema(many=True)
    try:
        result = GuestService.list_my_bookings(guest_id, request.args, schema.dump)
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400
    return jsonify(result), 200


@guest_bp.route("/bookings/<int:id>", methods=["GET"])
@guest_required()
def get_booking_detail(id):
    guest_id = get_current_guest_id()
    booking = GuestService.get_booking_detail(guest_id, id)

    if not booking:
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404


    return jsonify(booking=BookingSchema().dump(booking)), 200


@guest_bp.route("/payments", methods=["POST"])
@guest_required()
def create_payment():
    guest_id = get_current_guest_id()
    data = request.get_json()

    booking_id = data.get("booking_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method")

    result = GuestService.process_payment(guest_id, booking_id, amount, payment_method)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Payment successful",
        payment_id=result["payment"].id,
        booking_status=result["booking"].payment_status,
    ), 201


@guest_bp.route("/payments", methods=["GET"])
@guest_required()
def get_my_payments():
    guest_id = get_current_guest_id()
    booking_id = request.args.get("booking_id")

    payments = GuestService.get_my_payments(guest_id, booking_id)
    return jsonify(payments=PaymentSchema(many=True).dump(payments)), 200
