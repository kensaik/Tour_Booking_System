from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from src.extensions import db
from src.models.user import User
from src.serializers.user_schema import (
    CompanyProfileSchema,
    GuestProfileSchema,
    UserSchema,
)
from src.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    result = AuthService.register_user(data)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="User registered successfully", user_id=result["user"].id
    ), result["status"]


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    result = AuthService.login_user(email, password)

    if "error" in result:
        return jsonify(error="Auth Error", message=result["error"]), result["status"]

    user = result["user"]
    access_token = create_access_token(identity=str(user.id))

    user_data = UserSchema().dump(user)
    user_data["is_active"] = user.is_active

    if user.company_profile:
        user_data["full_name"] = user.company_profile.company_name
    elif user.guest_profile:
        user_data["full_name"] = user.guest_profile.full_name

    return jsonify(access_token=access_token, user=user_data), result[
        "status"
    ]


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify(error="Not Found", message="User not found"), 404

    user_data = UserSchema().dump(user)
    user_data["is_active"] = user.is_active

    if user.company_profile:
        user_data["full_name"] = user.company_profile.company_name
        user_data["company_profile"] = CompanyProfileSchema().dump(user.company_profile)
    elif user.guest_profile:
        user_data["full_name"] = user.guest_profile.full_name
        user_data["guest_profile"] = GuestProfileSchema().dump(user.guest_profile)

    return jsonify(user=user_data), 200
