# app/api/v1/endpoints/host_applications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.user import User, UserRole
from app.models.host_application import ApplicationStatus
from app.schemas.host_application import (
    HostApplication,
    HostApplicationCreate,
    HostApplicationUpdate
)
from app.crud import host_application as crud

router = APIRouter()

@router.post("/", response_model=HostApplication)
async def create_application(
    application: HostApplicationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a new host application"""
    # Check if user already has a pending application
    if crud.check_pending_application(db, current_user.id):
        raise HTTPException(
            status_code=400,
            detail="You already have a pending application"
        )
    
    return crud.create_application(db, application, current_user.id)

@router.get("/me", response_model=List[HostApplication])
async def get_my_applications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get current user's applications"""
    return crud.get_user_applications(db, current_user.id)

@router.get("/", response_model=List[HostApplication])
async def get_applications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """Get all pending applications (admin only)"""
    return crud.get_pending_applications(db)

@router.put("/{application_id}/approve")
async def approve_application(
    application_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """Approve a host application"""
    application = crud.update_application_status(
        db, application_id, ApplicationStatus.APPROVED, current_user
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.put("/{application_id}/reject")
async def reject_application(
    application_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """Reject a host application"""
    application = crud.update_application_status(
        db, application_id, ApplicationStatus.REJECTED, current_user
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application