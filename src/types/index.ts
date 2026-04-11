export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating?: number;
  addons?: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedAddons?: Addon[];
  specialInstructions?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  type: 'dine-in' | 'takeaway';
  tableNumber?: number;
  customerName: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface TableBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  timeSlot: string;
  guests: number;
  tableNumber: number;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  role: 'customer' | 'admin' | 'waiter';
}
