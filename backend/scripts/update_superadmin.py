# scripts/update_superadmin.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password
from typing import Optional

def update_superadmin(
    db: Session,
    current_password: str,
    new_email: Optional[str] = None,
    new_username: Optional[str] = None,
    new_password: Optional[str] = None
) -> bool:
    # Find the super admin
    super_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
    if not super_admin:
        print("Error: No super admin found in the system!")
        return False

    # Verify current password
    if not verify_password(current_password, super_admin.hashed_password):
        print("Error: Current password is incorrect!")
        return False

    try:
        # Update email if provided
        if new_email:
            # Check if email already exists
            existing_user = db.query(User).filter(
                User.email == new_email,
                User.id != super_admin.id
            ).first()
            if existing_user:
                print("Error: Email already in use!")
                return False
            super_admin.email = new_email

        # Update username if provided
        if new_username:
            # Check if username already exists
            existing_user = db.query(User).filter(
                User.username == new_username,
                User.id != super_admin.id
            ).first()
            if existing_user:
                print("Error: Username already in use!")
                return False
            super_admin.username = new_username

        # Update password if provided
        if new_password:
            super_admin.hashed_password = get_password_hash(new_password)

        db.commit()
        print("Super admin credentials updated successfully!")
        return True

    except Exception as e:
        db.rollback()
        print(f"Error updating super admin credentials: {str(e)}")
        return False

def main():
    print("Update Super Admin Credentials")
    print("-" * 30)
    
    # Get current password for verification
    current_password = input("Enter current password: ")
    
    # Get new credentials (optional)
    print("\nLeave blank to keep current value:")
    new_email = input("New email (or press Enter to skip): ").strip() or None
    new_username = input("New username (or press Enter to skip): ").strip() or None
    new_password = input("New password (or press Enter to skip): ").strip() or None

    # Confirm if new password is provided
    if new_password:
        confirm_password = input("Confirm new password: ")
        if new_password != confirm_password:
            print("Error: Passwords do not match!")
            return

    if not any([new_email, new_username, new_password]):
        print("No changes requested!")
        return

    db = SessionLocal()
    try:
        update_superadmin(
            db, 
            current_password,
            new_email,
            new_username,
            new_password
        )
    finally:
        db.close()

if __name__ == "__main__":
    main()