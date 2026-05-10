from datetime import datetime

from src.constants import PaymentStatus
from src.extensions import db
from src.models.booking import Booking, Payment
from src.models.tour import Departure


class GuestService:
    @staticmethod
    def book_departure(guest_id, departure_id, num_people, contact_info=None):
        departure = db.session.get(Departure, departure_id)
        if not departure:
            return {"error": "Departure not found", "status": 404}

        if departure.start_date <= datetime.utcnow():
            return {
                "error": "Cannot book a departure that has already started or is in the past",
                "status": 400,
            }

        if not num_people or not isinstance(num_people, int) or num_people <= 0:
            return {"error": "num_people must be a positive integer", "status": 400}

        if departure.available_seats < num_people:
            return {
                "error": f"Not enough seats available. Only {departure.available_seats} seats left.",
                "status": 400,
            }

        total_price = departure.tour.price * num_people

        booking = Booking(
            guest_id=guest_id,
            departure_id=departure.id,
            num_people=num_people,
            total_price=total_price,
            contact_name=contact_info.get("contact_name") if contact_info else None,
            contact_email=contact_info.get("contact_email") if contact_info else None,
            contact_phone=contact_info.get("contact_phone") if contact_info else None,
            notes=contact_info.get("notes") if contact_info else None,
        )

        departure.available_seats -= num_people
        db.session.add(booking)
        db.session.commit()

        # Gửi email xác nhận cho khách và thông báo cho công ty
        try:
            from src.services.notification_service import NotificationService
            if booking.contact_email:
                NotificationService.send_booking_confirmation(booking, booking.contact_email)
            if departure.tour.company and departure.tour.company.user:
                NotificationService.send_booking_to_company(
                    booking,
                    departure.tour.company.user.email
                )
        except Exception as e:
            print(f"Notification error: {e}")

        return {"booking": booking, "status": 201}

    @staticmethod
    def get_my_bookings(guest_id):
        return Booking.query.filter_by(guest_id=guest_id).all()

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

        # Gửi email xác nhận thanh toán
        try:
            from src.services.notification_service import NotificationService
            if booking.contact_email:
                NotificationService.send_payment_confirmation(booking, booking.contact_email)
        except Exception as e:
            print(f"Payment notification error: {e}")

        return {"payment": payment, "booking": booking, "status": 201}

    @staticmethod
    def get_my_payments(guest_id, booking_id=None):
        query = Payment.query.join(Booking).filter(Booking.guest_id == guest_id)
        if booking_id:
            query = query.filter(Payment.booking_id == int(booking_id))
        return query.all()
