from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"detail": "Not found"}},
)

@router.get("/", response_model=List[schemas.ItemResponse])
def read_items(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get items - filtered by admin_id for multi-tenant isolation"""
    if current_user.role == 'sysadmin':
        # SysAdmin can see all items (read-only)
        items = db.query(models.Item).offset(skip).limit(limit).all()
    else:
        # Admin sees only their own items
        items = db.query(models.Item).filter(
            models.Item.admin_id == current_user.id
        ).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=schemas.ItemResponse)
def create_item(
    item: schemas.ItemCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Create item - auto-assign admin_id"""
    if current_user.role == 'sysadmin':
        raise HTTPException(status_code=403, detail="SysAdmin cannot create items")
    
    # Auto-assign admin_id for multi-tenant isolation
    db_item = models.Item(**item.model_dump(), admin_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=schemas.ItemResponse)
def update_item(
    item_id: int, 
    item: schemas.ItemUpdate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Update item - check ownership"""
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Security check: prevent cross-admin access
    if current_user.role != 'sysadmin' and db_item.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied - not your item")
    
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(
    item_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_admin_user)
):
    """Delete item - check ownership"""
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Security check: prevent cross-admin access
    if current_user.role != 'sysadmin' and db_item.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied - not your item")
    
    db.delete(db_item)
    db.commit()
    return {"ok": True}
