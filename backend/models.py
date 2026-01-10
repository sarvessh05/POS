from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="admin") # sysadmin, admin
    is_active = Column(Boolean, default=True)
    
    # SaaS / Business Details
    business_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    subscription_status = Column(String, default="active") # active, inactive, expired
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Multi-tenant isolation
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    tax_rate = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
    limit_stock = Column(Boolean, default=True) # If false, unlimited stock

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Multi-tenant isolation
    invoice_number = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True) # For WhatsApp
    table_number = Column(Integer, nullable=True)  # Table number for restaurant orders
    status = Column(String, default="completed")  # pending, completed
    total_amount = Column(Float)
    payment_mode = Column(String, default="Cash") # Cash, UPI, Card

    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True) # Keep ID even if item deleted? Or store name snapshot.
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Multi-tenant isolation
    item_name = Column(String) # Snapshot of name
    quantity = Column(Integer)
    unit_price = Column(Float) # Snapshot of price
    tax_amount = Column(Float)
    total_price = Column(Float) # (unit_price * quantity) + tax

    invoice = relationship("Invoice", back_populates="items")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    hotel_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    total_tables = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
