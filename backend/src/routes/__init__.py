from flask import Blueprint

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'Tour Booking System API is running!'}
