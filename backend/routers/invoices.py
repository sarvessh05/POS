from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Tuple
import uuid
from datetime import datetime
import models, schemas, database, auth

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"],
)

# --- Helper functions ---

def _generate_invoice_number(db: Session, admin_id: int) -> str:
    base = f"INV-{admin_id}-{int(datetime.utcnow().timestamp())}"
    candidate = f"{base}-{uuid.uuid4().hex[:6]}"
    # Best-effort uniqueness check
    existing = db.query(models.Invoice).filter(models.Invoice.invoice_number == candidate).first()
    if existing:
        candidate = f"{base}-{uuid.uuid4().hex[:8]}"
    return candidate


def _merge_items(items: List[schemas.InvoiceItemCreate]) -> Dict[Tuple[str, float], schemas.InvoiceItemCreate]:
    merged: Dict[Tuple[str, float], schemas.InvoiceItemCreate] = {}
    for it in items:
        # Prefer item_id if present; fallback to (name, unit_price) key
        key = (f"id:{it.item_id}" if it.item_id is not None else f"name:{it.item_name}", float(it.unit_price))
        if key in merged:
            merged[key].quantity += it.quantity
            # tax_amount will be recomputed on server
        else:
            merged[key] = schemas.InvoiceItemCreate(
                item_id=it.item_id,
                item_name=it.item_name,
                quantity=it.quantity,
                unit_price=it.unit_price,
                tax_amount=0.0,
            )
    return merged


def _build_items_and_totals(
    db: Session, admin_id: int, merged: Dict[Tuple[str, float], schemas.InvoiceItemCreate], return_subtotal: bool = False
):
    subtotal = 0.0
    db_items: List[models.InvoiceItem] = []
    for _, it in merged.items():
        # validate item ownership if item_id is provided
        tax_rate = 0.0
        if it.item_id:
            db_item = db.query(models.Item).filter(models.Item.id == it.item_id, models.Item.admin_id == admin_id).first()
            if not db_item:
                raise HTTPException(status_code=404, detail=f"Item {it.item_id} not found or access denied")
            tax_rate = db_item.tax_rate or 0.0
            it.item_name = db_item.name  # snapshot latest name
            it.unit_price = db_item.price  # ensure price integrity if needed
        line_base = it.unit_price * it.quantity
        subtotal += line_base
        inv_item = models.InvoiceItem(
            item_id=it.item_id,
            item_name=it.item_name,
            quantity=it.quantity,
            unit_price=it.unit_price,
            tax_amount=line_base * tax_rate,
            total_price=line_base + (line_base * tax_rate),
            admin_id=admin_id,
        )
        db_items.append(inv_item)
    if return_subtotal:
        return subtotal, db_items
    total = sum([i.total_price for i in db_items])
    return total, db_items


