from src.extensions import db
from src.models.tour import Destination
from src.models.user import CompanyProfile, User


class AdminService:
    @staticmethod
    def get_all_destinations():
        return Destination.query.all()

    @staticmethod
    def create_destination(data):
        name = data.get("name")
        description = data.get("description", "")
        image_url = data.get("image_url")

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
            destination.image_url = data.get("image_url")

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
    def get_companies_query(status_filter=None, keyword=None):
        query = CompanyProfile.query
        if status_filter == "pending":
            query = query.filter_by(is_approved=False)
        if keyword:
            query = query.filter(CompanyProfile.company_name.ilike(f"%{keyword}%"))
        return query.order_by(CompanyProfile.id.asc())

    @staticmethod
    def get_companies(status_filter=None):
        return AdminService.get_companies_query(status_filter).all()

    @staticmethod
    def get_users_query(role=None, is_active=None, email=None):
        query = User.query
        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active.is_(is_active))
        if email:
            query = query.filter(User.email.ilike(f"%{email}%"))
        return query.order_by(User.id.asc())

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
        if not user:
            return {"error": "Company user not found", "status": 404}

        user.is_active = not user.is_active
        db.session.commit()
        return {"status": 200, "is_active": user.is_active}
