from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from src.constants import TourStatus
from src.extensions import db
from src.models.tour import Destination, Tour

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.route("/destinations", methods=["GET"])
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


@public_bp.route("/tours", methods=["GET"])
def get_tours():
    destination_id = request.args.get("destination_id")
    keyword = request.args.get("keyword")

    query = Tour.query.filter_by(status=TourStatus.ACTIVE)

    if destination_id:
        query = query.filter_by(destination_id=int(destination_id))

    if keyword:
        search_pattern = f"%{keyword}%"
        query = query.filter(
            or_(Tour.name.ilike(search_pattern), Tour.description.ilike(search_pattern))
        )

    tours = query.all()
    result = []
    for t in tours:
        result.append(
            {
                "id": t.id,
                "company_name": t.company.company_name if t.company else None,
                "destination": t.destination.name if t.destination else None,
                "name": t.name,
                "description": t.description,
                "price": t.price,
                "total_days": t.total_days,
                "image_url": t.image_url,
            }
        )

    return jsonify(tours=result), 200


@public_bp.route("/tours/<int:id>", methods=["GET"])
def get_tour_detail(id):
    tour = db.session.get(Tour, id)

    if not tour or tour.status != TourStatus.ACTIVE:
        return jsonify(error="Not Found", message="Tour not found or not active"), 404

    itineraries = [
        {
            "day_number": iti.day_number,
            "title": iti.title,
            "description": iti.description,
        }
        for iti in tour.itineraries.all()
    ]

    # Only return departures that have not started yet and have available seats
    now = datetime.utcnow()
    valid_departures = []
    for dep in tour.departures.all():
        if dep.start_date > now and dep.available_seats > 0:
            valid_departures.append(
                {
                    "id": dep.id,
                    "start_date": dep.start_date.isoformat(),
                    "end_date": dep.end_date.isoformat(),
                    "total_seats": dep.total_seats,
                    "available_seats": dep.available_seats,
                    "guide_name": dep.guide_name,
                    "status": dep.status,
                }
            )

    result = {
        "id": tour.id,
        "company_name": tour.company.company_name if tour.company else None,
        "destination": tour.destination.name if tour.destination else None,
        "name": tour.name,
        "description": tour.description,
        "price": tour.price,
        "total_days": tour.total_days,
        "image_url": tour.image_url,
        "itineraries": itineraries,
        "departures": valid_departures,
    }

    return jsonify(tour=result), 200
