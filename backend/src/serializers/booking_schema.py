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
    tour_name = fields.Method("get_tour_name")
    start_date = fields.Method("get_start_date")

    def get_guest_name(self, obj):
        return obj.guest.full_name if obj.guest else None

    def get_guest_phone(self, obj):
        return obj.guest.phone_number if obj.guest else None

    def get_tour_name(self, obj):
        if obj.departure and obj.departure.tour:
            return obj.departure.tour.name
        return None

    def get_start_date(self, obj):
        if obj.departure:
            return obj.departure.start_date.isoformat()
        return None
