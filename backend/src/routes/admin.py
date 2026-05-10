from flask import Blueprint, jsonify, request
from marshmallow import Schema, fields

from src.serializers.tour_schema import DestinationSchema
from src.serializers.user_schema import CompanyProfileSchema
from src.services.admin_service import AdminService
from src.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


class _AdminUserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email()
    role = fields.Str()
    is_active = fields.Bool()
    created_at = fields.DateTime()


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


@admin_bp.route("/companies", methods=["GET"])
@admin_required()
def get_companies():
    schema = CompanyProfileSchema(many=True)
    try:
        result = AdminService.list_companies(request.args, schema.dump)
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400
    return jsonify(result), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required()
def get_users():
    schema = _AdminUserSchema(many=True)
    try:
        result = AdminService.list_users(request.args, schema.dump)
    except ValueError as exc:
        return jsonify(error="Bad Request", message=str(exc)), 400
    return jsonify(result), 200


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
        message=f"Company {status_str} successfully", is_active=result["is_active"]
    ), 200


@admin_bp.route("/stats", methods=["GET"])
@admin_required()
def get_stats():
    stats = AdminService.get_stats()
    return jsonify(stats), 200
