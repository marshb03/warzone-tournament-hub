# scripts/create_superadmin.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_superadmin(db: Session, email: str, username: str, password: str) -> User:
    # Check if a super admin already exists
    existing_super_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
    if existing_super_admin:
        print("Error: A super admin already exists!")
        return None

    # Create the super admin user
    super_admin = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(password),
        is_active=True,
        is_verified=True,  # Auto-verify the super admin
        role=UserRole.SUPER_ADMIN
    )

    try:
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        print(f"Successfully created super admin user: {username}")
        return super_admin
    except Exception as e:
        db.rollback()
        print(f"Error creating super admin: {str(e)}")
        return None

def main():
    print("Creating Super Admin Account")
    print("-" * 30)
    
    email = input("Enter email: ")
    username = input("Enter username: ")
    password = input("Enter password: ")

    db = SessionLocal()
    try:
        create_superadmin(db, email, username, password)
    finally:
        db.close()

if __name__ == "__main__":
    main()