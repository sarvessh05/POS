from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, database, auth

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=schemas.SettingsResponse)
def get_settings(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get settings for current admin"""
    if current_user.role == "sysadmin":
        raise HTTPException(status_code=403, detail="Sysadmin cannot access settings")
    
    settings = db.query(models.Settings).filter(models.Settings.admin_id == current_user.id).first()
    
    # Create default settings if not exists
    if not settings:
        settings = models.Settings(
            admin_id=current_user.id,
            hotel_name=current_user.business_name or "My Restaurant",
            phone=current_user.phone,
            total_tables=10
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/", response_model=schemas.SettingsResponse)
def update_settings(
    settings_update: schemas.SettingsUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update settings for current admin"""
    if current_user.role == "sysadmin":
        raise HTTPException(status_code=403, detail="Sysadmin cannot access settings")
    
    settings = db.query(models.Settings).filter(models.Settings.admin_id == current_user.id).first()
    
    if not settings:
        # Create new settings
        settings = models.Settings(admin_id=current_user.id)
        db.add(settings)
    
    # Update fields
    for key, value in settings_update.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings
