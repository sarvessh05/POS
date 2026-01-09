from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import uuid
from datetime import datetime
import models, schemas, database, auth

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"],
)

@router.get("/", response_model=List[schemas.InvoiceResponse])
def read_invoices(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get invoices - filtered by admin_id for multi-tenant isolation"""
    if current_user.role == 'sysadmin':
        # SysAdmin can see all invoices
        invoices = db.query(models.Invoice).order_by(
            models.Invoice.created_at.desc()
        ).offset(skip).limit(limit).all()
    else:
        # Admin sees only their own invoices
        invoices = db.query(models.Invoice).filter(
            models.Invoice.admin_id == current_user.id
        ).order_by(models.Invoice.created_at.desc()).offset(skip).limit(limit).all()
    return invoices

@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(
    invoice: schemas.InvoiceCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create invoice - auto-assign admin_id with proper transaction handling"""
    if current_user.role == 'sysadmin':
        raise HTTPException(
            status_code=403, 
            detail="SysAdmin cannot create invoices. Please login as an admin user to use RECO POS."
        )
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=403,
            detail="Only admin users can create invoices"
        )
    
    # Generate unique invoice number using UUID to prevent collisions
    unique_suffix = str(uuid.uuid4())[:8].upper()
    inv_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{unique_suffix}"
    
    # Start transaction with proper isolation
    try:
        # Begin explicit transaction
        db.begin()
        
        total_amount = 0.0
        db_invoice_items = []
        
        # Process each item with atomic stock operations and duplicate prevention
        item_map = {}  # Track items to prevent duplicates in same invoice
        
        for item in invoice.items:
            # Prevent duplicate items in same invoice by consolidating quantities
            item_key = item.item_id if item.item_id else item.item_name
            
            if item_key in item_map:
                # Consolidate with existing item
                existing_item = item_map[item_key]
                existing_item['quantity'] += item.quantity
                existing_item['tax_amount'] += item.tax_amount
                continue
            else:
                # Add new item to map
                item_map[item_key] = {
                    'item_id': item.item_id,
                    'item_name': item.item_name,
                    'quantity': item.quantity,
                    'unit_price': item.unit_price,
                    'tax_amount': item.tax_amount
                }
        
        # Process consolidated items
        for item_key, consolidated_item in item_map.items():
            if consolidated_item['item_id']:
                # Lock the item row for update to prevent race conditions
                db_item = db.query(models.Item).filter(
                    models.Item.id == consolidated_item['item_id'],
                    models.Item.admin_id == current_user.id  # Security: only admin's items
                ).with_for_update().first()
                
                if not db_item:
                    db.rollback()
                    raise HTTPException(status_code=404, detail=f"Item {consolidated_item['item_id']} not found or access denied")
                
                # Atomic stock check and deduction
                if db_item.limit_stock:
                    if db_item.stock_quantity < consolidated_item['quantity']:
                        db.rollback()
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Insufficient stock for {db_item.name}. Available: {db_item.stock_quantity}, Requested: {consolidated_item['quantity']}"
                        )
                    # Atomically deduct stock
                    db_item.stock_quantity -= consolidated_item['quantity']
            
            # Calculate row total
            row_total = (consolidated_item['unit_price'] * consolidated_item['quantity']) + consolidated_item['tax_amount']
            total_amount += row_total
            
            # Create invoice item with admin_id
            db_invoice_item = models.InvoiceItem(
                item_id=consolidated_item['item_id'],
                item_name=consolidated_item['item_name'],
                quantity=consolidated_item['quantity'],
                unit_price=consolidated_item['unit_price'],
                tax_amount=consolidated_item['tax_amount'],
                total_price=row_total,
                admin_id=current_user.id  # Multi-tenant isolation
            )
            db_invoice_items.append(db_invoice_item)
        
        # Create invoice with admin_id
        db_invoice = models.Invoice(
            invoice_number=inv_number,
            customer_name=invoice.customer_name,
            customer_phone=invoice.customer_phone,
            total_amount=total_amount,
            payment_mode=invoice.payment_mode,
            items=db_invoice_items,
            admin_id=current_user.id  # Multi-tenant isolation
        )
        
        db.add(db_invoice)
        
        # Commit the entire transaction atomically
        db.commit()
        db.refresh(db_invoice)
        return db_invoice
        
    except IntegrityError as e:
        db.rollback()
        if "invoice_number" in str(e):
            raise HTTPException(status_code=409, detail="Invoice number collision. Please retry.")
        raise HTTPException(status_code=400, detail="Database integrity error")
    except Exception as e:
        db.rollback()
        raise
