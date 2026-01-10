import sqlite3

# Connect to the database
conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print(f"Tables in database: {tables}")

# Check existing columns in invoices table
cursor.execute("PRAGMA table_info(invoices)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Current columns in invoices: {columns}")

# Add missing columns if they don't exist
if 'table_number' not in columns:
    print("Adding table_number column...")
    cursor.execute("ALTER TABLE invoices ADD COLUMN table_number INTEGER")
    print("  - Added table_number")
    
if 'status' not in columns:
    print("Adding status column...")
    cursor.execute("ALTER TABLE invoices ADD COLUMN status VARCHAR(20) DEFAULT 'completed'")
    print("  - Added status")

conn.commit()

# Verify
cursor.execute("PRAGMA table_info(invoices)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Updated columns in invoices: {columns}")

conn.close()
print("Migration complete!")
