from marshmallow import Schema, fields


class PaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    amount = fields.Float(required=True)
    payment_method = fields.Str(required=True)
    status = fields.Str()
    transaction_id = fields.Str()
    created_at = fields.DateTime(dump_only=True)


class BookingSchema(Schema):
    id = fields.Int(dump_only=True)
    num_people = fields.Int(required=True)
    total_price = fields.Float(dump_only=True)
    payment_status = fields.Str(dump_only=True)
    booking_status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    
    # Contact info
    contact_name = fields.Str()
    contact_email = fields.Str()
    contact_phone = fields.Str()
    notes = fields.Str()

    # Nested/Method fields for context
    guest_name = fields.Method("get_guest_name")
    guest_phone = fields.Method("get_guest_phone")
    tour = fields.Method("get_tour_info")
    departure = fields.Method("get_departure_info")

    def get_guest_name(self, obj):
        return obj.guest.full_name if obj.guest else None

    def get_guest_phone(self, obj):
        return obj.guest.phone_number if obj.guest else None

    def get_tour_info(self, obj):
        if obj.departure and obj.departure.tour:
            t = obj.departure.tour
            return {"id": t.id, "name": t.name, "image_url": t.image_url}
        return None

    def get_departure_info(self, obj):
        if obj.departure:
            return {"id": obj.departure.id, "start_date": obj.departure.start_date.isoformat()}
        return None