def _deduct_stock_or_raise(db: Session, admin_id: int, items: List[models.InvoiceItem]):
    # Check and deduct stock for each item if limit_stock is True
    for it in items:
        if not it.item_id:
            continue
        db_item = db.query(models.Item).filter(models.Item.id == it.item_id, models.Item.admin_id == admin_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail=f"Item {it.item_id} not found or access denied")
        if db_item.limit_stock:
            if db_item.stock_quantity < it.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {db_item.name}")
            db_item.stock_quantity -= it.quantity

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
    """Create invoice with item merge, server-side tax/discount, and safe stock handling.
    Pending orders do not change stock. Completed orders deduct stock immediately."""
    if current_user.role == 'sysadmin':
        raise HTTPException(
            status_code=403,
            detail="SysAdmin cannot create invoices. Please login as an admin user to use RECO POS."
        )

    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin users can create invoices")

    try:
        # If creating a pending order for a table, ensure uniqueness per table per admin
        if invoice.status == "pending" and invoice.table_number is not None:
            existing = db.query(models.Invoice).filter(
                models.Invoice.admin_id == current_user.id,
                models.Invoice.status == "pending",
                models.Invoice.table_number == invoice.table_number,
            ).first()
            if existing:
                # Replace items on existing pending order
                db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == existing.id).delete()
                merged_items = _merge_items(invoice.items)
                total_amount, db_items = _build_items_and_totals(db, current_user.id, merged_items)
                for it in db_items:
                    it.invoice_id = existing.id
                    db.add(it)
                existing.total_amount = total_amount
                existing.customer_name = invoice.customer_name
                existing.customer_phone = invoice.customer_phone
                existing.payment_mode = invoice.payment_mode
                db.commit()
                db.refresh(existing)
                return existing

        # Generate safer invoice number with admin context and randomness
        inv_number = _generate_invoice_number(db, current_user.id)

        # Merge duplicate items and compute totals
        merged_items = _merge_items(invoice.items)
        subtotal, db_items = _build_items_and_totals(db, current_user.id, merged_items, return_subtotal=True)

        # Apply discount (amount overrides percent)
        discount_amount = 0.0
        if invoice.discount_amount and invoice.discount_amount > 0:
            discount_amount = min(invoice.discount_amount, subtotal)
        elif invoice.discount_percent and invoice.discount_percent > 0:
            discount_amount = max(0.0, min(100.0, invoice.discount_percent)) * subtotal / 100.0

        # Recompute totals with discount
        total_amount = 0.0
        for it in db_items:
            # Reduce proportionally based on item contribution to subtotal, then recompute tax based on net price
            proportion = ((it.unit_price * it.quantity) / subtotal) if subtotal > 0 else 0
            discount_share = discount_amount * proportion
            taxable_base = max(0.0, (it.unit_price * it.quantity) - discount_share)
            # Recompute tax using item tax rate if item_id exists
            tax_rate = 0.0
            if it.item_id:
                db_item = db.query(models.Item).filter(models.Item.id == it.item_id, models.Item.admin_id == current_user.id).first()
                tax_rate = db_item.tax_rate if db_item else 0.0
            it.tax_amount = taxable_base * tax_rate
            it.total_price = taxable_base + it.tax_amount
            total_amount += it.total_price

        # Create invoice with admin_id
        db_invoice = models.Invoice(
            invoice_number=inv_number,
            customer_name=(invoice.customer_name or None),
            customer_phone=(invoice.customer_phone or None),
            table_number=invoice.table_number,
            status=invoice.status,
            total_amount=total_amount,
            payment_mode=invoice.payment_mode,
            items=db_items,
            admin_id=current_user.id,
        )

        db.add(db_invoice)

        # Deduct stock only if directly creating a completed invoice
        if db_invoice.status == "completed":
            _deduct_stock_or_raise(db, current_user.id, db_items)

        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except Exception as e:
        db.rollback()
        raise

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
    """Update a pending order (replace items); no stock changes here."""
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.admin_id == current_user.id
    ).first()

    if not db_invoice:
        raise HTTPException(status_code=404, detail="Order not found")

    if db_invoice.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot update completed order")

    try:
        # Delete existing items
        db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == invoice_id).delete()

        # Merge and recompute totals with discount
        merged_items = _merge_items(invoice.items)
        subtotal, db_items = _build_items_and_totals(db, current_user.id, merged_items, return_subtotal=True)

        discount_amount = 0.0
        if invoice.discount_amount and invoice.discount_amount > 0:
            discount_amount = min(invoice.discount_amount, subtotal)
        elif invoice.discount_percent and invoice.discount_percent > 0:
            discount_amount = max(0.0, min(100.0, invoice.discount_percent)) * subtotal / 100.0

        total_amount = 0.0
        for it in db_items:
            proportion = ((it.unit_price * it.quantity) / subtotal) if subtotal > 0 else 0
            discount_share = discount_amount * proportion
            taxable_base = max(0.0, (it.unit_price * it.quantity) - discount_share)
            tax_rate = 0.0
            if it.item_id:
                db_item = db.query(models.Item).filter(models.Item.id == it.item_id, models.Item.admin_id == current_user.id).first()
                tax_rate = db_item.tax_rate if db_item else 0.0
            it.tax_amount = taxable_base * tax_rate
            it.total_price = taxable_base + it.tax_amount
            it.invoice_id = invoice_id
            db.add(it)
            total_amount += it.total_price

        # Update invoice
        db_invoice.total_amount = total_amount
        db_invoice.table_number = invoice.table_number
        db_invoice.customer_name = invoice.customer_name
        db_invoice.customer_phone = invoice.customer_phone
        db_invoice.payment_mode = invoice.payment_mode

        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except Exception:
        db.rollback()
        raise

@router.put("/{invoice_id}/complete", response_model=schemas.InvoiceResponse)
def complete_order(
    invoice_id: int,
    payment_mode: str = "Cash",
    customer_name: str = None,
    customer_phone: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Complete a pending order, recompute totals, and deduct stock atomically."""
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.admin_id == current_user.id
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Order not found")

    if invoice.status != "pending":
        raise HTTPException(status_code=400, detail="Order already completed")

    try:
        # Recompute totals and tax from items currently on invoice
        subtotal = sum([(it.unit_price * it.quantity) for it in invoice.items])
        total_amount = 0.0
        for it in invoice.items:
            # tax based on item tax_rate
            tax_rate = 0.0
            if it.item_id:
                db_item = db.query(models.Item).filter(models.Item.id == it.item_id, models.Item.admin_id == current_user.id).first()
                tax_rate = db_item.tax_rate if db_item else 0.0
            # No additional discount here; discount should have been applied in update/create
            taxable_base = it.unit_price * it.quantity
            it.tax_amount = taxable_base * tax_rate
            it.total_price = taxable_base + it.tax_amount
        total_amount = sum([it.total_price for it in invoice.items])

        # Deduct stock for all items now
        _deduct_stock_or_raise(db, current_user.id, invoice.items)

        invoice.status = "completed"
        invoice.payment_mode = payment_mode
        if customer_name:
            invoice.customer_name = customer_name
        if customer_phone:
            invoice.customer_phone = customer_phone
        invoice.total_amount = total_amount

        db.commit()
        db.refresh(invoice)
        return invoice
    except Exception:
        db.rollback()
        raise
