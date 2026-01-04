# ⚠️ CURRENT STATUS: NO DATA ISOLATION

## 🔴 CRITICAL: Admins Currently Share Data!

**Current State:** All admin users are accessing the **SAME** database tables without any isolation.

---

## 📊 Current Database Schema (NO ISOLATION)

```python
# Items table - NO admin_id
class Item(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String)
    category = Column(String)
    price = Column(Float)
    # ❌ NO admin_id column!

# Invoices table - NO admin_id
class Invoice(Base):
    id = Column(Integer, primary_key=True)
    invoice_number = Column(String)
    total_amount = Column(Float)
    # ❌ NO admin_id column!
```

---

## ⚠️ What This Means

### **Problem:**
```
Admin 1 creates item "Coffee" → Saved to items table
Admin 2 logs in → Sees "Coffee" (Admin 1's item!)
Admin 2 creates item "Pizza" → Saved to items table
Admin 1 logs in → Sees "Pizza" (Admin 2's item!)
```

**ALL ADMINS SEE ALL DATA!**

---

## ✅ What Needs to Be Done

### **Step 1: Add admin_id to Database**

```python
# Updated models.py
class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id"))  # ← ADD THIS
    name = Column(String)
    category = Column(String)
    price = Column(Float)
    tax_rate = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
    limit_stock = Column(Boolean, default=True)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id"))  # ← ADD THIS
    invoice_number = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    total_amount = Column(Float)
    payment_mode = Column(String, default="Cash")
    
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"))  # ← ADD THIS
    item_name = Column(String)
    quantity = Column(Integer)
    unit_price = Column(Float)
    tax_amount = Column(Float)
    total_price = Column(Float)
    
    invoice = relationship("Invoice", back_populates="items")
```

---

### **Step 2: Update API Endpoints**

#### **Items Endpoints:**

```python
# GET /items/ - Filter by admin_id
@router.get("/items/")
def get_items(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == 'sysadmin':
        # SysAdmin sees all items (read-only)
        return db.query(models.Item).all()
    else:
        # Admin sees only their items
        return db.query(models.Item).filter(
            models.Item.admin_id == current_user.id
        ).all()

# POST /items/ - Auto-assign admin_id
@router.post("/items/")
def create_item(
    item: schemas.ItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == 'sysadmin':
        raise HTTPException(403, "SysAdmin cannot create items")
    
    new_item = models.Item(
        **item.dict(),
        admin_id=current_user.id  # Auto-assign
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# PUT /items/{item_id} - Check ownership
@router.put("/items/{item_id}")
def update_item(
    item_id: int,
    item_update: schemas.ItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()
    
    if not db_item:
        raise HTTPException(404, "Item not found")
    
    # Security check
    if current_user.role != 'sysadmin' and db_item.admin_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    # Update item...
    db.commit()
    return db_item

# DELETE /items/{item_id} - Check ownership
@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()
    
    if not db_item:
        raise HTTPException(404, "Item not found")
    
    # Security check
    if current_user.role != 'sysadmin' and db_item.admin_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}
```

#### **Invoice Endpoints:**

```python
# GET /invoices/ - Filter by admin_id
@router.get("/invoices/")
def get_invoices(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == 'sysadmin':
        # SysAdmin sees all invoices
        return db.query(models.Invoice).all()
    else:
        # Admin sees only their invoices
        return db.query(models.Invoice).filter(
            models.Invoice.admin_id == current_user.id
        ).all()

# POST /invoices/ - Auto-assign admin_id
@router.post("/invoices/")
def create_invoice(
    invoice: schemas.InvoiceCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == 'sysadmin':
        raise HTTPException(403, "SysAdmin cannot create invoices")
    
    new_invoice = models.Invoice(
        **invoice.dict(exclude={'items'}),
        admin_id=current_user.id  # Auto-assign
    )
    
    # Add invoice items with admin_id
    for item in invoice.items:
        invoice_item = models.InvoiceItem(
            **item.dict(),
            admin_id=current_user.id  # Auto-assign
        )
        new_invoice.items.append(invoice_item)
    
    db.add(new_invoice)
    db.commit()
    return new_invoice
```

---

### **Step 3: Database Migration**

