import os
from functools import wraps

import bcrypt
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from src.constants import UserRole
from src.extensions import db
from src.models.user import User


def _bcrypt_rounds() -> int:
    # Allow non-production envs (CI/E2E/dev) to use a cheap cost factor so login
    # latency does not dominate parallel test runs. Bcrypt default is 12.
    raw = os.environ.get("BCRYPT_ROUNDS")
    if raw:
        try:
            return max(4, min(15, int(raw)))
        except ValueError:
            pass
    if os.environ.get("FLASK_ENV") == "production":
        return 12
    return 4


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=_bcrypt_rounds())
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user or user.role != UserRole.ADMIN:
                return jsonify(
                    error="Forbidden", message="Admin privilege required"
                ), 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


def company_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user or user.role != UserRole.COMPANY:
                return jsonify(
                    error="Forbidden", message="Company privilege required"
                ), 403
            if not user.company_profile or not user.company_profile.is_approved:
                return jsonify(
                    error="Forbidden", message="Company is not approved by Admin yet"
                ), 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


def guest_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user or user.role != UserRole.GUEST:
                return jsonify(
                    error="Forbidden", message="Guest privilege required"
                ), 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper
