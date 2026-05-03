from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    role = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class CompanyProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    company_name = fields.Str(required=True)
    description = fields.Str()
    logo_url = fields.Str()
    commission_rate = fields.Float()
    is_approved = fields.Bool()
    email = fields.Method("get_email")

    def get_email(self, obj):
        return obj.user.email if obj.user else None


class GuestProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    full_name = fields.Str(required=True)
    phone_number = fields.Str()
    avatar_url = fields.Str()
    email = fields.Method("get_email")

    def get_email(self, obj):
        return obj.user.email if obj.user else None
