#!/usr/bin/env python3
"""
Database migration to fix duplicate items issue
Adds unique constraint to prevent duplicate items in same invoice
"""

import sqlite3
from datetime import datetime

def run_migration():
    """Apply database changes to prevent duplicate items"""
    
    print("🔧 Starting duplicate items fix migration...")
    
    try:
        # Connect to database
        conn = sqlite3.connect('sql_app.db')
        cursor = conn.cursor()
        
        print("📊 Analyzing existing data...")
        
        # Check for existing duplicates
        cursor.execute("""
            SELECT invoice_id, item_id, COUNT(*) as count
            FROM invoice_items 
            WHERE item_id IS NOT NULL
            GROUP BY invoice_id, item_id 
            HAVING COUNT(*) > 1
        """)
        
        duplicates = cursor.fetchall()
        
        if duplicates:
            print(f"⚠️  Found {len(duplicates)} duplicate item entries:")
            for invoice_id, item_id, count in duplicates:
                print(f"   Invoice {invoice_id}, Item {item_id}: {count} entries")
            
            print("🧹 Cleaning up duplicates...")
            
            # For each duplicate, keep only the first entry and sum quantities
            for invoice_id, item_id, count in duplicates:
                # Get all duplicate entries
                cursor.execute("""
                    SELECT id, quantity, total_price 
                    FROM invoice_items 
                    WHERE invoice_id = ? AND item_id = ?
                    ORDER BY id
                """, (invoice_id, item_id))
                
                entries = cursor.fetchall()
                
                if len(entries) > 1:
                    # Keep first entry, sum quantities and totals
                    first_id = entries[0][0]
                    total_quantity = sum(entry[1] for entry in entries)
                    total_price = sum(entry[2] for entry in entries)
                    
                    # Update first entry with combined values
                    cursor.execute("""
                        UPDATE invoice_items 
                        SET quantity = ?, total_price = ?
                        WHERE id = ?
                    """, (total_quantity, total_price, first_id))
                    
                    # Delete other entries
                    other_ids = [entry[0] for entry in entries[1:]]
                    cursor.executemany("""
                        DELETE FROM invoice_items WHERE id = ?
                    """, [(id,) for id in other_ids])
                    
                    print(f"   ✅ Merged {len(entries)} entries for Invoice {invoice_id}, Item {item_id}")
        else:
            print("✅ No duplicate entries found")
        
        # Update invoice totals after cleanup
        print("💰 Recalculating invoice totals...")
        cursor.execute("""
            UPDATE invoices 
            SET total_amount = (
                SELECT SUM(total_price) 
                FROM invoice_items 
                WHERE invoice_items.invoice_id = invoices.id
            )
        """)
        
        affected_invoices = cursor.rowcount
        print(f"   ✅ Updated {affected_invoices} invoice totals")
        
        # Create index to prevent future duplicates (SQLite doesn't support adding constraints to existing tables)
        print("🔒 Creating unique index to prevent future duplicates...")
        
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX idx_unique_invoice_item 
                ON invoice_items(invoice_id, item_id) 
                WHERE item_id IS NOT NULL
            """)
            print("   ✅ Unique index created successfully")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e):
                print("   ℹ️  Unique index already exists")
            else:
                raise
        
        # Commit all changes
        conn.commit()
        print("💾 All changes committed successfully")
        
        # Verify the fix
        print("🔍 Verifying fix...")
        cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT invoice_id, item_id, COUNT(*) as count
                FROM invoice_items 
                WHERE item_id IS NOT NULL
                GROUP BY invoice_id, item_id 
                HAVING COUNT(*) > 1
            )
        """)
        
        remaining_duplicates = cursor.fetchone()[0]
        
        if remaining_duplicates == 0:
            print("✅ Migration completed successfully - no duplicates remain")
        else:
            print(f"⚠️  Warning: {remaining_duplicates} duplicates still exist")
        
        conn.close()
        
        print(f"🎉 Migration completed at {datetime.now()}")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = run_migration()
    exit(0 if success else 1)