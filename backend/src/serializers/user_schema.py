from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    role = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    company_profile = fields.Nested(
        "CompanyProfileSchema", exclude=("email", "is_active", "created_at")
    )
    guest_profile = fields.Nested("GuestProfileSchema", exclude=("email",))


class CompanyProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    company_name = fields.Str(required=True)
    description = fields.Str()
    logo_url = fields.Str()
    commission_rate = fields.Float()
    is_approved = fields.Bool()
    email = fields.Method("get_email")
    is_active = fields.Method("get_is_active")
    created_at = fields.Method("get_created_at")
    total_revenue = fields.Float(dump_only=True)
    tours_count = fields.Int(dump_only=True)
    bookings_count = fields.Int(dump_only=True)

    def get_email(self, obj):
        return obj.user.email if obj and obj.user else None

    def get_is_active(self, obj):
        if not obj or not obj.user:
            return True
        return bool(obj.user.is_active)

    def get_created_at(self, obj):
        if not obj or not obj.user or not obj.user.created_at:
            return None
        return obj.user.created_at.isoformat()


class GuestProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    full_name = fields.Str(required=True)
    phone_number = fields.Str()
    avatar_url = fields.Str()
    email = fields.Method("get_email")

    def get_email(self, obj):
        return obj.user.email if obj.user else None
