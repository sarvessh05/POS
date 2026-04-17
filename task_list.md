# 🍽️ POS WT — Restaurant System Task List

## Project Snapshot
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Supabase + Clerk Auth  
**Current state:** Basic scaffolding exists — customer pages (Home, Menu, Cart, Booking), stub Admin & Waiter pages, all using mock data. No Supabase integration in UI, no QR flow, no KOT generation.

---

## 🗃️ Phase 0 — Database & Backend Foundations

> All real data flows start here. Tackle this before any UI wiring.

- [x] **Schema overhaul** — extend Supabase migration:
  - [x] Add `tables` table (`id`, `number`, `qr_token` UUID, `captain_id`, `section`, `seat_count`)
  - [x] Add `captains` table (`id`, `name`, `pin` VARCHAR(6), `assigned_table_ids[]`) — PIN set by Admin
  - [x] Add `kot` table (`id`, `order_id`, `printed_at`, `status: pending|printed`)
  - [x] Add `bills` table (`id`, `order_id`, `subtotal`, `tax_rate`, `tax_amount`, `tip`, `split_count`, `payment_method: upi|cash`, `paid_at`)
  - [x] Add `tax_config` table (`id`, `gst_rate`, `service_charge_rate`, `updated_by`)
  - [x] Add `is_exhausted` boolean column to `menu_items`
  - [x] Update `orders` — add `captain_id`, `kot_generated_at`, `bill_id`
  - [x] Write RLS policies for captain (own tables only), customer (own session), admin (all)
- [x] **Supabase Realtime** — enable channels for `orders`, `kot`, `menu_items`
- [x] **QR token generator** — edge function / script to generate & assign `qr_token` per table
- [x] **Authentication Strategy**:
  - [x] **Admin**: Supabase Auth (Email/Password)
  - [x] **Captain**: PIN-based login (Admin sets name/PIN, Captain dials in)
- [x] Remove Clerk dependency if unnecessary.

---

## 🌐 Phase 1 — Landing Page (Public Restaurant Website)

> Restaurant's public-facing marketing site. Mobile-responsive.

- [x] **Navbar** — logo, nav links (Home, Menu, Book a Table), sticky with blur backdrop
- [x] **Hero Section** — full-screen, restaurant ambience image/video background, CTA buttons ("View Menu", "Book a Table")
- [x] **About / Story Section** — short restaurant blurb, warm imagery
- [x] **Menu Preview Section** — read-only category grid + dish cards (no Add to Cart), pulls live from Supabase `menu_items` (skips `is_exhausted=true` or shows "Sold Out" badge)
- [x] **Book a Table Page** (`/booking`) — date picker, time slot, guest count, name+phone form → writes to `table_bookings`
- [x] **Offers / Highlights Section** — static promotional banners
- [x] **Footer** — address, social links, hours; hidden dev links to Captain & Admin (tiny gray text, no obvious buttons)
- [x] Responsive for mobile + desktop

---

## 📱 Phase 2 — Dine / Customer Screen (QR-based, Mobile-first)

> Opened via QR scan at table. Most animated screen. Mobile UX priority.

### QR & Table Binding
- [x] Route: `/dine/:qr_token` — on load, validate token → fetch table record → store `table_id` + `table_number` in session/context
- [x] If invalid token → friendly error screen

### Menu Experience (Animations Priority ⚡)
- [x] **3D Dish Cards** using Stitch MCP — generate immersive 3D food imagery, integrate as card hero images
- [x] Hover effects: card lift + shadow bloom + subtle plate spin on dish image
- [x] Category filter tabs — sliding pill indicator animation
- [x] Smooth scroll-based entrance animations (Intersection Observer)
- [x] Skeleton loaders while fetching menu
- [x] Items marked `is_exhausted` → greyed out with animated "Sold Out" stamp
- [x] Veg/Non-Veg toggle with animated switch

### Cart & Order
- [x] Floating cart bubble (count badge, wiggle on add)
- [x] Cart sheet — slide-up drawer, item quantity controls with spring animation
- [x] Special instructions per item (text input)
- [x] **Order Confirmation** — confetti burst animation on placing order

