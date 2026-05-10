from flask import Blueprint, jsonify, request

from src.serializers.tour_schema import DestinationSchema
from src.serializers.user_schema import AdminUserSchema, CompanyProfileSchema
from src.services.admin_service import AdminService
from src.utils.auth import admin_required
from src.utils.query_helpers import build_envelope_or_list, to_bool

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/destinations", methods=["GET"])
@admin_required()
def get_destinations():
    destinations = AdminService.get_all_destinations()
    return jsonify(destinations=DestinationSchema(many=True).dump(destinations)), 200


@admin_bp.route("/destinations", methods=["POST"])
@admin_required()
def create_destination():
    data = request.get_json()
    result = AdminService.create_destination(data)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Destination created successfully",
        destination=DestinationSchema().dump(result["destination"]),
    ), 201


@admin_bp.route("/destinations/<int:id>", methods=["PUT"])
@admin_required()
def update_destination(id):
    data = request.get_json()
    result = AdminService.update_destination(id, data)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Destination updated successfully",
        destination=DestinationSchema().dump(result["destination"]),
    ), 200


@admin_bp.route("/destinations/<int:id>", methods=["DELETE"])
@admin_required()
def delete_destination(id):
    result = AdminService.delete_destination(id)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(message="Destination deleted successfully"), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required()
def get_users():
    try:
        is_active = to_bool(request.args.get("is_active"))
        query = AdminService.get_users_query(
            role=request.args.get("role"),
            is_active=is_active,
            email=request.args.get("email"),
        )
        schema = AdminUserSchema(many=True)
        return jsonify(
            build_envelope_or_list(query, request.args, "users", schema.dump)
        ), 200
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400


@admin_bp.route("/companies", methods=["GET"])
@admin_required()
def get_companies():
    status_filter = request.args.get("status")
    keyword = request.args.get("keyword")
    query = AdminService.get_companies_query(status_filter, keyword)
    schema = CompanyProfileSchema(many=True)
    try:
        return jsonify(
            build_envelope_or_list(query, request.args, "companies", schema.dump)
        ), 200
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400


@admin_bp.route("/companies/<int:id>/approve", methods=["PUT"])
@admin_required()
def approve_company(id):
    result = AdminService.approve_company(id)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(message=result.get("message", "Company approved successfully")), 200


@admin_bp.route("/companies/<int:id>/commission", methods=["PUT"])
@admin_required()
def update_commission(id):
    data = request.get_json()
    new_rate = data.get("commission_rate")

    result = AdminService.update_commission(id, new_rate)
    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    return jsonify(
        message="Commission rate updated successfully",
        commission_rate=result["company"].commission_rate,
    ), 200


@admin_bp.route("/companies/<int:id>/toggle-status", methods=["PUT"])
@admin_required()
def toggle_company_status(id):
    result = AdminService.toggle_company_status(id)

    if "error" in result:
        return jsonify(error="Bad Request", message=result["error"]), result["status"]

    status_str = "activated" if result["is_active"] else "deactivated"
    return jsonify(
        message=f"Company {status_str} successfully",
        is_active=result["is_active"],
    ), 200
