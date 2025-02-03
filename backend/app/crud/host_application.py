# app/crud/host_application.py
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.host_application import HostApplication, ApplicationStatus
from app.models.user import User, UserRole
from app.schemas.host_application import HostApplicationCreate, HostApplicationUpdate

def create_application(db: Session, application: HostApplicationCreate, user_id: int) -> HostApplication:
    db_application = HostApplication(
        user_id=user_id,
        **application.dict()
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_application(db: Session, application_id: int) -> Optional[HostApplication]:
    return db.query(HostApplication).filter(HostApplication.id == application_id).first()

def get_user_applications(db: Session, user_id: int) -> List[HostApplication]:
    return db.query(HostApplication).filter(HostApplication.user_id == user_id).all()

def get_pending_applications(db: Session) -> List[HostApplication]:
    return db.query(HostApplication)\
        .filter(HostApplication.status == ApplicationStatus.PENDING)\
        .order_by(HostApplication.created_at.desc())\
        .all()

def update_application_status(
    db: Session,
    application_id: int,
    status: ApplicationStatus,
    admin_user: User
) -> Optional[HostApplication]:
    application = get_application(db, application_id)
    if not application:
        return None
    
    application.status = status
    
    # If approved, update user role
    if status == ApplicationStatus.APPROVED:
        user = db.query(User).filter(User.id == application.user_id).first()
        if user:
            user.role = UserRole.HOST
    
    db.commit()
    db.refresh(application)
    return application

def check_pending_application(db: Session, user_id: int) -> bool:
    """Check if user has a pending application"""
    return db.query(HostApplication)\
        .filter(
            HostApplication.user_id == user_id,
            HostApplication.status == ApplicationStatus.PENDING
        )\
        .first() is not None