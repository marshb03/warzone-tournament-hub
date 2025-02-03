# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    current_password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    username: str
    role: UserRole
    is_active: bool
    is_verified: bool

    @property
    def is_superuser(self) -> bool:
        return self.role == UserRole.SUPER_ADMIN

    @property
    def is_host(self) -> bool:
        return self.role == UserRole.HOST

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class UserInTournament(BaseModel):
    id: int
    username: str
    role: UserRole

    class Config:
        from_attributes = True
        
class UserInApplication(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True