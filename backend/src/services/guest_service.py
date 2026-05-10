from datetime import datetime, timezone

from src.constants import PaymentStatus
from src.extensions import db
from src.models.booking import Booking, Payment
from src.models.tour import Departure


class GuestService:
    @staticmethod
    def book_departure(guest_id, departure_id, num_people, contact_info=None):
        if not num_people or not isinstance(num_people, int) or num_people <= 0:
            return {"error": "num_people must be a positive integer", "status": 400}

        departure = db.session.get(Departure, departure_id)
        if not departure:
            return {"error": "Departure not found", "status": 404}

        if departure.start_date <= datetime.now(timezone.utc).replace(tzinfo=None):
            return {
                "error": "Cannot book a departure that has already started or is in the past",
                "status": 400,
            }

        if departure.available_seats < num_people:
            return {
                "error": f"Not enough seats available. Only {departure.available_seats} seats left.",
                "status": 400,
            }

        total_price = departure.tour.price * num_people

        rows = (
            db.session.query(Departure)
            .filter(
                Departure.id == departure.id,
                Departure.available_seats >= num_people,
            )
            .update(
                {Departure.available_seats: Departure.available_seats - num_people},
                synchronize_session=False,
            )
        )
        if rows == 0:
            db.session.rollback()
            return {
                "error": "Not enough seats available.",
                "status": 400,
            }

        contact_info = contact_info or {}
        booking = Booking(
            guest_id=guest_id,
            departure_id=departure.id,
            num_people=num_people,
            total_price=total_price,
            contact_name=contact_info.get("contact_name"),
            contact_email=contact_info.get("contact_email"),
            contact_phone=contact_info.get("contact_phone"),
            notes=contact_info.get("notes"),
        )
        db.session.add(booking)
        db.session.commit()

        return {"booking": booking, "status": 201}

    @staticmethod
    def get_my_bookings_query(guest_id, status_filter=None):
        query = Booking.query.filter_by(guest_id=guest_id)
        if status_filter:
            query = query.filter(Booking.booking_status == status_filter)
        return query

    @staticmethod
    def get_booking_detail(guest_id, booking_id):
        booking = db.session.get(Booking, booking_id)
        if not booking or booking.guest_id != guest_id:
            return None
        return booking

    @staticmethod
    def process_payment(guest_id, booking_id, amount, payment_method):
        if not booking_id or amount is None or not payment_method:
            return {
                "error": "booking_id, amount, and payment_method are required",
                "status": 400,
            }

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return {"error": "amount must be a positive number", "status": 400}

        booking = db.session.get(Booking, booking_id)
        if not booking or booking.guest_id != guest_id:
            return {"error": "Booking not found or access denied", "status": 404}

        payment = Payment(
            booking_id=booking.id,
            amount=amount,
            payment_method=payment_method,
            status="SUCCESS",
        )
        db.session.add(payment)

        if amount >= booking.total_price:
            booking.payment_status = PaymentStatus.FULLY_PAID
        else:
            booking.payment_status = PaymentStatus.DEPOSIT_PAID

        db.session.commit()
        return {"payment": payment, "booking": booking, "status": 201}

    @staticmethod
    def get_my_payments_query(guest_id, booking_id=None):
        query = Payment.query.join(Booking).filter(Booking.guest_id == guest_id)
        if booking_id:
            query = query.filter(Payment.booking_id == int(booking_id))
        return query
