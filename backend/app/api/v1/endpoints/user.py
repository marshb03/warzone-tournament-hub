# app/api/v1/endpoints/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.api import deps
from app.schemas.user import User, UserCreate
from app.models.user import UserRole

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create_user(db=db, user=user)

@router.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create_user(db=db, user=user)

@router.get("/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    users = crud.user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(deps.get_db)):
    db_user = crud.user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = crud.user.update_user(db=db, user_id=user_id, user_update=user_update)
    return updated_user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = crud.user.delete_user(db=db, user_id=user_id)
    return deleted_user

@router.get("/hosts", response_model=List[schemas.User])
def get_all_hosts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Retrieve all hosts (Super Admin only).
    """
    return crud.user.get_users(db, skip=skip, limit=limit, role=UserRole.HOST)

@router.get("/", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    include_inactive: bool = False,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Retrieve all users with optional filtering (Super Admin only).
    """
    return crud.user.get_users(
        db, 
        skip=skip, 
        limit=limit, 
        role=role,
        include_inactive=include_inactive
    )

@router.put("/{user_id}/promote", response_model=schemas.User)
def promote_to_host(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Promote a regular user to Host status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a host or super admin
    if user.role != UserRole.USER:
        raise HTTPException(
            status_code=400,
            detail=f"User is already a {user.role.value}"
        )
    
    return crud.user.update_user_role(
        db=db,
        user_id=user_id,
        new_role=UserRole.HOST,
        super_admin_id=current_user.id
    )

@router.put("/{user_id}/demote", response_model=schemas.User)
def demote_to_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Demote a Host back to regular user status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is a host
    if user.role != UserRole.HOST:
        raise HTTPException(
            status_code=400,
            detail="User is not a Host"
        )
    
    return crud.user.update_user_role(
        db=db,
        user_id=user_id,
        new_role=UserRole.USER,
        super_admin_id=current_user.id
    )

@router.put("/{user_id}/toggle-active", response_model=schemas.User)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Toggle a user's active status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deactivating super admin
    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate super admin account"
        )
    
    return crud.user.toggle_user_active_status(
        db=db,
        user_id=user_id,
        super_admin_id=current_user.id
    )