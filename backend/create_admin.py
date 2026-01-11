from database import SessionLocal
from models import User
import bcrypt

db = SessionLocal()

# Check existing users
users = db.query(User).all()
print(f"Found {len(users)} users:")
for u in users:
    print(f"  - {u.username} ({u.role})")

# Delete all existing users
print("\nDeleting all users...")
db.query(User).delete()
db.commit()

# Create fresh admin user
print("\nCreating new admin user...")
hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
admin = User(
    username='admin',
    hashed_password=hashed,
    role='admin',
    business_name='Downtown Cafe',
    phone='123-456-7890',
    subscription_status='active'
)
db.add(admin)
db.commit()

print("✓ Admin user created successfully!")
print("  Username: admin")
print("  Password: admin123")

db.close()
