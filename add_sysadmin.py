"""
Quick script to add sysadmin user to existing database
Run this with: python add_sysadmin.py
"""
import sys
sys.path.insert(0, '.')

from backend.database import SessionLocal
from backend import models, auth

def add_sysadmin():
    db = SessionLocal()
    
    # Check if sysadmin already exists
    existing = db.query(models.User).filter(models.User.username == 'sysadmin').first()
    
    if existing:
        print("✓ Sysadmin user already exists!")
        print(f"  Username: {existing.username}")
        print(f"  Role: {existing.role}")
        db.close()
        return
    
    # Create sysadmin user
    print("Creating sysadmin user...")
    sysadmin = models.User(
        username='sysadmin',
        hashed_password=auth.get_password_hash('sysadmin123'),
        role='sysadmin',
        is_active=True
    )
    
    db.add(sysadmin)
    db.commit()
    db.refresh(sysadmin)
    
    print("\n✅ Sysadmin user created successfully!")
    print("\n📋 Login Credentials:")
    print("   Username: sysadmin")
    print("   Password: sysadmin123")
    print("   Role: sysadmin")
    print("\n🔐 This user has full system administrator access.")
    
    db.close()

if __name__ == '__main__':
    add_sysadmin()
