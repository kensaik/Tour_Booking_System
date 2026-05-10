import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify(error="No file part"), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify(error="No selected file"), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add uuid to avoid filename collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"

        upload_path = os.path.join(current_app.root_path, 'static', 'uploads')
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)

        file.save(os.path.join(upload_path, unique_filename))

        # In a real app, this would be a full URL.
        # For local dev, we return the relative path from the static folder
        file_url = f"/static/uploads/{unique_filename}"

        return jsonify(url=file_url), 200

    return jsonify(error="File type not allowed"), 400
