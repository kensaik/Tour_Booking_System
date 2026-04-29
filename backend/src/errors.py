from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify(
            {
                "error": "Bad Request",
                "message": str(
                    error.description if hasattr(error, "description") else error
                ),
            }
        ), 400

    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify(
            {
                "error": "Unauthorized",
                "message": str(
                    error.description if hasattr(error, "description") else error
                ),
            }
        ), 401

    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify(
            {
                "error": "Forbidden",
                "message": str(
                    error.description if hasattr(error, "description") else error
                ),
            }
        ), 403

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify(
            {"error": "Not Found", "message": "The requested resource was not found."}
        ), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify(
            {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred.",
            }
        ), 500
