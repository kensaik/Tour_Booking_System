from flask import Flask
from .config import Config
from .extensions import db, migrate, cors, jwt
from .errors import register_error_handlers

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    jwt.init_app(app)

    # Register error handlers
    register_error_handlers(app)

    # Register Blueprints here
    from src.routes import main_bp
    app.register_blueprint(main_bp)

    return app
