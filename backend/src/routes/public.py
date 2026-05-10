from flask import Blueprint, jsonify, request

from src.serializers.tour_schema import DestinationSchema, TourSchema
from src.services.public_service import PublicService
from src.utils.rate_limit import limiter

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.route("/destinations", methods=["GET"])
def get_destinations():
    destinations = PublicService.get_all_destinations()
    return jsonify(destinations=DestinationSchema(many=True).dump(destinations)), 200


@public_bp.route("/tours", methods=["GET"])
@limiter.limit("60/minute")
def get_tours():
    destination_id = request.args.get("destination_id")
    keyword = request.args.get("keyword")
    start_date = request.args.get("date")
    min_guests = request.args.get("guests")

    tours = PublicService.search_active_tours(
        destination_id=destination_id,
        keyword=keyword,
        start_date=start_date,
        min_guests=min_guests,
    )

    tour_schema = TourSchema(many=True, exclude=("itineraries", "departures"))
    return jsonify(tours=tour_schema.dump(tours)), 200


@public_bp.route("/tours/<int:id>", methods=["GET"])
def get_tour_detail(id):
    tour = PublicService.get_tour_detail(id)
    if not tour:
        return jsonify(error="Not Found", message="Tour not found or not active"), 404

    return jsonify(tour=TourSchema().dump(tour)), 200
