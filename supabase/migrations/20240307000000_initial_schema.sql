-- Create Enums
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'waiter');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE order_type AS ENUM ('dine-in', 'takeaway');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- Profiles table (linked to Clerk user_id)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT, -- Emoji or icon name
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu Items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Bookings
CREATE TABLE table_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guests INTEGER NOT NULL,
  table_number INTEGER,
  status booking_status DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  status order_status DEFAULT 'pending',
  order_type order_type DEFAULT 'dine-in',
  table_number INTEGER,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public read for menu)
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public menu items are viewable by everyone" ON menu_items FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Admin policies (assuming role check)
-- Note: Simplified for now, will refine with role-based auth
CREATE POLICY "Admins can do everything on menu_items" ON menu_items ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.clerk_id = auth.uid()::text AND profiles.role = 'admin')
);
