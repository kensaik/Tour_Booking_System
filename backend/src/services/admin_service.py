from flask import current_app

from src.extensions import db
from src.models.tour import Destination
from src.models.user import CompanyProfile, User
from src.utils.query_helpers import build_envelope_or_list, to_bool


class AdminService:
    @staticmethod
    def get_all_destinations():
        return Destination.query.all()

    @staticmethod
    def _upload_image(image_data: str) -> str:
        """Upload ảnh lên Cloudinary, trả về URL. Nếu lỗi hoặc chưa config thì trả về data gốc."""
        if not image_data or not image_data.startswith("data:image"):
            return image_data

        if not current_app.config.get("CLOUDINARY_ENABLED"):
            return image_data

        try:
            from src.services.cloudinary_service import upload_image

            result = upload_image(image_data, folder="tour_booking/destinations")
            if result and "url" in result:
                return result["url"]
        except Exception as e:
            print(f"Image upload error: {e}")
        return image_data

    @staticmethod
    def create_destination(data):
        name = data.get("name")
        description = data.get("description", "")
        image_url = AdminService._upload_image(data.get("image_url"))

        if not name:
            return {"error": "Destination name is required", "status": 400}

        if Destination.query.filter_by(name=name).first():
            return {"error": "Destination name already exists", "status": 400}

        new_dest = Destination(name=name, description=description, image_url=image_url)
        db.session.add(new_dest)
        db.session.commit()
        return {"destination": new_dest, "status": 201}

    @staticmethod
    def update_destination(dest_id, data):
        destination = db.session.get(Destination, dest_id)
        if not destination:
            return {"error": "Destination not found", "status": 404}

        name = data.get("name")
        if name:
            existing = Destination.query.filter_by(name=name).first()
            if existing and existing.id != dest_id:
                return {"error": "Destination name already exists", "status": 400}
            destination.name = name

        if "description" in data:
            destination.description = data.get("description")

        if "image_url" in data:
            destination.image_url = AdminService._upload_image(data.get("image_url"))

        db.session.commit()
        return {"destination": destination, "status": 200}

    @staticmethod
    def delete_destination(dest_id):
        destination = db.session.get(Destination, dest_id)
        if not destination:
            return {"error": "Destination not found", "status": 404}

        if destination.tours.count() > 0:
            return {
                "error": "Cannot delete destination because it is linked to existing tours",
                "status": 400,
            }

        db.session.delete(destination)
        db.session.commit()
        return {"status": 200}

    @staticmethod
    def get_companies(status_filter=None):
        query = CompanyProfile.query
        if status_filter == "pending":
            query = query.filter_by(is_approved=False)
        return query.all()

    @staticmethod
    def list_companies(args, dump_fn):
        query = CompanyProfile.query
        status_filter = args.get("status")
        if status_filter == "pending":
            query = query.filter_by(is_approved=False)
        keyword = args.get("keyword")
        if keyword:
            query = query.filter(CompanyProfile.company_name.ilike(f"%{keyword}%"))
        query = query.order_by(CompanyProfile.id.asc())
        return build_envelope_or_list(query, args, "companies", dump_fn)

    @staticmethod
    def list_users(args, dump_fn):
        query = User.query
        role = args.get("role")
        if role:
            query = query.filter(User.role == role)
        email = args.get("email")
        if email:
            query = query.filter(User.email.ilike(f"%{email}%"))
        is_active_raw = args.get("is_active")
        if is_active_raw is not None:
            flag = to_bool(is_active_raw)
            if flag is not None:
                query = query.filter(User.is_active.is_(flag))
        query = query.order_by(User.id.asc())
        return build_envelope_or_list(query, args, "users", dump_fn)

    @staticmethod
    def approve_company(company_id):
        company = db.session.get(CompanyProfile, company_id)
        if not company:
            return {"error": "Company not found", "status": 404}

        if company.is_approved:
            return {"status": 200, "message": "Company is already approved"}

        company.is_approved = True
        db.session.commit()
        return {"status": 200, "message": "Company approved successfully"}

    @staticmethod
    def update_commission(company_id, new_rate):
        company = db.session.get(CompanyProfile, company_id)
        if not company:
            return {"error": "Company not found", "status": 404}

        if new_rate is None or not isinstance(new_rate, int | float):
            return {"error": "Valid commission_rate is required", "status": 400}

        if new_rate < 0 or new_rate > 100:
            return {"error": "Commission rate must be between 0 and 100", "status": 400}

        company.commission_rate = float(new_rate)
        db.session.commit()
        return {"company": company, "status": 200}

    @staticmethod
    def toggle_company_status(company_id):
        company = db.session.get(CompanyProfile, company_id)
        if not company:
            return {"error": "Company not found", "status": 404}

        user = company.user
        user.is_active = not user.is_active
        db.session.commit()
        return {"status": 200, "is_active": user.is_active}

    @staticmethod
    def get_stats():
        from src.models.booking import Booking, Payment
        from src.models.tour import Departure, Tour
        from src.models.user import GuestProfile

        total_companies = CompanyProfile.query.count()
        approved_companies = CompanyProfile.query.filter_by(is_approved=True).count()

        total_tours = Tour.query.filter_by(status="active").count()

        total_guests = GuestProfile.query.count()

        total_revenue = (
            db.session.query(db.func.sum(Payment.amount))
            .join(Booking, Payment.booking_id == Booking.id)
            .join(Departure, Booking.departure_id == Departure.id)
            .join(Tour, Departure.tour_id == Tour.id)
            .filter(Booking.booking_status == "confirmed", Payment.status == "SUCCESS")
            .scalar()
            or 0
        )

        total_bookings = Booking.query.count()
        pending_bookings = Booking.query.filter_by(booking_status="pending").count()

        return {
            "total_companies": total_companies,
            "approved_companies": approved_companies,
            "total_tours": total_tours,
            "total_guests": total_guests,
            "total_revenue": float(total_revenue),
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
        }
