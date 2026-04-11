export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          clerk_id: string
          full_name: string | null
          email: string
          phone: string | null
          loyalty_points: number
          role: 'customer' | 'admin' | 'waiter'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          full_name?: string | null
          email: string
          phone?: string | null
          loyalty_points?: number
          role?: 'customer' | 'admin' | 'waiter'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          full_name?: string | null
          email?: string
          phone?: string | null
          loyalty_points?: number
          role?: 'customer' | 'admin' | 'waiter'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          display_order?: number
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_veg: boolean
          is_available: boolean
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_veg?: boolean
          is_available?: boolean
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_veg?: boolean
          is_available?: boolean
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          customer_name: string
          status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          order_type: 'dine-in' | 'takeaway'
          table_number: number | null
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          customer_name: string
          status?: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          order_type?: 'dine-in' | 'takeaway'
          table_number?: number | null
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          customer_name?: string
          status?: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          order_type?: 'dine-in' | 'takeaway'
          table_number?: number | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'waiter'
      order_status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
      order_type: 'dine-in' | 'takeaway'
      booking_status: 'confirmed' | 'cancelled' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