### Rating Flow (triggers before bill)
- [x] When customer taps **Request Bill** → full-screen modal: *"How was your experience?"*
- [x] If **Yes, Rate** → show per-dish 1–5 star rating cards (one card per ordered dish, swipe-able), submit ratings to `dish_ratings` table, then proceed to bill
- [x] If **Skip** → go directly to bill
- [x] Rating cards: animated star fill, dish image thumbnail, spring bounce on star tap

### Billing & Payment (Key Feature)
- [x] **Bill UI — Physical Receipt Aesthetic** (wow factor):
  - [x] Render as a styled paper receipt: cream/off-white background, dashed dividers, monospace font for amounts, restaurant logo + name at top, "Thank You" footer
  - [x] Default view shows only: dish names + quantities + **grand total** — NO tax math visible by default
  - [x] Expandable "View Breakdown" accordion → reveals subtotal, GST, service charge, tip line-by-line (slides open with animation)
  - [x] Subtle torn-paper edge CSS on top and bottom of the receipt card
  - [x] Entry animation: receipt slides up from bottom and "prints" line by line
- [x] **Split Bill** — animated bill-tear effect: receipt card visually tears into 2/3/4 pieces (CSS clip-path animation), each piece shows that person's share amount
- [x] Tip selector — fixed cards: ₹10 / ₹20 / ₹50, highlight selected with scale+glow animation
- [x] Tax line — fetched from `tax_config` (admin-set), hidden by default, visible in breakdown accordion
- [x] **UPI Payment** — "Pay via UPI" button shows restaurant's static QR code (stored in env/DB), overlay with amount; "I've Paid" marks session as paid (no gateway)
- [x] Cash option — "Pay at Counter" button
- [x] Post-payment: confetti burst + "See you again!" success screen

### Order History (in-session)
- [x] Customer can view their full order history for the current table session (all items ordered so far, even before bill)
- [x] "Order More" button returns to menu with session preserved

---

## 👨‍🍳 Phase 3 — Captain's Page (Table-assigned Waiter View)

> Minimal UI, functional-first. Accessed via footer dev link (no nav button).

- [x] **New Route**: `/captain`
- [x] **Captain Login (Dial Pad)** (wow factor):
  - [x] 6-digit dial pad interface with glassmorphism + dark slate theme
  - [x] PIN verification against `captains` table
  - [x] Smooth transition to dashboard on success
- [x] **Order List (Live Feed)**:
  - [x] Split view: "New Orders" (pending KOT) vs "KOT Generated" (in service)
  - [x] Detailed order cards: Dish name, quantity, timestamp, special instructions
  - [x] Realtime listener: Notification sound + visual pulse when a new order arrives
- [x] **Captain Actions**:
  - [x] "Generate KOT" button: Writes `kot_generated_at`, marks `kot.status = printed`
  - [x] "Mark as Served" button: For printed orders, transitions them out of view
  - [x] **Request Bill Handling**: Special priority cards for tables that clicked "Request Bill"
  - [x] **Finish Table**: Button to set `table.status = billing`, triggering the Final Receipt for the customer
- [x] **Print-Friendly KOT View**: A simplified layout that captains can use for physical printing if needed (or digital log)

---

## 🏢 Phase 4 — Owner / Admin Dashboard

> Full control panel. Accessed via footer dev link. Minimal but information-rich.

- [x] Route: `/admin` (dev footer link only)
- [x] **Admin login** — Supabase Auth or hardcoded credential gate

### Revenue & Analytics
- [x] Today's revenue, order count, average order value (live from `bills` + `orders`)
- [x] Revenue chart — daily/weekly/monthly toggle (Recharts, already in deps)
- [x] Table occupancy overview
- [x] Most ordered dishes (aggregated from `order_items`)

### Menu Management
- [x] List all dishes with category, price, veg/non-veg toggle, availability toggle
- [x] **Add Dish** — form: name, category, description, price, image upload (Supabase Storage), veg flag
- [x] **Edit Dish** — inline edit or modal
- [x] **Delete Dish** — confirmation dialog
- [x] **Mark as Exhausted** — toggle per dish; exhausted items hidden from customer QR menu
- [x] Manage Categories — add/rename/delete categories

