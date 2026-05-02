from flask import Flask

from .config import Config
from .errors import register_error_handlers
from .extensions import cors, db, jwt, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    import os

    migrate_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "database",
        "migrations",
    )
    migrate.init_app(app, db, directory=migrate_dir)
    cors.init_app(app)
    jwt.init_app(app)

    # Import models to ensure SQLAlchemy knows about them before migrations
    import src.models

    # Register error handlers
    register_error_handlers(app)

    # Register Blueprints here
    from src.routes import main_bp
    from src.routes.admin import admin_bp
    from src.routes.auth import auth_bp
    from src.routes.company import company_bp
    from src.routes.guest import guest_bp
    from src.routes.public import public_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(guest_bp)

    return app
