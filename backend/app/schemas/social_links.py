# app/schemas/social_links.py (Updated with relaxed validation)
from pydantic import BaseModel, validator
from typing import Optional
from app.models.user_social_links import SocialPlatform

class SocialLinkBase(BaseModel):
    platform: SocialPlatform
    username: str
    url: str

    @validator('url', pre=True, always=True)
    def validate_url(cls, v, values):
        """Validate URL format based on platform"""
        if not v or v.strip() == "":
            # Auto-generate URL if not provided
            platform = values.get('platform')
            username = values.get('username', '')
            if platform and username:
                return generate_social_url(platform, username)
        
        # If URL is provided, do basic validation
        if not v.startswith(('http://', 'https://')):
            return f"https://{v}"
        
        return v

class SocialLinkCreate(SocialLinkBase):
    url: Optional[str] = None  # Make URL optional for creation
    
    @validator('url', pre=True, always=True)
    def auto_generate_url(cls, v, values):
        """Auto-generate URL if not provided"""
        if not v or v.strip() == "":
            platform = values.get('platform')
            username = values.get('username', '')
            if platform and username:
                return generate_social_url(platform, username)
        return v or ""

class SocialLinkUpdate(BaseModel):
    username: Optional[str] = None
    url: Optional[str] = None

class SocialLink(SocialLinkBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Helper function to generate URL from username
def generate_social_url(platform: SocialPlatform, username: str) -> str:
    """Generate full URL from username for each platform"""
    base_urls = {
        SocialPlatform.TWITTER: "https://twitter.com/",
        SocialPlatform.TWITCH: "https://twitch.tv/",
        SocialPlatform.YOUTUBE: "https://youtube.com/@",
        SocialPlatform.DISCORD: "https://discord.gg/",
        SocialPlatform.INSTAGRAM: "https://instagram.com/",
        SocialPlatform.TIKTOK: "https://tiktok.com/@",
        SocialPlatform.FACEBOOK: "https://facebook.com/",
        SocialPlatform.KICK: "https://kick.com/"
    }
    
    base_url = base_urls.get(platform, "")
    # Remove @ symbol if present for platforms that don't need it in URL
    clean_username = username.lstrip('@') if platform != SocialPlatform.YOUTUBE else username
    
    return f"{base_url}{clean_username}"