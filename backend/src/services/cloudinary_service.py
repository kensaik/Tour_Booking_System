import cloudinary
import cloudinary.uploader
from flask import current_app


def configure_cloudinary():
    """Khởi tạo Cloudinary với config từ environment"""
    if not current_app:
        return

    cloudinary.config(
        cloud_name=current_app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=current_app.config.get("CLOUDINARY_API_KEY"),
        api_secret=current_app.config.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_image(file_data: str, folder: str = "tour_booking") -> dict:
    """
    Upload ảnh Base64 lên Cloudinary

    Args:
        file_data: Base64 string của ảnh (data:image/...;base64,...)
        folder: Thư mục lưu trên Cloudinary

    Returns:
        dict với url, public_id của ảnh
    """
    try:

        if "," in file_data:
            file_data = file_data.split(",")[1]

        result = cloudinary.uploader.upload(
            file_data,
            folder=folder,
            resource_type="image",
            transformation=[
                {
                    "width": 1200,
                    "height": 800,
                    "crop": "limit",
                    "quality": "auto",
                    "fetch_format": "auto",
                }
            ],
        )

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height"),
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return {"error": str(e)}


def delete_image(public_id: str) -> bool:
    """Xóa ảnh khỏi Cloudinary"""
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False


def get_optimized_url(public_id: str, width: int = 800) -> str:
    """Lấy URL ảnh đã optimize với kích thước mong muốn"""
    return cloudinary.url(
        public_id,
        transformation=[
            {"width": width, "crop": "limit", "quality": "auto", "fetch_format": "auto"}
        ],
    )
