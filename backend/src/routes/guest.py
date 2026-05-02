from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.constants import PaymentStatus
from src.extensions import db
from src.models.booking import Booking, Payment
from src.models.tour import Departure
from src.models.user import User
from src.utils.auth import guest_required

guest_bp = Blueprint("guest", __name__, url_prefix="/api/guest")


def get_current_guest():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return user.guest_profile


@guest_bp.route("/departures/<int:id>/book", methods=["POST"])
@guest_required()
def book_departure(id):
    guest = get_current_guest()
    if not guest:
        return jsonify(error="Forbidden", message="Guest profile not found"), 403

    departure = db.session.get(Departure, id)
    if not departure:
        return jsonify(error="Not Found", message="Departure not found"), 404

    # Validate departure date
    if departure.start_date <= datetime.utcnow():
        return jsonify(
            error="Bad Request",
            message="Cannot book a departure that has already started or is in the past",
        ), 400

    data = request.get_json()
    num_people = data.get("num_people")

    if not num_people or not isinstance(num_people, int) or num_people <= 0:
        return jsonify(
            error="Bad Request", message="num_people must be a positive integer"
        ), 400

    if departure.available_seats < num_people:
        return jsonify(
            error="Bad Request",
            message=f"Not enough seats available. Only {departure.available_seats} seats left.",
        ), 400

    # Calculate price
    total_price = departure.tour.price * num_people

    # Create Booking
    booking = Booking(
        guest_id=guest.id,
        departure_id=departure.id,
        num_people=num_people,
        total_price=total_price,
    )

    # Decrease available seats
    departure.available_seats -= num_people

    db.session.add(booking)
    db.session.commit()

    return jsonify(
        message="Booking successful", booking_id=booking.id, total_price=total_price
    ), 201


@guest_bp.route("/bookings", methods=["GET"])
@guest_required()
def get_my_bookings():
    guest = get_current_guest()
    if not guest:
        return jsonify(error="Forbidden", message="Guest profile not found"), 403

    bookings = Booking.query.filter_by(guest_id=guest.id).all()
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
                "num_people": b.num_people,
                "total_price": b.total_price,
                "payment_status": b.payment_status,
                "booking_status": b.booking_status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
        )

    return jsonify(bookings=result), 200


@guest_bp.route("/bookings/<int:id>", methods=["GET"])
@guest_required()
def get_booking_detail(id):
    guest = get_current_guest()
    booking = db.session.get(Booking, id)

    if not booking or booking.guest_id != guest.id:
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404

    departure = booking.departure
    tour = departure.tour if departure else None

    result = {
        "id": booking.id,
        "num_people": booking.num_people,
        "total_price": booking.total_price,
        "payment_status": booking.payment_status,
        "booking_status": booking.booking_status,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        "tour": {
            "id": tour.id if tour else None,
            "name": tour.name if tour else None,
            "destination": tour.destination.name if tour and tour.destination else None,
        },
        "departure": {
            "id": departure.id if departure else None,
            "start_date": departure.start_date.isoformat() if departure else None,
            "end_date": departure.end_date.isoformat() if departure else None,
            "guide_name": departure.guide_name if departure else None,
        },
    }

    return jsonify(booking=result), 200


@guest_bp.route("/payments", methods=["POST"])
@guest_required()
def create_payment():
    guest = get_current_guest()
    data = request.get_json()

    booking_id = data.get("booking_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method")

    if not booking_id or amount is None or not payment_method:
        return jsonify(
            error="Bad Request",
            message="booking_id, amount, and payment_method are required",
        ), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except ValueError:
        return jsonify(
            error="Bad Request", message="amount must be a positive number"
        ), 400

    booking = db.session.get(Booking, booking_id)
    if not booking or booking.guest_id != guest.id:
        return jsonify(
            error="Not Found", message="Booking not found or access denied"
        ), 404

    # Create mock payment
    payment = Payment(
        booking_id=booking.id,
        amount=amount,
        payment_method=payment_method,
        status="SUCCESS",
    )
    db.session.add(payment)

    # Update booking payment status
    if amount >= booking.total_price:
        booking.payment_status = PaymentStatus.FULLY_PAID
    else:
        booking.payment_status = PaymentStatus.DEPOSIT_PAID

    db.session.commit()

    return jsonify(
        message="Payment successful",
        payment_id=payment.id,
        booking_status=booking.payment_status,
    ), 201


@guest_bp.route("/payments", methods=["GET"])
@guest_required()
def get_my_payments():
    guest = get_current_guest()
    booking_id = request.args.get("booking_id")

    query = Payment.query.join(Booking).filter(Booking.guest_id == guest.id)

    if booking_id:
        query = query.filter(Payment.booking_id == int(booking_id))

    payments = query.all()
    result = []
    for p in payments:
        result.append(
            {
                "id": p.id,
                "booking_id": p.booking_id,
                "amount": p.amount,
                "payment_method": p.payment_method,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
        )

    return jsonify(payments=result), 200