### Table & Captain Management
- [x] List all tables with QR token status
- [x] **Generate / Regenerate QR** per table → downloadable QR image
- [x] Add/remove captains, assign tables to captains

### Tax & Config
- [x] Set GST rate (%), service charge rate (%)
- [x] Toggle whether to show service charge on bill
- [x] Save settings → updates `tax_config` table
- [x] Live all-orders feed with filters: table, status, date range
- [x] KOT history view

---

## 🎨 Phase 5 — Design System & Polish

### Animation Guidelines
- [x] **Customer screen only** — rich animations (3D cards, bill tear, confetti, hover effects)
- [x] **Captain & Admin** — zero decorative animations, clean transitions only

### Stitch MCP — 3D Dish Imagery
- [x] Use Stitch MCP to generate 3D food illustrations/renders per dish category
- [x] Apply as hero images on customer menu cards
- [x] Generate hero banner image for landing page

### Styling Tokens
- [x] Audit existing Tailwind config — ensure color tokens (gold, sage, terracotta) are used consistently
- [x] Google Font pairing — Display font for headings, clean sans for body
- [x] Dark mode support (customer screen especially)

### Responsiveness
- [x] Customer screen → 375px mobile-first, tested up to 430px
- [x] Landing page → full responsive (375px → 1440px)
- [x] Captain → mobile-optimized (min 375px)
- [x] Admin → desktop-optimized (min 1024px)

---

## 🔌 Phase 6 — Integration & Wiring

- [x] Replace all `mockData` imports with Supabase queries (`useQuery` + `supabase.from(...)`)
- [x] Wire `CartContext` to post orders to Supabase on checkout
- [x] Captain KOT flow → write to `kot` table, trigger Realtime event
- [x] Admin menu changes → invalidate customer menu cache (React Query)
- [x] `is_exhausted` changes reflect immediately on customer screen via Realtime

---

## 🧪 Phase 7 — Testing & QA

- [x] Test QR token flow end-to-end (scan → table bind → order → bill)
- [x] Split bill UI test — 2/3/4 pax splits with correct math
- [x] Tax calculation — verify GST + service charge applied correctly
- [x] Captain filter test — ensure captain only sees own tables' orders
- [x] Admin menu CRUD — add/edit/delete/exhaust cycle
- [x] Realtime test — new order appears on captain page without refresh
- [x] Mobile responsiveness — customer screen on actual phone (or DevTools 390px)

---

## 💡 Additional Features (Included)

| Feature | Phase | Status |
|---|---|---|
| Order history per table session | Phase 2 | [x] |
| Dish ratings before bill | Phase 2 | [x] |
| Printer-friendly KOT PDF | Phase 3 | [x] |
| Notification sound on new order | Phase 3 | [x] |
| Captain Dial Pad Login | Phase 3 | [x] |

### Captain additions
- [x] **Notification sound** — play a chime when a new order arrives via Realtime (browser Audio API, toggle-able)
- [x] **Print KOT as PDF** — `window.print()` styled KOT view or html-to-pdf; shows table #, items, time, special instructions
- [x] **Daily closing report** — button to generate end-of-day summary: total revenue, orders, top dishes, tips collected
- [x] Export as PDF or printable page via `window.print()`

---

## ❌ Out of Scope (Explicitly)

- No payment gateway integration (UPI is QR-show only)
- No customer account / sign-up (anonymous session by table)
- No online delivery / takeaway ordering from QR
- No multi-branch support (single restaurant instance)

---

## 🛣️ Suggested Build Order

```
Phase 0 (DB) → Phase 1 (Landing) → Phase 3 (Captain MVP) → Phase 2 (Customer QR) → Phase 4 (Admin) → Phase 5 (Polish) → Phase 6 (Integration) → Phase 7 (QA)
```

> Build Captain before Customer so the KOT receiving side is ready when orders start flowing.
