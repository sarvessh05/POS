from database import SessionLocal
from models import User
import bcrypt

db = SessionLocal()

# Get admin user
admin = db.query(User).filter(User.username == "admin").first()

if admin:
    print(f"User found: {admin.username}")
    print(f"Role: {admin.role}")
    
    # Test password verification
    test_password = "admin123"
    stored_hash = admin.hashed_password
    
    print(f"\nTesting password verification...")
    print(f"Password to test: {test_password}")
    print(f"Stored hash (first 50 chars): {stored_hash[:50]}...")
    
    # Try to verify
    try:
        result = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"✓ Password verification result: {result}")
    except Exception as e:
        print(f"✗ Error during verification: {e}")
else:
    print("✗ Admin user not found!")

db.close()
