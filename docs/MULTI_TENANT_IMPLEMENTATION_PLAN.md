# 🏢 Multi-Tenant POS System - Implementation Plan

## 📋 Current vs Target Architecture

### **CURRENT (Single-Tenant):**
```
SysAdmin → Manages users
Admin → Uses POS (shares same database)
```

### **TARGET (Multi-Tenant):**
```
SysAdmin → Manages multiple independent POS businesses
Admin 1 → Own POS (isolated data)
Admin 2 → Own POS (isolated data)
Admin 3 → Own POS (isolated data)
```

---

## 🎯 Key Changes Required

### **1. Database Schema Changes**

#### **Add admin_id to all tables:**
```sql
-- Items table
ALTER TABLE items ADD COLUMN admin_id INTEGER REFERENCES users(id);

-- Invoices table
ALTER TABLE invoices ADD COLUMN admin_id INTEGER REFERENCES users(id);

-- Customers table (if exists)
ALTER TABLE customers ADD COLUMN admin_id INTEGER REFERENCES users(id);
```

#### **Update User model:**
```python
class User(Base):
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String)  # 'sysadmin' or 'admin'
    
    # NEW FIELDS FOR MULTI-TENANT
    business_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    subscription_status = Column(String, default='active')  # active, inactive, trial
    subscription_plan = Column(String, default='basic')  # basic, pro, enterprise
    features_enabled = Column(JSON, default={})  # Feature flags
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
```

---

### **2. Backend API Changes**

#### **Data Isolation:**
```python
# Before: Get all items
@router.get("/items/")
def get_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

# After: Get only current admin's items
@router.get("/items/")
def get_items(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == 'sysadmin':
        # SysAdmin can see all (read-only)
        return db.query(models.Item).all()
    else:
        # Admin sees only their items
        return db.query(models.Item).filter(
            models.Item.admin_id == current_user.id
        ).all()
```

#### **Auto-assign admin_id:**
```python
# When admin creates item
@router.post("/items/")
def create_item(
    item: schemas.ItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_item = models.Item(
        **item.dict(),
        admin_id=current_user.id  # Auto-assign
    )
    db.add(new_item)
    db.commit()
    return new_item
```

---

### **3. SysAdmin Dashboard Features**

#### **Admin Management:**
```javascript
// Create new admin (POS business)
{
    username: "cafe_downtown",
    password: "secure123",
    role: "admin",
    business_name: "Downtown Cafe",
    contact_email: "owner@downtowncafe.com",
    contact_phone: "+1234567890",
    subscription_status: "active",
    subscription_plan: "pro",
    features_enabled: {
        inventory: true,
        whatsapp: true,
        reports: true,
        gst: false
    }
}
```

#### **System Analytics:**
```javascript
// SysAdmin sees:
{
    totalAdmins: 25,
    activeAdmins: 23,
    inactiveAdmins: 2,
    totalRevenue: 125000,  // Sum of all admins
    totalInvoices: 5420,   // All invoices
    revenueByAdmin: [
        { admin: "Downtown Cafe", revenue: 12500 },
        { admin: "Pizza Palace", revenue: 8900 },
        // ...
    ],
    invoicesByAdmin: [
        { admin: "Downtown Cafe", count: 450 },
        { admin: "Pizza Palace", count: 320 },
        // ...
    ]
}
```

---

### **4. Admin Dashboard (Isolated)**

#### **Data Filtering:**
```javascript
// Admin only sees their own data
const items = await api.get('/items/');  
// Returns only items where admin_id = current_user.id

const invoices = await api.get('/invoices/');
// Returns only invoices where admin_id = current_user.id
```

#### **No Cross-Admin Access:**
```javascript
// Admin 1 cannot see Admin 2's data
// Even if they try to access by ID
GET /items/123  // Returns 404 if item.admin_id != current_user.id
```

---

## 🔧 Implementation Steps

### **Phase 1: Database Migration**

1. **Add admin_id columns:**
```python
# migration script
def upgrade():
    op.add_column('items', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.add_column('invoices', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.add_column('invoice_items', sa.Column('admin_id', sa.Integer(), nullable=True))
    
    # Add foreign keys
    op.create_foreign_key(None, 'items', 'users', ['admin_id'], ['id'])
    op.create_foreign_key(None, 'invoices', 'users', ['admin_id'], ['id'])
```

2. **Update User model:**
```python
# Add new fields to User model
business_name = Column(String)
contact_email = Column(String)
contact_phone = Column(String)
subscription_status = Column(String, default='active')
features_enabled = Column(JSON, default={})
created_at = Column(DateTime, default=datetime.utcnow)
last_login = Column(DateTime)
```

---

### **Phase 2: Backend Updates**

1. **Update all API endpoints:**
   - Add admin_id filtering
   - Auto-assign admin_id on create
   - Prevent cross-admin access

2. **Create SysAdmin analytics endpoints:**
```python
@router.get("/sysadmin/analytics")
def get_system_analytics(
    current_user: models.User = Depends(get_sysadmin_user),
    db: Session = Depends(get_db)
):
    admins = db.query(models.User).filter(
        models.User.role == 'admin'
    ).all()
    
    analytics = []
    for admin in admins:
        total_revenue = db.query(
            func.sum(models.Invoice.total_amount)
        ).filter(
            models.Invoice.admin_id == admin.id
        ).scalar() or 0
        
        total_invoices = db.query(models.Invoice).filter(
            models.Invoice.admin_id == admin.id
        ).count()
        
        analytics.append({
            'admin_id': admin.id,
            'business_name': admin.business_name,
            'username': admin.username,
            'total_revenue': total_revenue,
            'total_invoices': total_invoices,
            'subscription_status': admin.subscription_status,
            'last_login': admin.last_login
        })
    
    return analytics
```

