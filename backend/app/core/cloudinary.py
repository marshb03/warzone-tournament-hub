# app/core/cloudinary.py
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from fastapi import HTTPException, UploadFile
from typing import Optional, Dict
import os
from app.core.config import settings

class CloudinaryService:
    def __init__(self):
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
    
    def validate_image_file(self, file: UploadFile) -> None:
        """Validate uploaded image file"""
        # Check file size (5MB max)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        
        # Reset file position to check size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=400, 
                detail="File size must be less than 5MB"
            )
        
        # Check file type
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/webp', 'image/gif'
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG, WebP, and GIF images are allowed"
            )
    
    async def upload_logo(self, file: UploadFile, user_id: int) -> Dict[str, str]:
        """Upload logo to Cloudinary and return URL and public_id"""
        try:
            # Validate file
            self.validate_image_file(file)
            
            # Read file contents
            file_content = await file.read()
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder="host-logos",
                public_id=f"host_{user_id}_{file.filename.split('.')[0]}",
                overwrite=True,
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "quality": "auto"}
                ]
            )
            
            return {
                "logo_url": upload_result["secure_url"],
                "logo_public_id": upload_result["public_id"]
            }
            
        except CloudinaryError as e:
            print(f"Cloudinary error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to upload image to Cloudinary"
            )
        except Exception as e:
            print(f"Upload error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to process image upload"
            )
    
    def delete_logo(self, public_id: str) -> bool:
        """Delete logo from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except CloudinaryError as e:
            print(f"Cloudinary delete error: {str(e)}")
            return False
        except Exception as e:
            print(f"Delete error: {str(e)}")
            return False
    
    def generate_default_avatar_url(self, text: str, width: int = 400, height: int = 400) -> str:
        """Generate a default avatar URL with text overlay"""
        try:
            # Create a simple colored background with text
            result = cloudinary.utils.cloudinary_url(
                "sample",  # Use a sample image as base
                transformation=[
                    {"width": width, "height": height, "crop": "fill", "background": "rgb:2979FF"},
                    {"overlay": {"font_family": "Arial", "font_size": str(int(width * 0.3)), "text": text.upper()}, "color": "white", "gravity": "center"}
                ]
            )
            return result[0]
        except Exception as e:
            print(f"Default avatar generation error: {str(e)}")
            # Return a simple data URL as fallback
            return f"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI5NzlGRiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj57dGV4dC51cHBlcigpfTwvdGV4dD48L3N2Zz4="

# Create singleton instance
cloudinary_service = CloudinaryService()