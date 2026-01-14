from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    role: str = "admin" # Default changed to admin as cashier is removed
    business_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    subscription_status: str = "active"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    subscription_status: str = "active"
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    category: str
    price: float
    tax_rate: float = 0.0
    stock_quantity: int = 0
    limit_stock: bool = True

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    admin_id: int
    class Config:
        from_attributes = True

# --- Invoice Schemas ---
class InvoiceItemCreate(BaseModel):
    item_id: Optional[int] = None
    item_name: str
    quantity: int
    unit_price: float
    tax_amount: float  # Client may send this, but server will recompute for integrity

class InvoiceCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    table_number: Optional[int] = None
    status: str = "completed"  # pending or completed
    payment_mode: str = "Cash"
    discount_percent: Optional[float] = 0.0  # Applied on subtotal before tax
    discount_amount: Optional[float] = 0.0   # Overrides percent if provided (>0)
    items: List[InvoiceItemCreate]

class InvoiceItemResponse(InvoiceItemCreate):
    id: int
    total_price: float
    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id: int
    admin_id: int
    invoice_number: str
    created_at: datetime
    customer_name: Optional[str]
    customer_phone: Optional[str]
    table_number: Optional[int]
    status: str
    total_amount: float
    payment_mode: str
    items: List[InvoiceItemResponse]
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Settings Schemas ---
class SettingsBase(BaseModel):
    hotel_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None
    gst_number: Optional[str] = None
    total_tables: int = 10

class SettingsCreate(SettingsBase):
    pass

class SettingsUpdate(SettingsBase):
    pass

class SettingsResponse(SettingsBase):
    id: int
    admin_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
