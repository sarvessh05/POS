from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import models, schemas, database, auth

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    print(f"=== LOGIN REQUEST RECEIVED ===")
    print(f"Username: {form_data.username}")
    print(f"Password provided: {'Yes' if form_data.password else 'No'}")
    
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    print(f"User found: {'Yes' if user else 'No'}")
    
    if not user:
        print("ERROR: User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    password_match = auth.verify_password(form_data.password, user.hashed_password)
    print(f"Password match: {password_match}")
    
    if not password_match:
        print("ERROR: Password mismatch")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    print(f"=== LOGIN SUCCESS ===")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_admin_user)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username, 
        hashed_password=hashed_password, 
        role=user.role,
        business_name=user.business_name,
        phone=user.phone,
        subscription_status=user.subscription_status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.get("/users/", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_sysadmin_user)):
    """Get all users - System Admin only"""
    users = db.query(models.User).all()
    return users

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_sysadmin_user)):
    """Update user - System Admin only"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username is being changed and if it's already taken
    if user_update.username != db_user.username:
        existing_user = db.query(models.User).filter(models.User.username == user_update.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    db_user.username = user_update.username
    db_user.role = user_update.role
    db_user.business_name = user_update.business_name
    db_user.phone = user_update.phone
    db_user.subscription_status = user_update.subscription_status
    
    if user_update.password:  # Only update password if provided
        db_user.hashed_password = auth.get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_sysadmin_user)):
    """Delete user - System Admin only"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Setup endpoint for initial admin (if no users exist) - simplified for demo
@router.post("/setup/admin", response_model=schemas.UserResponse)
def create_initial_admin(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.User).count() > 0:
        raise HTTPException(status_code=400, detail="Users already exist")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role="admin")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
