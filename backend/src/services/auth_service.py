from src.constants import UserRole
from src.extensions import db
from src.models.user import CompanyProfile, GuestProfile, User
from src.utils.auth import check_password, hash_password


class AuthService:
    @staticmethod
    def register_user(data):
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", UserRole.GUEST)

        if not email or not password:
            return {"error": "Email and password are required", "status": 400}

        if User.query.filter_by(email=email).first():
            return {"error": "Email is already registered", "status": 400}

        if role not in [UserRole.COMPANY, UserRole.GUEST]:
            return {"error": "Invalid role. Must be COMPANY or GUEST", "status": 400}

        new_user = User(email=email, password_hash=hash_password(password), role=role)
        db.session.add(new_user)
        db.session.flush()

        if role == UserRole.COMPANY:
            company_name = data.get("company_name")
            if not company_name:
                db.session.rollback()
                return {
                    "error": "Company name is required for COMPANY role",
                    "status": 400,
                }

            profile = CompanyProfile(
                user_id=new_user.id,
                company_name=company_name,
                description=data.get("description", ""),
            )
            db.session.add(profile)
        else:
            full_name = data.get("full_name")
            if not full_name:
                db.session.rollback()
                return {"error": "Full name is required for GUEST role", "status": 400}

            profile = GuestProfile(
                user_id=new_user.id,
                full_name=full_name,
                phone_number=data.get("phone_number"),
            )
            db.session.add(profile)

        db.session.commit()
        return {"user": new_user, "status": 201}

    @staticmethod
    def login_user(email, password):
        user = User.query.filter_by(email=email).first()

        if not user or not check_password(password, user.password_hash):
            return {"error": "Invalid email or password", "status": 401}

        if not user.is_active:
            return {"error": "Account is deactivated", "status": 403}

        return {"user": user, "status": 200}
