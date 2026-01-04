"""
Reset database with multi-tenant schema
This will DELETE all existing data and create fresh tables with admin_id columns
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from backend import models

def reset_database():
    print("⚠️  WARNING: This will DELETE all existing data!")
    print("Creating fresh database with multi-tenant schema...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("✓ Dropped all existing tables")
    
    # Create all tables with new schema
    Base.metadata.create_all(bind=engine)
    print("✓ Created new tables with admin_id columns")
    
    print("\n✅ Database reset complete!")
    print("\n📋 Next steps:")
    print("   1. Run: python -m backend.init_db")
    print("   2. This will create sysadmin and admin accounts")
    print("   3. Login and test data isolation")

if __name__ == "__main__":
    reset_database()
