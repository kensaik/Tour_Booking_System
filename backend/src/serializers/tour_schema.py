from marshmallow import Schema, fields


class DestinationSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    image_url = fields.Str()


class TourItinerarySchema(Schema):
    id = fields.Int(dump_only=True)
    day_number = fields.Int(required=True)
    title = fields.Str(required=True)
    description = fields.Str()


class MinimalTourSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    price = fields.Float()


class DepartureSchema(Schema):
    id = fields.Int(dump_only=True)
    tour_id = fields.Int(dump_only=True)
    start_date = fields.DateTime(required=True)
    end_date = fields.DateTime(required=True)
    total_seats = fields.Int(required=True)
    available_seats = fields.Int(dump_only=True)
    guide_name = fields.Str()
    status = fields.Str()
    tour = fields.Nested(MinimalTourSchema, dump_only=True)


class TourSchema(Schema):
    id = fields.Int(dump_only=True)
    company_id = fields.Int(dump_only=True)
    company_name = fields.Method("get_company_name")
    destination_id = fields.Int(required=True)
    destination = fields.Method("get_destination_name")
    name = fields.Str(required=True)
    description = fields.Str()
    price = fields.Float(required=True)
    total_days = fields.Int(required=True)
    status = fields.Str()
    image_url = fields.Str()
    created_at = fields.DateTime(dump_only=True)

    itineraries = fields.Method("get_itineraries")
    departures = fields.Method("get_valid_departures")

    def get_company_name(self, obj):
        return obj.company.company_name if obj.company else None

    def get_destination_name(self, obj):
        return obj.destination.name if obj.destination else None

    def get_itineraries(self, obj):
        iti = (
            obj.itineraries.all()
            if hasattr(obj.itineraries, "all")
            else obj.itineraries
        )
        return TourItinerarySchema(many=True).dump(iti)

    def get_valid_departures(self, obj):
        deps = getattr(
            obj,
            "_valid_departures",
            obj.departures.all() if hasattr(obj.departures, "all") else obj.departures,
        )
        return DepartureSchema(many=True).dump(deps)
