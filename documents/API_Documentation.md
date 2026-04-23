# 🔌 API Documentation

> **Status**: Active
> **Version**: 1.0.0
> **Protocol**: REST / Realtime WebSockets
> **Provider**: Supabase BaaS

## 1. Overview

This POS system interacts with a backend via the Supabase client library. The data layer is powered by PostgreSQL. Instead of standard REST HTTP endpoints, the client executes RPC calls and direct table mutations using the `@supabase/supabase-js` SDK.

## 2. Authentication Flow

| Method | Description | Implementation |
| :--- | :--- | :--- |
| `supabase.auth.signInWithPassword` | Captain/Admin Login | Uses email and password. |
| `supabase.auth.signOut` | Session Termination | Clears local storage and invalidates token. |

## 3. Database Entities & API Methods

### 3.1 Tables / Sessions (`tables`)

#### `GET /tables`
Retrieves all tables and their statuses.
```typescript
const { data, error } = await supabase
  .from('tables')
  .select('*, captains(name)')
  .order('number', { ascending: true });
```

#### `UPDATE /tables/:id`
Updates table status (e.g., `available`, `occupied`, `billing`).
```typescript
const { error } = await supabase
  .from('tables')
  .update({ status: 'occupied' })
  .eq('id', tableId);
```

### 3.2 Orders & Kitchen Order Tickets (KOT) (`orders`, `order_items`)

#### `POST /orders`
Creates a new order.
```typescript
const { data, error } = await supabase
  .from('orders')
  .insert([{ order_type, table_id, total_amount, status: 'pending' }])
  .select()
  .single();
```

#### `GET /orders/active`
List active orders for captains.
```typescript
const { data, error } = await supabase
  .from('tables')
  .select('*, orders(*, order_items(*, menu_items(*)))')
  .order('number', { ascending: true });
```

### 3.3 Menu Items & Categories

#### `GET /categories`
Fetches menu categories.
```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('display_order', { ascending: true });
```

#### `GET /menu_items`
Fetches menu items, optionally filtered by category.
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*, categories(name)')
  .eq('category_id', categoryId); // Optional
```

## 4. Realtime Channels

The system relies heavily on WebSockets to push updates to clients.

| Channel Name | Event Type | Trigger Condition |
| :--- | :--- | :--- |
| `captain_realtime` | `INSERT` on `orders` | A customer places a new order. |
| `captain_realtime` | `UPDATE` on `tables` | A table requests a bill. |
| `menu_items_changes`| `*` on `menu_items` | Admin modifies pricing or availability. |
| `table_status_:id` | `UPDATE` on `tables` | Realtime status lock for a specific table. |

## 5. Error Codes

| Code | Meaning | Resolution |
| :--- | :--- | :--- |
| `401` | Unauthorized | User session expired or missing token. |
| `PGRST116` | Not Found | Requested record does not exist. |
| `23505` | Unique Violation | Attempted to insert a duplicate record. |
| `RLS_ERROR` | Row Level Security | User is not permitted to read/write this row. |
