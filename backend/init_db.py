from backend.database import SessionLocal, engine
from backend import models, auth

def init_db():
    db = SessionLocal()
    
    # Create System Admin
    sysadmin = db.query(models.User).filter(models.User.username == "sysadmin").first()
    if not sysadmin:
        sysadmin = models.User(
            username="sysadmin",
            hashed_password=auth.get_password_hash("sysadmin123"),
            role="sysadmin",
            business_name="System Administrator",
            subscription_status="active"
        )
        db.add(sysadmin)
        print("✓ Created sysadmin user")
    
    # Create Default Admin (Business 1)
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        admin_user = models.User(
            username="admin",
            hashed_password=auth.get_password_hash("admin123"),
            role="admin",
            business_name="Downtown Cafe", # Sample Business Name
            phone="123-456-7890",
            subscription_status="active"
        )
        db.add(admin_user)
        print("✓ Created admin user (Downtown Cafe)")
        
    # Create Second Admin (Business 2)
    admin2_user = db.query(models.User).filter(models.User.username == "admin2").first()
    if not admin2_user:
        admin2_user = models.User(
            username="admin2",
            hashed_password=auth.get_password_hash("admin123"),
            role="admin",
            business_name="City Pizza", # Sample Business Name
            phone="987-654-3210",
            subscription_status="active"
        )
        db.add(admin2_user)
        print("✓ Created admin2 user (City Pizza)")

    db.commit()
    
    # Create some sample items for admin (Downtown Cafe)
    if db.query(models.Item).filter(models.Item.admin_id == admin_user.id).count() == 0:
        print("Creating sample items for admin...")
        items = [
            models.Item(name="Premium Coffee", category="Beverage", price=4.50, stock_quantity=100, admin_id=admin_user.id),
            models.Item(name="Croissant", category="Bakery", price=3.00, stock_quantity=50, admin_id=admin_user.id),
            models.Item(name="Green Tea", category="Beverage", price=3.50, stock_quantity=80, admin_id=admin_user.id),
        ]
        for i in items:
            db.add(i)
        print("✓ Sample items created for admin")
        
    # Create some sample items for admin2 (City Pizza)
    if db.query(models.Item).filter(models.Item.admin_id == admin2_user.id).count() == 0:
        print("Creating sample items for admin2...")
        items2 = [
            models.Item(name="Pepperoni Pizza", category="Pizza", price=12.00, stock_quantity=20, admin_id=admin2_user.id),
            models.Item(name="Cheese Pizza", category="Pizza", price=10.00, stock_quantity=20, admin_id=admin2_user.id),
            models.Item(name="Cola", category="Beverage", price=2.00, stock_quantity=100, admin_id=admin2_user.id),
        ]
        for i in items2:
            db.add(i)
        print("✓ Sample items created for admin2")
        
    db.commit()
    print("\n✅ Database initialized successfully!")
    print("\n📋 Default Accounts:")
    print("   1. System Admin: sysadmin / sysadmin123")
    print("   2. Downtown Cafe: admin / admin123")
    print("   3. City Pizza:   admin2 / admin123")
    print("\n🔒 Multi-tenant isolation is now active!")
    print("   Each admin has their own isolated data.")
    db.close()

if __name__ == "__main__":
    init_db()
