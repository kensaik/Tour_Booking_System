import sys
import os
from datetime import datetime, timedelta

# Add backend directory to path so it can import src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from src import create_app
from src.extensions import db
from src.models.user import User, GuestProfile, CompanyProfile
from src.models.tour import Destination, Tour, TourItinerary, Departure
from src.models.booking import Booking, Payment
from src.constants import UserRole, TourStatus, DepartureStatus, BookingStatus, PaymentStatus

from werkzeug.security import generate_password_hash

def seed_database():
    app = create_app()
    with app.app_context():
        print("Resetting database...")
        db.drop_all()
        db.create_all()

        print("Seeding Users...")
        # Admin
        admin = User(
            email="admin@test.com",
            password_hash=generate_password_hash("123"),
            role=UserRole.ADMIN
        )
        
        # Guest
        guest_user = User(
            email="guest1@test.com",
            password_hash=generate_password_hash("123"),
            role=UserRole.GUEST
        )
        db.session.add(admin)
        db.session.add(guest_user)
        db.session.flush()

        guest_profile = GuestProfile(
            user_id=guest_user.id,
            full_name="Nguyễn Văn Khách",
            phone_number="0901234567",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        )
        db.session.add(guest_profile)

        # Company
        company_user = User(
            email="company@test.com",
            password_hash=generate_password_hash("123"),
            role=UserRole.COMPANY
        )
        db.session.add(company_user)
        db.session.flush()

        company_profile = CompanyProfile(
            user_id=company_user.id,
            company_name="Saigontourist",
            description="Công ty du lịch uy tín hàng đầu.",
            commission_rate=10.0,
            is_approved=True,
            logo_url="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200"
        )
        db.session.add(company_profile)

        print("Seeding Destinations...")
        dalat = Destination(name="Đà Lạt", description="Thành phố ngàn hoa", image_url="https://images.unsplash.com/photo-1582559938555-46b55fc622b7?auto=format&fit=crop&q=80&w=800")
        sapa = Destination(name="Sapa", description="Thành phố trong sương", image_url="https://images.unsplash.com/photo-1550931298-500b46be1c02?auto=format&fit=crop&q=80&w=800")
        db.session.add(dalat)
        db.session.add(sapa)
        db.session.flush()

        print("Seeding Tours...")
        tour1 = Tour(
            company_id=company_profile.id,
            destination_id=dalat.id,
            name="Khám Phá Đà Lạt Mộng Mơ",
            description="Chuyến đi đáng nhớ đến với cao nguyên Lâm Viên",
            price=2500000.0,
            total_days=3,
            status=TourStatus.ACTIVE,
            image_url="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
        )
        db.session.add(tour1)
        db.session.flush()

        # Itineraries
        iti1 = TourItinerary(tour_id=tour1.id, day_number=1, title="Hồ Chí Minh - Đà Lạt", description="Di chuyển và nhận phòng.")
        iti2 = TourItinerary(tour_id=tour1.id, day_number=2, title="Tham quan Thung Lũng Tình Yêu", description="Đi chơi và mua sắm.")
        iti3 = TourItinerary(tour_id=tour1.id, day_number=3, title="Đà Lạt - Hồ Chí Minh", description="Trở về.")
        db.session.add_all([iti1, iti2, iti3])

        # Departures
        now = datetime.utcnow()
        dep_future = Departure(
            tour_id=tour1.id,
            start_date=now + timedelta(days=30),
            end_date=now + timedelta(days=32),
            total_seats=20,
            available_seats=18,  # 2 seats will be booked
            guide_name="Nguyễn Hướng Dẫn",
            status=DepartureStatus.PLANNED
        )
        dep_past = Departure(
            tour_id=tour1.id,
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=8),
            total_seats=15,
            available_seats=15,
            guide_name="Trần Guide",
            status=DepartureStatus.COMPLETED
        )
        db.session.add(dep_future)
        db.session.add(dep_past)
        db.session.flush()

        print("Seeding Bookings & Payments...")
        booking = Booking(
            guest_id=guest_profile.id,
            departure_id=dep_future.id,
            num_people=2,
            total_price=5000000.0,
            payment_status=PaymentStatus.FULLY_PAID,
            booking_status=BookingStatus.CONFIRMED
        )
        db.session.add(booking)
        db.session.flush()

        payment = Payment(
            booking_id=booking.id,
            amount=5000000.0,
            payment_method="VNPAY",
            status="SUCCESS"
        )
        db.session.add(payment)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
