-- Phase 0: Database & Backend Foundations — Schema Overhaul

-- 1. Create Enums for new statuses if needed
DO $$ BEGIN
    CREATE TYPE kot_status AS ENUM ('pending', 'printed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('upi', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create 'captains' table
CREATE TABLE IF NOT EXISTS captains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pin VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create 'tables' table
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER UNIQUE NOT NULL,
    qr_token UUID UNIQUE DEFAULT gen_random_uuid(),
    captain_id UUID REFERENCES captains(id) ON DELETE SET NULL,
    section TEXT,
    seat_count INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create 'tax_config' table
CREATE TABLE IF NOT EXISTS tax_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gst_rate DECIMAL(5, 2) DEFAULT 5.00,
    service_charge_rate DECIMAL(5, 2) DEFAULT 0.00,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create 'bills' table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL, -- Will add foreign key after orders table update
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    tip DECIMAL(10, 2) DEFAULT 0.00,
    split_count INTEGER DEFAULT 1,
    payment_method payment_method,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create 'kot' table
CREATE TABLE IF NOT EXISTS kot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL, -- Will add foreign key after orders table update
    status kot_status DEFAULT 'pending',
    printed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Update 'menu_items' table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_exhausted BOOLEAN DEFAULT false;

-- 8. Update 'orders' table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES captains(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kot_generated_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES bills(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id) ON DELETE SET NULL;

-- Now add foreign keys for bills and kot that reference orders
ALTER TABLE bills ADD CONSTRAINT fk_bills_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE kot ADD CONSTRAINT fk_kot_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- 9. Realtime Setup
-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE kot;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- 10. RLS Policies Overhaul

-- Enable RLS on new tables
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE kot ENABLE ROW LEVEL SECURITY;

-- Captain Policies: Can view tables assigned to them
CREATE POLICY "Captains can view assigned tables" ON tables
FOR SELECT USING (
    captain_id IN (SELECT id FROM captains WHERE id = auth.uid()) -- This assumes we link auth.uid to captain_id later or use a custom claim
);

-- Admin Policies: Full access to all new tables
-- (Initial setup, assuming 'admin' role in profiles or auth.users metadata)
CREATE POLICY "Admins have full access on captains" ON captains FOR ALL USING (true);
CREATE POLICY "Admins have full access on tables" ON tables FOR ALL USING (true);
CREATE POLICY "Admins have full access on tax_config" ON tax_config FOR ALL USING (true);
CREATE POLICY "Admins have full access on bills" ON bills FOR ALL USING (true);
CREATE POLICY "Admins have full access on kot" ON kot FOR ALL USING (true);

-- 11. Remove Clerk Dependency (Cleanup from profiles)
-- Instead of deleting, let's just make clerk_id optional for now if it exists
ALTER TABLE profiles ALTER COLUMN clerk_id DROP NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Cleanup updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_captains_updated_at BEFORE UPDATE ON captains FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