---

### **Phase 3: Frontend Updates**

1. **Update AdminManagement.jsx:**
   - Add business info fields
   - Add subscription status
   - Add feature toggles

2. **Update SystemDashboard.jsx:**
   - Show per-admin analytics
   - Revenue breakdown by admin
   - Invoice counts per admin
   - Active/inactive status

3. **Update all data fetching:**
   - Items, Invoices, etc. auto-filtered by backend
   - No frontend changes needed (backend handles isolation)

---

### **Phase 4: Feature Flags**

```python
# Check if admin has feature enabled
def check_feature_access(user: User, feature: str):
    if user.role == 'sysadmin':
        return True  # SysAdmin has all features
    
    features = user.features_enabled or {}
    return features.get(feature, False)

# Use in endpoints
@router.post("/invoices/whatsapp")
def send_whatsapp(
    current_user: User = Depends(get_current_user)
):
    if not check_feature_access(current_user, 'whatsapp'):
        raise HTTPException(403, "WhatsApp feature not enabled")
    
    # Send WhatsApp...
```

---

## 📊 New Database Schema

```
users
├─ id (PK)
├─ username (unique)
├─ hashed_password
├─ role ('sysadmin' | 'admin')
├─ business_name
├─ contact_email
├─ contact_phone
├─ subscription_status
├─ subscription_plan
├─ features_enabled (JSON)
├─ created_at
├─ last_login
└─ is_active

items
├─ id (PK)
├─ admin_id (FK → users.id)  ← NEW
├─ name
├─ category
├─ price
└─ stock_quantity

invoices
├─ id (PK)
├─ admin_id (FK → users.id)  ← NEW
├─ invoice_number
├─ customer_name
├─ total_amount
└─ created_at

invoice_items
├─ id (PK)
├─ invoice_id (FK)
├─ item_id (FK)
├─ admin_id (FK)  ← NEW (for safety)
├─ quantity
└─ unit_price
```

---

## 🎯 User Flows

### **SysAdmin Flow:**
```
1. Login → System Dashboard
2. View all admins and their stats
3. Click "Create New Admin"
4. Enter business details:
   - Business name: "Downtown Cafe"
   - Username: cafe_downtown
   - Password: secure123
   - Contact: email, phone
   - Plan: Basic/Pro/Enterprise
   - Features: [✓] Inventory [✓] WhatsApp [✗] GST
5. Admin account created
6. Admin can now login and use POS
```

### **Admin Flow:**
```
1. Login → Dashboard (own data only)
2. See own sales, items, invoices
3. Cannot see other admins' data
4. Cannot access SysAdmin features
5. Features limited by subscription plan
```

---

## 🔒 Security & Isolation

### **Data Isolation Rules:**

1. **Read Operations:**
   - Admin sees only `WHERE admin_id = current_user.id`
   - SysAdmin sees all (read-only by default)

2. **Write Operations:**
   - Admin can only modify own data
   - Auto-assign `admin_id = current_user.id`
   - Prevent cross-admin updates

3. **Delete Operations:**
   - Admin can only delete own records
   - Check `admin_id` before delete

### **Example Security Check:**
```python
@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(404, "Item not found")
    
    # Security check
    if current_user.role != 'sysadmin' and item.admin_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
```

---

## 📋 Migration Checklist

### **Backend:**
- [ ] Update User model with new fields
- [ ] Add admin_id to Items table
- [ ] Add admin_id to Invoices table
- [ ] Add admin_id to InvoiceItems table
- [ ] Update all GET endpoints with filtering
- [ ] Update all POST endpoints with auto-assign
- [ ] Update all PUT/DELETE with security checks
- [ ] Create SysAdmin analytics endpoints
- [ ] Implement feature flag system

### **Frontend:**
- [ ] Update AdminManagement with business fields
- [ ] Update SystemDashboard with per-admin stats
- [ ] Add feature toggle UI
- [ ] Add subscription management UI
- [ ] Test data isolation
- [ ] Test cross-admin access prevention

### **Testing:**
- [ ] Create 2-3 test admin accounts
- [ ] Verify data isolation
- [ ] Test SysAdmin analytics
- [ ] Test feature flags
- [ ] Test security (try cross-admin access)

---

## ⚠️ Breaking Changes

**This is a MAJOR architectural change:**

1. **Existing data needs migration:**
   - Assign all existing items/invoices to first admin
   - Or create "default admin" account

2. **API responses change:**
   - Filtered by admin_id
   - May return fewer results

3. **Authentication flow:**
   - Each admin is independent
   - Cannot share data

---

## 🚀 Recommended Approach

### **Option 1: Fresh Start (Recommended)**
- Create new database
- Implement multi-tenant from scratch
- Migrate data if needed

### **Option 2: Gradual Migration**
- Add admin_id columns (nullable)
- Assign existing data to "admin" user
- Gradually enforce isolation
- Make admin_id required

---

## 📝 Next Steps

**Should I proceed with:**

1. **Database migration script** - Add admin_id columns
2. **Backend updates** - Data isolation logic
3. **Frontend updates** - Multi-tenant UI
4. **Complete implementation** - All phases

**Or would you like to:**
- Review the plan first
- Modify requirements
- Start with specific phase

---

**This will transform your POS into a true multi-tenant SaaS platform!** 🏢✨

Let me know how you'd like to proceed!