```python
# Create migration file: add_admin_id_columns.py

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add admin_id to items table
    op.add_column('items', 
        sa.Column('admin_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_items_admin_id', 
        'items', 'users', 
        ['admin_id'], ['id']
    )
    
    # Add admin_id to invoices table
    op.add_column('invoices', 
        sa.Column('admin_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_invoices_admin_id', 
        'invoices', 'users', 
        ['admin_id'], ['id']
    )
    
    # Add admin_id to invoice_items table
    op.add_column('invoice_items', 
        sa.Column('admin_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_invoice_items_admin_id', 
        'invoice_items', 'users', 
        ['admin_id'], ['id']
    )
    
    # Assign existing data to first admin user
    # (or create a default admin)
    op.execute("""
        UPDATE items 
        SET admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
        WHERE admin_id IS NULL
    """)
    
    op.execute("""
        UPDATE invoices 
        SET admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
        WHERE admin_id IS NULL
    """)
    
    op.execute("""
        UPDATE invoice_items 
        SET admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
        WHERE admin_id IS NULL
    """)
    
    # Make admin_id NOT NULL after data migration
    op.alter_column('items', 'admin_id', nullable=False)
    op.alter_column('invoices', 'admin_id', nullable=False)
    op.alter_column('invoice_items', 'admin_id', nullable=False)

def downgrade():
    op.drop_constraint('fk_items_admin_id', 'items')
    op.drop_column('items', 'admin_id')
    
    op.drop_constraint('fk_invoices_admin_id', 'invoices')
    op.drop_column('invoices', 'admin_id')
    
    op.drop_constraint('fk_invoice_items_admin_id', 'invoice_items')
    op.drop_column('invoice_items', 'admin_id')
```

---

## 🧪 Testing Data Isolation

### **Test Scenario:**

```python
# Create Admin 1
admin1 = create_user(username="admin1", role="admin")

# Admin 1 creates items
login_as(admin1)
create_item(name="Coffee", price=4.50)  # admin_id = admin1.id
create_item(name="Tea", price=3.50)     # admin_id = admin1.id

# Create Admin 2
admin2 = create_user(username="admin2", role="admin")

# Admin 2 creates items
login_as(admin2)
create_item(name="Pizza", price=12.00)  # admin_id = admin2.id
create_item(name="Burger", price=8.00)  # admin_id = admin2.id

# Verify isolation
login_as(admin1)
items = get_items()  # Should return: [Coffee, Tea]
# Should NOT see: [Pizza, Burger]

login_as(admin2)
items = get_items()  # Should return: [Pizza, Burger]
# Should NOT see: [Coffee, Tea]

# SysAdmin sees all
login_as(sysadmin)
items = get_items()  # Should return: [Coffee, Tea, Pizza, Burger]
```

---

## 📊 Expected Behavior After Implementation

### **Admin 1 Dashboard:**
```
Total Sales: $150.00  (only Admin 1's sales)
Total Items: 5        (only Admin 1's items)
Recent Orders: 
  - Order #1 (Admin 1's order)
  - Order #2 (Admin 1's order)
```

### **Admin 2 Dashboard:**
```
Total Sales: $200.00  (only Admin 2's sales)
Total Items: 8        (only Admin 2's items)
Recent Orders:
  - Order #3 (Admin 2's order)
  - Order #4 (Admin 2's order)
```

### **SysAdmin Dashboard:**
```
Total Admins: 2
Admin 1: $150.00 (5 items, 10 orders)
Admin 2: $200.00 (8 items, 15 orders)
Total System Revenue: $350.00
```

---

## ⚠️ CURRENT RISK

**Without data isolation:**
- ❌ Admin 1 can see Admin 2's items
- ❌ Admin 1 can edit Admin 2's items
- ❌ Admin 1 can delete Admin 2's items
- ❌ All admins see combined statistics
- ❌ Invoice numbers may conflict
- ❌ No true multi-tenancy

---

## 🚀 Implementation Required

**To achieve true data isolation, you need:**

1. ✅ Add `admin_id` columns to all tables
2. ✅ Update all API endpoints with filtering
3. ✅ Add security checks for ownership
4. ✅ Migrate existing data
5. ✅ Test isolation thoroughly

**Would you like me to implement this now?**

---

## 📋 Quick Implementation Checklist

- [ ] Update models.py (add admin_id columns)
- [ ] Create database migration script
- [ ] Run migration to add columns
- [ ] Update items router (GET, POST, PUT, DELETE)
- [ ] Update invoices router (GET, POST, PUT, DELETE)
- [ ] Update dashboard to filter by admin_id
- [ ] Test with 2 admin accounts
- [ ] Verify SysAdmin can see all
- [ ] Verify admins cannot see each other's data

---

**Status: ⚠️ NOT IMPLEMENTED - Data is currently shared!**

**Next Step: Implement multi-tenant data isolation?**
