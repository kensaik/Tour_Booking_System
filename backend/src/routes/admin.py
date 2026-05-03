from flask import Blueprint, jsonify, request

from src.extensions import db
from src.models.tour import Destination
from src.models.user import CompanyProfile
from src.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/destinations", methods=["GET"])
@admin_required()
def get_destinations():
    destinations = Destination.query.all()
    result = [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "image_url": d.image_url,
        }
        for d in destinations
    ]
    return jsonify(destinations=result), 200


@admin_bp.route("/destinations", methods=["POST"])
@admin_required()
def create_destination():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description", "")
    image_url = data.get("image_url")

    if not name:
        return jsonify(error="Bad Request", message="Destination name is required"), 400

    if Destination.query.filter_by(name=name).first():
        return jsonify(
            error="Bad Request", message="Destination name already exists"
        ), 400

    new_dest = Destination(name=name, description=description, image_url=image_url)
    db.session.add(new_dest)
    db.session.commit()

    return jsonify(
        message="Destination created successfully",
        destination={
            "id": new_dest.id,
            "name": new_dest.name,
            "image_url": new_dest.image_url,
        },
    ), 201


@admin_bp.route("/destinations/<int:id>", methods=["PUT"])
@admin_required()
def update_destination(id):
    destination = db.session.get(Destination, id)
    if not destination:
        return jsonify(error="Not Found", message="Destination not found"), 404

    data = request.get_json()
    name = data.get("name")

    if name:
        existing = Destination.query.filter_by(name=name).first()
        if existing and existing.id != id:
            return jsonify(
                error="Bad Request", message="Destination name already exists"
            ), 400
        destination.name = name

    if "description" in data:
        destination.description = data.get("description")

    if "image_url" in data:
        destination.image_url = data.get("image_url")

    db.session.commit()
    return jsonify(
        message="Destination updated successfully",
        destination={
            "id": destination.id,
            "name": destination.name,
            "image_url": destination.image_url,
        },
    ), 200


@admin_bp.route("/destinations/<int:id>", methods=["DELETE"])
@admin_required()
def delete_destination(id):
    destination = db.session.get(Destination, id)
    if not destination:
        return jsonify(error="Not Found", message="Destination not found"), 404

    if destination.tours.count() > 0:
        return jsonify(
            error="Bad Request",
            message="Cannot delete destination because it is linked to existing tours",
        ), 400

    db.session.delete(destination)
    db.session.commit()
    return jsonify(message="Destination deleted successfully"), 200


@admin_bp.route("/companies", methods=["GET"])
@admin_required()
def get_companies():
    status_filter = request.args.get("status")

    query = CompanyProfile.query
    if status_filter == "pending":
        query = query.filter_by(is_approved=False)

    companies = query.all()
    result = []
    for c in companies:
        result.append(
            {
                "id": c.id,
                "user_id": c.user_id,
                "company_name": c.company_name,
                "description": c.description,
                "logo_url": c.logo_url,
                "commission_rate": c.commission_rate,
                "is_approved": c.is_approved,
                "email": c.user.email,
            }
        )

    return jsonify(companies=result), 200


@admin_bp.route("/companies/<int:id>/approve", methods=["PUT"])
@admin_required()
def approve_company(id):
    company = db.session.get(CompanyProfile, id)
    if not company:
        return jsonify(error="Not Found", message="Company not found"), 404

    if company.is_approved:
        return jsonify(message="Company is already approved"), 200

    company.is_approved = True
    db.session.commit()
    return jsonify(message="Company approved successfully"), 200


@admin_bp.route("/companies/<int:id>/commission", methods=["PUT"])
@admin_required()
def update_commission(id):
    company = db.session.get(CompanyProfile, id)
    if not company:
        return jsonify(error="Not Found", message="Company not found"), 404

    data = request.get_json()
    new_rate = data.get("commission_rate")

    if new_rate is None or not isinstance(new_rate, int | float):
        return jsonify(
            error="Bad Request", message="Valid commission_rate is required"
        ), 400

    if new_rate < 0 or new_rate > 100:
        return jsonify(
            error="Bad Request", message="Commission rate must be between 0 and 100"
        ), 400

    company.commission_rate = float(new_rate)
    db.session.commit()
    return jsonify(
        message="Commission rate updated successfully",
        commission_rate=company.commission_rate,
    ), 200
