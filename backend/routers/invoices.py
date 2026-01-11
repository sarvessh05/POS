from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
    """Create invoice - auto-assign admin_id"""
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
    
    # Generate Invoice Number
    inv_number = f"INV-{int(datetime.utcnow().timestamp())}"
    
    total_amount = 0.0
    db_invoice_items = []
    
    for item in invoice.items:
        # Check stock - only for items belonging to this admin
        if item.item_id:
            db_item = db.query(models.Item).filter(
                models.Item.id == item.item_id,
                models.Item.admin_id == current_user.id  # Security: only admin's items
            ).first()
            
            if not db_item:
                raise HTTPException(status_code=404, detail=f"Item {item.item_id} not found or access denied")
            
            if db_item.limit_stock:
                if db_item.stock_quantity < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Not enough stock for {db_item.name}")
                db_item.stock_quantity -= item.quantity
        
        # Calculate row total
        row_total = (item.unit_price * item.quantity) + item.tax_amount
        total_amount += row_total
        
        # Create invoice item with admin_id
        db_invoice_item = models.InvoiceItem(
            item_id=item.item_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_amount=item.tax_amount,
            total_price=row_total,
            admin_id=current_user.id  # Multi-tenant isolation
        )
        db_invoice_items.append(db_invoice_item)
    
    # Create invoice with admin_id
    db_invoice = models.Invoice(
        invoice_number=inv_number,
        customer_name=invoice.customer_name,
        customer_phone=invoice.customer_phone,
        table_number=invoice.table_number,
        status=invoice.status,
        total_amount=total_amount,
        payment_mode=invoice.payment_mode,
        items=db_invoice_items,
        admin_id=current_user.id  # Multi-tenant isolation
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/pending", response_model=List[schemas.InvoiceResponse])
def get_pending_orders(
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all pending orders (table orders not yet billed)"""
    if current_user.role == 'sysadmin':
        raise HTTPException(status_code=403, detail="SysAdmin cannot access orders")
    
    pending_orders = db.query(models.Invoice).filter(
        models.Invoice.admin_id == current_user.id,
        models.Invoice.status == "pending"
    ).order_by(models.Invoice.table_number).all()
    
    return pending_orders

@router.put("/{invoice_id}", response_model=schemas.InvoiceResponse)
def update_order(
    invoice_id: int,
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a pending order (replace items)"""
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.admin_id == current_user.id
    ).first()
    
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_invoice.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot update completed order")
    
    # Delete existing items
    db.query(models.InvoiceItem).filter(
        models.InvoiceItem.invoice_id == invoice_id
    ).delete()
    
    # Recalculate total and create new items
    total_amount = 0.0
    for item in invoice.items:
        row_total = (item.unit_price * item.quantity) + item.tax_amount
        total_amount += row_total
        
        db_invoice_item = models.InvoiceItem(
            invoice_id=invoice_id,
            item_id=item.item_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_amount=item.tax_amount,
            total_price=row_total,
            admin_id=current_user.id
        )
        db.add(db_invoice_item)
    
    # Update invoice
    db_invoice.total_amount = total_amount
    db_invoice.table_number = invoice.table_number
    db_invoice.customer_name = invoice.customer_name
    db_invoice.payment_mode = invoice.payment_mode
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.put("/{invoice_id}/complete", response_model=schemas.InvoiceResponse)
def complete_order(
    invoice_id: int,
    payment_mode: str = "Cash",
    customer_name: str = None,
    customer_phone: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Complete a pending order and generate bill"""
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.admin_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if invoice.status != "pending":
        raise HTTPException(status_code=400, detail="Order already completed")
    
    invoice.status = "completed"
    invoice.payment_mode = payment_mode
    if customer_name:
        invoice.customer_name = customer_name
    if customer_phone:
        invoice.customer_phone = customer_phone
    
    db.commit()
    db.refresh(invoice)
    return invoice
