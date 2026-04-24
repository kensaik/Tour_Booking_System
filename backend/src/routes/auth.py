from flask import Blueprint, request, jsonify
from src.extensions import db
from src.models.user import User, CompanyProfile, GuestProfile
from src.utils.auth import hash_password, check_password
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.constants import UserRole

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', UserRole.GUEST)

    if not email or not password:
        return jsonify(error="Bad Request", message="Email and password are required"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(error="Bad Request", message="Email is already registered"), 400

    if role not in [UserRole.COMPANY, UserRole.GUEST]:
        return jsonify(error="Bad Request", message="Invalid role. Must be COMPANY or GUEST"), 400

    new_user = User(
        email=email,
        password_hash=hash_password(password),
        role=role
    )
    db.session.add(new_user)
    db.session.flush() # To get new_user.id for profiles

    if role == UserRole.COMPANY:
        company_name = data.get('company_name')
        if not company_name:
            return jsonify(error="Bad Request", message="Company name is required for COMPANY role"), 400
        
        profile = CompanyProfile(
            user_id=new_user.id,
            company_name=company_name,
            description=data.get('description', '')
        )
        db.session.add(profile)
    else:
        full_name = data.get('full_name')
        if not full_name:
            return jsonify(error="Bad Request", message="Full name is required for GUEST role"), 400
        
        profile = GuestProfile(
            user_id=new_user.id,
            full_name=full_name,
            phone_number=data.get('phone_number')
        )
        db.session.add(profile)

    db.session.commit()
    return jsonify(message="User registered successfully", user_id=new_user.id), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password(password, user.password_hash):
        return jsonify(error="Unauthorized", message="Invalid email or password"), 401

    if not user.is_active:
        return jsonify(error="Forbidden", message="Account is deactivated"), 403

    access_token = create_access_token(identity=str(user.id))
    
    return jsonify(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    ), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify(error="Not Found", message="User not found"), 404
        
    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat()
    }
    
    if user.role == UserRole.COMPANY and user.company_profile:
        user_data["company_profile"] = {
            "company_name": user.company_profile.company_name,
            "description": user.company_profile.description,
            "commission_rate": user.company_profile.commission_rate,
            "is_approved": user.company_profile.is_approved
        }
    elif user.role == UserRole.GUEST and user.guest_profile:
        user_data["guest_profile"] = {
            "full_name": user.guest_profile.full_name,
            "phone_number": user.guest_profile.phone_number
        }
        
    return jsonify(user=user_data), 200
